import { Command, Option } from "commander";
import { spawn } from "bun";
import { exists } from "node:fs/promises";
import { join } from "node:path";
import { generateText } from "./ollama";
import { confirmPrompt, getIssueNumber } from "./prompt";
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
    if (options.directory) {
      process.chdir(options.directory);
    }
    console.log("Working on directory: " + process.cwd());

    if (!(await isGitRepo(options.directory))) {
      console.log(options.directory + " is not a git repository");
    } else if (!options.staged && !options.all) {
      console.log("At least one option must be provided -s or -a");
    } else {
      let commitMessage = "";
      
      if (options.staged) {
        commitMessage = await sendChagesToAi();
        console.log("\nGenerated commit message:");
        console.log(commitMessage);
      } else if (options.all) {
        // stage untracked files
        await stageUntracked();
        commitMessage = await sendChagesToAi();
        console.log("\nGenerated commit message:");
        console.log(commitMessage);
      }

      // Ask about issue linking
      const issueReference = await promptForIssueReference();
      if (issueReference) {
        commitMessage = `${commitMessage}\n\n${issueReference}`;
        console.log("\nUpdated commit message:");
        console.log(commitMessage);
      }

      if (options.commit) {
        await executeCommit(commitMessage);
        console.log("\n✅ Commit created successfully!");
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
  } else {
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

    return await generateText(prompt);
  }
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
  console.log(); // Add spacing
  const isRelated = await confirmPrompt("Is this commit related to an issue? (y/n): ");
  
  if (!isRelated) {
    return null;
  }
  
  const issueNumber = await getIssueNumber();
  
  if (!issueNumber) {
    return null;
  }
  
  const shouldClose = await confirmPrompt("Should this commit close the issue? (y/n): ");
  
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
