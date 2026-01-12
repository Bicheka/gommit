import { exists } from "node:fs/promises";
import { join } from "node:path";
import * as toml from "@iarna/toml";
import envPaths from "env-paths";
import { wizard } from "./prompts";
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
	AI_API_URL: "http://localhost:11434/api/generate",
	numberOfResponses: 1,
};

function normalizeWizardInput(input: WizardInput): Config {
	// parse/validate wizard input first
	const parsedInput = WizardInputSchema.parse(input);

	// merge defaults for missing values
	const configObj: Config = {
		provider: parsedInput.provider,
		aiModel: parsedInput.aiModel,
		prompt: DEFAULTS.prompt,
		apiUrl: parsedInput.apiUrl ?? DEFAULTS.AI_API_URL,
		numberOfResponses: parsedInput.numberOfResponses
			? Number(parsedInput.numberOfResponses)
			: DEFAULTS.numberOfResponses,
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
	const configPath = join(paths.config, "config.toml");
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
