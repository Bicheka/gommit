import { createInterface } from "node:readline";

/**
 * Prompts the user with a question and returns their input
 */
export async function prompt(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Prompts the user with a yes/no question
 * @returns true if user answers 'y' or 'yes' (case insensitive), false otherwise
 */
export async function confirmPrompt(question: string): Promise<boolean> {
  const answer = await prompt(question);
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

/**
 * Prompts the user for an issue number
 * @returns The issue number as a string, or null if invalid
 */
export async function getIssueNumber(): Promise<string | null> {
  const answer = await prompt("Enter the issue number: ");
  const issueNum = answer.trim();
  
  // Validate that it's a number
  if (issueNum && /^\d+$/.test(issueNum)) {
    return issueNum;
  }
  
  console.log("Invalid issue number. Please enter a valid number.");
  return null;
}
