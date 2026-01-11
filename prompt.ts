import { confirm, text, isCancel, cancel } from "@clack/prompts";

/**
 * Prompts the user with a yes/no question using Clack
 * @returns true if user confirms, false otherwise, exits on cancel
 */
export async function confirmPrompt(message: string): Promise<boolean> {
  const answer = await confirm({
    message,
  });

  if (isCancel(answer)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return answer as boolean;
}

/**
 * Prompts the user for an issue number using Clack
 * @returns The issue number as a string, or null if invalid
 */
export async function getIssueNumber(): Promise<string | null> {
  const issueNum = await text({
    message: "Enter the issue number:",
    placeholder: "e.g., 5",
    validate(value) {
      if (!value || value.trim().length === 0) {
        return "Issue number is required.";
      }
      if (!/^\d+$/.test(value.trim())) {
        return "Issue number must be a valid number.";
      }
    },
  });

  if (isCancel(issueNum)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return (issueNum as string).trim();
}
