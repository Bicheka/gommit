import type { Config } from "../config/schema";
import { getDiff } from "../git-helpers";
import { GoogleGenAIClient } from "./google";
import { OllamaClient } from "./ollama";
import { OpenAIClient } from "./openai";
export interface AIClient {
	generateCommitMessage(config: Config, prompt: string): Promise<string>;
}

const aiClients: Record<string, AIClient> = {
	ollama: OllamaClient,
	openai: OpenAIClient,
	google: GoogleGenAIClient,
};

function buildAIClient(provider: string): AIClient {
	const client = aiClients[provider.toLowerCase()];
	if (!client) throw new Error(`Unknown AI provider: ${provider}`);
	return client;
}

export async function generateCommitMessage(config: Config): Promise<string> {
	const changes = await getDiff(config.gitArgs);

	if (!changes.trim()) {
		console.error("Working tree clean");
		process.exit(1);
	}

	const ai = buildAIClient(config.provider);

	const prompt = `${config.prompt}\n\n${changes}`;
	return ai.generateCommitMessage(config, prompt);
}
