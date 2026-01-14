import { exists } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "bun";

export async function stageAll() {
	await spawn({ cmd: ["git", "add", "."] }).exited;
}

export async function commit(message: string) {
	await spawn({
		cmd: ["git", "commit", "-m", message],
		stdout: "inherit",
		stderr: "inherit",
	}).exited;
}

export async function getDiff(): Promise<string> {
	const args = [
		"diff",
		"--staged",
		"--",
		".",
		":(exclude)*.lock",
		":(exclude)pnpm-lock.yaml",
	];
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
