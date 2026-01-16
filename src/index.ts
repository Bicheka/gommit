import { intro, log, outro, spinner } from "@clack/prompts";
import clipboard from "clipboardy";
import { Command, Option } from "commander";
import color from "picocolors";
import { generateCommitMessage } from "./ai";
import {
	editConfig,
	getConfig,
	getKeys,
	runWizard,
	setConfig,
} from "./config/set-up";
import { commit, isGitRepo, stageAll } from "./git-helpers";
import { confirmAction, referenceIssues } from "./prompts";

const program = new Command();

program
	.name("gommit")
	.description("Tool to make creating commit messages easier")
	.version("0.1.0");

program
	.addOption(new Option("-a, --all", "All changes staged and unstaged"))
	.addOption(new Option("-c, --commit", "Use generated message to commit"))
	.addOption(
		new Option(
			"-d, --directory <directory>",
			"Specific directory path to git repository",
		),
	)
	.action(run);

const configCommand = program.command("config");

configCommand
	.command("wizard")
	.description("Run setup wizard again")
	.action(runWizard);

configCommand
	.command("set")
	.arguments("<key> <value>")
	.description("Set a config value")
	.action(setConfig);

configCommand
	.command("get keys")
	.description("Get a list of possible keys")
	.action(getKeys);

configCommand
	.command("edit")
	.description("Edit config in editor")
	.action(editConfig);

await program.parseAsync();

async function run(options: {
	staged?: boolean;
	all?: boolean;
	commit?: boolean;
	directory?: string;
}) {
	intro(color.inverse("gommit"));

	// if directory is defined change the current working directory to that directory
	if (options.directory) {
		process.chdir(options.directory);
	}

	const cwd = process.cwd();
	log.info(`Working on directory: ${cwd}`);

	if (!(await isGitRepo(cwd))) {
		console.error("Not a git repository");
		process.exit(1);
	}

	if (options.all) {
		await stageAll();
	}

	let commitMessage = "";
	let action: string | symbol = "";

	const config = await getConfig();

	const issues = await referenceIssues();

	const s = spinner();
	while (true) {
		s.start("Generating");

		commitMessage = await generateCommitMessage(config);

		commitMessage = appendIssues(commitMessage, issues.issues);

		s.stop(commitMessage);

		if (options.commit) {
			await commit(commitMessage);
			break;
		}

		action = await confirmAction();

		if (action === "commit") {
			await commit(commitMessage);
			break;
		}

		if (action === "copy") {
			await clipboard.write(commitMessage);
			break;
		}

		if (action === "cancel") {
			process.exit(0);
		}

		if (action === "regen") {
			log.info("Regenerating");
		}
	}

	outro("All done!");
}

function appendIssues(message: string, issues?: string): string {
	message = message.trim();
	if (!/[.!?]$/.test(message)) message += ".";
	if (issues) message += ` ${issues}`;
	return message;
}
