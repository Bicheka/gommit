import { exists } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "bun";
import { Command, Option } from "commander";
import { buildAIClient } from "./ai";
import { getConfig } from "./config/set-up";

const program = new Command();

program
	.name("gommit")
	.description("Tool to make creating commit messages easier")
	.version("0.1.0");

program
	.addOption(new Option("-s, --staged", "Only staged changes").conflicts("all"))
	.addOption(new Option("-a, --all", "All changes staged and unstaged"))
	.addOption(new Option("-c, --commit", "Use generated message to commit"))
	.addOption(
		new Option(
			"-d, --directory <directory>",
			"Specific directory path to git repository",
		),
	)
	.action(async (options) => {
		const _config = await getConfig();

		if (options.directory) {
			process.chdir(options.directory);
		}
		console.log(`Working on directory: ${process.cwd()}`);

		if (!(await isGitRepo(options.directory))) {
			console.log(`${options.directory} is not a git repository`);
		} else if (!options.staged && !options.all) {
			console.log("At least one option must be provided -s or -a");
		} else {
			if (options.staged) {
				const response = await sendChagesToAi();
				console.log(response);
			} else if (options.all) {
				// stage untracked files
				stageUntracked();
			}

			if (options.commit) {
			}
		}
	});

await program.parseAsync();

async function sendChagesToAi(): Promise<string> {
	// get git staged changes
	const changes = await getChanges("--staged");
	if (!changes) {
		console.log("Working tree clean");
		process.exit(1);
	}
	const config = await getConfig();

	// generate full prompt attatching the changes to the config prompt
	const fullPrompt = `${config.prompt} \n ${changes}`;

	const ai = buildAIClient(config.provider);
	return await ai.generateCommitMessage(config, fullPrompt);
}

async function stageUntracked() {
	spawn({ cmd: ["git", "add", "."] });
}

async function getChanges(option: string): Promise<string> {
	const proc = spawn({
		cmd: ["git", "diff", option],
		stdout: "pipe",
		stderr: "pipe",
	});

	return await new Response(proc.stdout).text();
}

async function isGitRepo(directory?: string): Promise<boolean> {
	directory ??= process.cwd();
	const gitFolder = join(directory, ".git");
	return await exists(gitFolder);
}
