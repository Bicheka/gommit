import { Command, Option } from "commander";
import { spawn } from "bun";
import { exists } from "node:fs/promises";
import { join } from "node:path";
import { generateText } from "./ollama";
import { confirmPrompt, getIssueNumber } from "./prompt";
import { intro, outro, log, spinner } from "@clack/prompts";
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
    intro("gommit");

    if (options.directory) {
      process.chdir(options.directory);
    }

    if (!(await isGitRepo(options.directory))) {
      log.error(options.directory + " is not a git repository");
      process.exit(1);
    }

    if (!options.staged && !options.all) {
      log.error("At least one option must be provided -s or -a");
      process.exit(1);
    }

    let commitMessage = "";
    
    if (options.staged) {
      commitMessage = await sendChagesToAi();
      log.step("Generated commit message:");
      console.log(commitMessage);
    } else if (options.all) {
      // stage untracked files
      await stageUntracked();
      commitMessage = await sendChagesToAi();
      log.step("Generated commit message:");
      console.log(commitMessage);
    }

    // Ask about issue linking
    const issueReference = await promptForIssueReference();
    if (issueReference) {
      commitMessage = `${commitMessage}\n\n${issueReference}`;
      log.step("Updated commit message:");
      console.log(commitMessage);
    }

    if (options.commit) {
      await executeCommit(commitMessage);
      outro("Commit created successfully!");
    } else {
      outro("Commit message generated. Use -c flag to commit.");
    }
  });

await program.parseAsync();

async function sendChagesToAi(): Promise<string> {
  // get git staged changes
  const changes = await getChanges("--staged");
  if (!changes) {
    log.error("Working tree clean");
    process.exit(1);
  }

  const s = spinner();
  s.start("Generating commit message...");

  // send changes to AI model to create a commit message
  const prompt = `
  You are a senior software engineer and expert at writing git commit messages.

  - Read the staged changes provided below.
  - Generate a **concise commit message** that accurately describes the changes.
  - Use **imperative mood**.
  - Use **Conventional Commit format** if possible (feat, fix, chore, etc.).
  - Do **NOT** include any explanations, summaries, or extra text — only output the commit message.

  Staged changes:
  ${changes}
  `;

  const message = await generateText(prompt);
  s.stop("Commit message generated");
  
  return message;
}

async function stageUntracked() {
  const proc = spawn({ 
    cmd: ["git", "add", "."],
    stdout: "pipe",
    stderr: "pipe"
  });
  await proc.exited;
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

/**
 * Prompts user for issue reference and returns the appropriate GitHub keyword
 * @returns Issue reference string (e.g., "Closes #123" or "Refs #456") or null
 */
async function promptForIssueReference(): Promise<string | null> {
  const isRelated = await confirmPrompt("Is this commit related to an issue?");
  
  if (!isRelated) {
    return null;
  }
  
  const issueNumber = await getIssueNumber();
  
  if (!issueNumber) {
    return null;
  }
  
  const shouldClose = await confirmPrompt("Should this commit close the issue?");
  
  if (shouldClose) {
    return `Closes #${issueNumber}`;
  } else {
    return `Refs #${issueNumber}`;
  }
}

/**
 * Executes git commit with the provided message
 */
async function executeCommit(message: string): Promise<void> {
  const proc = spawn({
    cmd: ["git", "commit", "-m", message],
    stdout: "pipe",
    stderr: "pipe",
  });

  await proc.exited;
  
  if (proc.exitCode !== 0) {
    const error = await new Response(proc.stderr).text();
    throw new Error(`Git commit failed: ${error}`);
  }
}
