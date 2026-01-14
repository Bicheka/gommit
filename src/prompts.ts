import { cancel, group, intro, outro, text } from "@clack/prompts";
import { type WizardInput, WizardInputSchema } from "./config/schema";

export async function wizard(path: string): Promise<WizardInput> {
	intro(`gommit configuration wizard`);
	const prompts = await group(
		{
			provider: () =>
				text({
					message: "Which AI provider are you using?",
					placeholder: "ollama | openai | gemini ...",
					validate(value) {
						if (value.length === 0) return `Value is required!`;
					},
				}),
			aiModel: () =>
				text({
					message: "Which AI model are you using?",
					placeholder: "e.g llama3",
					validate(value) {
						if (value.length === 0) return `Value is required!`;
					},
				}),
			apiUrl: () =>
				text({
					message: "What is the AI API URL?",
					placeholder: "http://localhost:11434/api/generate",
				}),
			numberOfResponses: () =>
				text({
					message:
						"How many responses would you like to get from the AI model (min: 1)",
					placeholder: "1",
				}),
		},
		{
			onCancel: () => {
				cancel("Operation cancelled.");
				process.exit(0);
			},
		},
	);
	outro(`
    Config file created at ${path}

    You're all set!`);

	const wizardInput = WizardInputSchema.parse(prompts);

	return wizardInput;
}
