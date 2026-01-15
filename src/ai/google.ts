import { GoogleGenAI } from "@google/genai";
import type { Config } from "../config/schema";
import type { AIClient } from "./index";

export const GoogleGenAIClient: AIClient = {
	async generateCommitMessage(config: Config, prompt: string): Promise<string> {
		if (!config.apiKey) {
			console.error(
				"Google GenAI API key is missing. Set it in your config or via environment variable.",
			);
			process.exit(1);
		}

		const ai = new GoogleGenAI({ apiKey: config.apiKey });

		try {
			// 2️⃣ Generate content
			const response = await ai.models.generateContent({
				model: config.aiModel,
				contents: prompt,
			});

			const text = response?.text?.trim();
			if (!text) {
				console.error("Google GenAI returned no output.");
				process.exit(1);
			}

			return text;
		} catch (err: unknown) {
			if (err instanceof Error) {
				const msg = err.message.toLowerCase();

				if (msg.includes("unauthorized") || msg.includes("invalid")) {
					console.error("Invalid API key or unauthorized access.");
				} else if (msg.includes("quota") || msg.includes("exceeded")) {
					console.error(
						"API quota exceeded. Please wait or upgrade your plan.",
					);
				} else if (
					msg.includes("network") ||
					msg.includes("fetch") ||
					msg.includes("timeout")
				) {
					console.error(
						"Network error while contacting Google GenAI. Check your connection.",
					);
				} else {
					console.error("Google GenAI error:", err.message);
				}
			} else {
				console.error("Unknown error contacting Google GenAI:", err);
			}

			process.exit(1);
		}
	},
};
