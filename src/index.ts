import { log } from "@clack/prompts";
import clipboard from "clipboardy";
import { Command, Option } from "commander";
import { generateCommitMessage } from "./ai";
import { commit, isGitRepo, stageAll } from "./git-helpers";
import { confirmAction } from "./prompts";

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

await program.parseAsync();

async function run(options: {
	staged?: boolean;
	all?: boolean;
	commit?: boolean;
	directory?: string;
}) {
	// if directory is defined change the current working directory to that directory
	if (options.directory) {
		process.chdir(options.directory);
	}

	const cwd = process.cwd();
	log.message(`Working on directory: ${cwd}`);

	if (!(await isGitRepo(cwd))) {
		console.error("Not a git repository");
		process.exit(1);
	}

	if (options.all) {
		await stageAll();
	}

	let commitMessage = "";
	let action: string | symbol = "";
	while (true) {
		commitMessage = await generateCommitMessage();

		log.message(commitMessage);

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
}
