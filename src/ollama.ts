type OllamaGenerateRequest = {
	model: string;
	prompt: string;
	stream?: boolean;
};

type OllamaGenerateResponse = {
	response: string;
};

export async function generateText(
	prompt: string,
	model = "gpt-oss:20b",
): Promise<string> {
	const res = await fetch("http://localhost:11434/api/generate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model,
			prompt,
			stream: false,
		} satisfies OllamaGenerateRequest),
	});

	if (!res.ok) {
		throw new Error(`Ollama error: ${res.statusText}`);
	}

	const data = (await res.json()) as OllamaGenerateResponse;
	return data.response;
}
