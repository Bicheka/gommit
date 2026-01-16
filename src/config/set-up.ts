import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { exists } from "node:fs/promises";
import { join } from "node:path";
import { log } from "@clack/prompts";
import * as toml from "@iarna/toml";
import envPaths from "env-paths";
import { wizard } from "../prompts";
import {
	type Config,
	ConfigSchema,
	type WizardInput,
	WizardInputSchema,
} from "./schema";

const paths = envPaths("gommit", { suffix: "" });

const DEFAULTS = {
	prompt: `
  You are a senior software engineer and expert at writing git commit messages.

  - Read the staged changes provided below.
  - Generate a **concise commit message** that accurately describes the changes.
  - Use **imperative mood**.
  - Use **Conventional Commit format** if possible (feat, fix, chore, etc.).
  - Do **NOT** include any explanations, summaries, or extra text — only output the commit message.

  Staged changes:
  `,
	gitArgs: [
		"diff",
		"--staged",
		"--",
		".",
		":(exclude)*.lock",
		":(exclude)pnpm-lock.yaml",
	],
};

function getConfigPath() {
	return join(paths.config, "config.toml");
}

function normalizeWizardInput(input: WizardInput): Config {
	// parse/validate wizard input first
	const parsedInput = WizardInputSchema.parse(input);

	// merge defaults for missing values
	const configObj: Config = {
		provider: parsedInput.provider,
		aiModel: parsedInput.aiModel,
		prompt: DEFAULTS.prompt,
		apiUrl: parsedInput.apiUrl,
		apiKey: parsedInput.apiKey,
		numberOfResponses: Number(parsedInput.numberOfResponses),
		gitArgs: DEFAULTS.gitArgs,
	};

	// validate full config against ConfigSchema
	return ConfigSchema.parse(configObj);
}

async function loadConfig(path: string): Promise<Config> {
	const file = await Bun.file(path).text();
	const parsed = toml.parse(file);
	return ConfigSchema.parse(parsed);
}
async function saveConfig(input: WizardInput, path: string) {
	const config = normalizeWizardInput(input);
	const tomlString = toml.stringify(config);
	Bun.write(path, tomlString);
	return config;
}

export async function getConfig(): Promise<Config> {
	let config: Config | null = null;
	const configPath = getConfigPath();
	if (await exists(configPath)) {
		config = await loadConfig(configPath);
	} else {
		const wizardInput = await wizard(configPath);
		config = await saveConfig(wizardInput, configPath);
	}
	if (!config) {
		console.error(`Config could not be loaded`);
		process.exit(0);
	}
	return config;
}

export async function runWizard(): Promise<void> {
	const configPath = getConfigPath();
	const wizardInput = await wizard(configPath);
	await saveConfig(wizardInput, configPath);
}

export async function setConfig(key: string, value: string) {
	if (!key || !value) {
		console.error(
			"To set a config param you must provide a set for key value pairs like `gommit config set <key> <value>`",
		);
		process.exit(1);
	}

	// check if config exists
	const configPath = getConfigPath();
	if (!(await exists(configPath))) {
		console.error(
			"Program has not been initialized and configured yet run gommit",
		);
		process.exit(1);
	}

	// get current config
	const currentConfig: Config = await loadConfig(configPath);
	if (!currentConfig) {
		console.error("Program could not load config");
		process.exit(1);
	}
	if (!isConfigKey(key, currentConfig)) {
		console.error(`Unknown config key: ${key}`);
		process.exit(1);
	}

	// coerce types if needed
	const newValue =
		key === "numberOfResponses"
			? Number(value)
			: key === "gitArgs"
				? value.split(",").map((v) => v.trim())
				: value;

	const updatedConfig: Config = {
		...currentConfig,
		[key]: newValue,
	};

	// final schema validation
	const validated = ConfigSchema.parse(updatedConfig);

	await Bun.write(configPath, toml.stringify(validated));
}

function isConfigKey(key: string, config: Config): key is keyof Config {
	return key in config;
}

export async function getKeys() {
	const configPath = getConfigPath();
	if (!(await exists(configPath))) {
		console.error(
			"Program has not been initialized and configured yet run gommit",
		);
		process.exit(1);
	}

	// get current config
	const currentConfig: Config = await loadConfig(configPath);
	if (!currentConfig) {
		console.error("Program could not load config");
		process.exit(1);
	}

	const objectKeys = <T extends object>(obj: T): (keyof T)[] =>
		Object.keys(obj) as (keyof T)[];

	const keys = objectKeys(currentConfig);
	log.success(keys.join(" | "));
}

export async function editConfig(): Promise<void> {
	const configPath = getConfigPath();

	if (!existsSync(configPath)) {
		console.error("Config does not exist. Run gommit first.");
		process.exit(1);
	}

	const editor =
		process.env.EDITOR ||
		process.env.VISUAL ||
		(process.platform === "win32" ? "notepad" : "nano");

	const result = spawnSync(editor, [configPath], {
		stdio: "inherit",
	});

	if (result.error) {
		console.error(`Failed to open editor: ${result.error.message}`);
		process.exit(1);
	}

	// Re-validate after editing
	try {
		const file = await Bun.file(configPath).text();
		toml.parse(file); // quick sanity check
	} catch (_err) {
		console.error("Config file is invalid after editing.");
		process.exit(1);
	}
}
