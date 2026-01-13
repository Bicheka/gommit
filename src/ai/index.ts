import type { Config } from "../config/schema";
import { getConfig } from "../config/set-up";
import { getDiff } from "../git-helpers";
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

function buildAIClient(provider: string): AIClient {
	const client = aiClients[provider.toLowerCase()];
	if (!client) throw new Error(`Unknown AI provider: ${provider}`);
	return client;
}

export async function generateCommitMessage(
): Promise<string> {
	const changes = await getDiff();

	if (!changes.trim()) {
		console.error("Working tree clean");
		process.exit(1);
	}

	const config = await getConfig();
	const ai = buildAIClient(config.provider);

	const prompt = `${config.prompt}\n\n${changes}`;
	return ai.generateCommitMessage(config, prompt);
}
