import { exists } from "node:fs/promises";
import { join } from "node:path";
import { log } from "@clack/prompts";
import { spawn } from "bun";

export async function stageAll() {
	await spawn({ cmd: ["git", "add", "."] }).exited;
}

export async function commit(message: string) {
	const proc = spawn({
		cmd: ["git", "commit", "-m", message],
		stdout: "pipe",
		stderr: "pipe",
	});

	const stdout = new Response(proc.stdout).text();
	const stderr = new Response(proc.stderr).text();
	await proc.exited;

	if ((await stdout).trim()) log.info(await stdout);
	if ((await stderr).trim()) log.error(await stderr);
}

export async function getDiff(args: string[]): Promise<string> {
	const cmd = ["git", ...args];

	const proc = spawn({
		cmd,
		stdout: "pipe",
		stderr: "pipe",
	});

	return new Response(proc.stdout).text();
}

export async function isGitRepo(directory: string): Promise<boolean> {
	return exists(join(directory, ".git"));
}
