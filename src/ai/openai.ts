import OpenAI from "openai";
import type { Config } from "../config/schema";
import type { AIClient } from ".";

export const OpenAIClient: AIClient = {
	async generateCommitMessage(
		config: Config,
		_prompt: string,
	): Promise<string> {
		if (!config.apiKey) {
			throw new Error(
				"OpenAI API key is missing. Set it via `config` or `OPENAI_API_KEY` environment variable.",
			);
		}

		const client = new OpenAI({ apiKey: config.apiKey });

		try {
			const response = await client.responses.create({
				model: config.aiModel,
				input: config.prompt,
			});

			const outputText = response.output_text?.trim();
			if (!outputText) {
				throw new Error("OpenAI returned no output text.");
			}

			return outputText;
		} catch (err: unknown) {
			// Handle known errors
			if (err instanceof Error) {
				const msg = err.message.toLowerCase();

				if (msg.includes("invalid") || msg.includes("unauthorized")) {
					console.error("OpenAI API key invalid or unauthorized.");
				} else if (msg.includes("quota") || msg.includes("exceeded")) {
					console.error(
						"OpenAI quota exceeded. Please wait or upgrade your plan.",
					);
				} else if (msg.includes("network") || msg.includes("fetch")) {
					console.error(
						"Network error while contacting OpenAI. Check your connection.",
					);
				} else {
					console.error("OpenAI error:", err.message);
				}
			} else {
				console.error("Unknown error contacting OpenAI:", err);
			}

			// Exit the CLI cleanly
			process.exit(1);
		}
	},
};
