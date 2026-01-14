import * as z from "zod";

export const ConfigSchema = z.object({
	provider: z.string(),
	aiModel: z.string(),
	prompt: z.string(),
	apiUrl: z.string(),
	gitArgs: z.array(z.string()),
	numberOfResponses: z.number().min(1),
});

export const WizardInputSchema = z.object({
	provider: z.string(),
	aiModel: z.string(),
	apiUrl: z.string(),
	numberOfResponses: z.string(),
});

export const ReferIssues = z.object({
	issues: z.string().optional(),
});

export type WizardInput = z.infer<typeof WizardInputSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type Issues = z.infer<typeof ReferIssues>;
