import type { Config } from "../config/schema";
import type { AIClient } from ".";

type OllamaGenerateRequest = {
	model: string;
	prompt: string;
	stream?: boolean;
};

type OllamaGenerateResponse = {
	response: string;
};

export const OllamaClient: AIClient = {
	async generateCommitMessage(config: Config, prompt): Promise<string> {
		const res = await fetch(config.apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: config.aiModel,
				prompt,
				stream: false,
			} satisfies OllamaGenerateRequest),
		});

		if (!res.ok) {
			throw new Error(`Ollama error: ${res.statusText}`);
		}

		const data = (await res.json()) as OllamaGenerateResponse;
		return data.response;
	},
};
