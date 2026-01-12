import type { Config } from "../config/schema";
import { OllamaClient } from "./ollama";
export interface AIClient {
	generateCommitMessage(config: Config, prompt: string): Promise<string>;
}

const aiClients: Record<string, AIClient> = {
	ollama: OllamaClient,
	// TODO add more providers e.g.
	// openai:
	// gemini
	// claude
	// ...
};

export function buildAIClient(provider: string): AIClient {
	const client = aiClients[provider.toLowerCase()];
	if (!client) throw new Error(`Unknown AI provider: ${provider}`);
	return client;
}
