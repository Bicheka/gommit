import {
	cancel,
	group,
	intro,
	isCancel,
	outro,
	select,
	text,
} from "@clack/prompts";
import color from "picocolors";
import {
	type Issues,
	ReferIssues,
	type WizardInput,
	WizardInputSchema,
} from "./config/schema";

export async function wizard(path: string): Promise<WizardInput> {
	intro(`gommit configuration wizard`);
	const prompts = await group(
		{
			provider: () =>
				select({
					message: "Select an AI provider",
					options: [
						{ value: "ollama", label: "Ollama" },
						{ value: "openai", label: "OpenAI" },
						{ value: "google", label: "Google" },
					],
				}),
			aiModel: () =>
				text({
					message: "Which AI model are you using?",
					placeholder: "gpt-oss:20b",
					defaultValue: "gpt-oss:20b",
				}),
			apiUrl: ({ results }) => {
				if (results.provider !== "ollama") {
					return undefined;
				}

				return text({
					message: "What is the AI API URL?",
					placeholder: "http://localhost:11434/api/generate",
					defaultValue: "http://localhost:11434/api/generate",
				});
			},
			apiKey: () =>
				text({
					message: "What is your API key",
					placeholder: "asdf2c4cr234fdb45...",
					defaultValue: "",
				}),
			numberOfResponses: () =>
				text({
					message:
						"How many responses would you like to get from the AI model (min: 1)",
					placeholder: "1",
					defaultValue: "1",
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

export async function confirmAction() {
	const options = [
		{ value: "commit", label: "✅ Commit" },
		{ value: "copy", label: "📋 Copy to clipboard" },
		{ value: "regen", label: "🔄 Regenerate message" },
		{ value: "cancel", label: "❌ Cancel" },
	];

	const response = await select({
		message: "Would you like to: ",
		options,
	});

	if (isCancel(response)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	return response;
}

export async function referenceIssues(): Promise<Issues> {
	const issues = await text({
		message: `List related issues ${color.cyan("(Optional)")}`,
		placeholder: "Closes #999, Ref #777",
	});
	if (isCancel(issues)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}
	const parsedIssues = ReferIssues.parse({ issues });
	return parsedIssues;
}
