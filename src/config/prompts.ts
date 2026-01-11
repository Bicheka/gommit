import { intro, outro, isCancel, cancel, text, group } from "@clack/prompts";
import { WizardInputSchema, type WizardInput } from "./schema";

export async function wizard(path: string): Promise<WizardInput> {
  intro(`gommit configuration wizard`);
  const prompts = await group(
    {
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
      onCancel: ({ results }) => {
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
