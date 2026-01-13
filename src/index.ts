import { Command, Option } from "commander";
import { generateCommitMessage } from "./ai";
import { commit, isGitRepo, stageAll } from "./git-helpers";

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
	console.log(`Working on directory: ${cwd}`);

	if (!(await isGitRepo(cwd))) {
		console.error("Not a git repository");
		process.exit(1);
	}

	if (!options.staged && !options.all) {
		console.error("At least one option must be provided: -s or -a");
		process.exit(1);
	}

	if (options.all) {
		await stageAll();
	}

	const commitMessage = await generateCommitMessage();

	console.log(commitMessage);

	if (options.commit) {
		await commit(commitMessage);
	}
}
