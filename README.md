# gommit

gommit is a CLI tool that helps developers generate high-quality Git commit messages using AI. It is built with **Bun** and **TypeScript** for fast and modern development.

## Features

- Generate commit messages automatically from **staged changes**, **all changes**, or a specific **directory**.
- Simplifies Git workflow and improves commit message quality.
- Lightweight and easy to integrate into your development process.

## Installation
### Linux / macOS
`curl -fsSL https://raw.githubusercontent.com/bicheka/gommit/main/install-gommit.sh | bash`

### Windows
Download the Windows binary from the releases page and add it to your PATH

## Requirements

- [Bun](https://bun.sh/) (for development)
- [Ollama](https://ollama.com/)

Get the best AI model that your computer can run for better results.

## Installation
To install dependencies use:

`bun install`

To run the project, use:

`bun src/index.ts [options] [arguments]`

### Options

- `-a, --all`  
  It will stage all changes before proceeding.

- `-c, --commit`  
  Automatically create a Git commit using the generated message.

- `-d, --directory <directory>`  
  Specify a **path to a Git repository**.  
  Defaults to the current working directory if not provided.

## Contributing

Contributions are welcome and appreciated! 🎉!

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request to understand the project’s workflow, coding standards, and expectations.

## Licence
MIT
