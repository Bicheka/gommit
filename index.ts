// import { Command } from "commander";
// const program = new Command();

// program
//   .name("string-util")
//   .description("CLI to some JavaScript string utilities")
//   .version("0.8.0");

// program
//   .command("split")
//   .description("Split a string into substrings and display as an array")
//   .argument("<string>", "string to split")
//   .option("--first", "display just the first substring")
//   .option("-s, --separator <char>", "separator character", ",")
//   .action((str, options) => {
//     const limit = options.first ? 1 : undefined;
//     console.log(str.split(options.separator, limit));
//   });

// program.parse();

import { spawn } from "bun";

const proc = spawn({
  cmd: ["git", "diff", "HEAD"],
  stdout: "pipe",
  stderr: "pipe",
});

const output = await new Response(proc.stdout).text();

if (output.trim().length === 0) {
  console.log("Working tree clean");
} else {
  console.log("Uncommitted changes:");
  console.log(output);
}
