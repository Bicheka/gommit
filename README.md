# gommit

gommit is a CLI tool that helps developers generate high-quality Git commit messages using AI. It is built with **Bun** and **TypeScript** for fast and modern development.

## Features

- Generate commit messages automatically from **staged changes**, **all changes**, or a specific **directory**.
- Simplifies Git workflow and improves commit message quality.
- Lightweight and easy to integrate into your development process.

## Installation
### Linux / macOS
`curl -fsSL https://raw.githubusercontent.com/bicheka/gommit/main/install-gommit.sh | sudo bash`

### Windows
Run this in powershell to install
```
iwr -useb https://raw.githubusercontent.com/Bicheka/gommit/main/install.ps1 | iex
```
or download the binary from releases and add it to the path manually

## Usage
`gommit [options] [arguments`

## Usage Source
- You need to have [bun](https://bun.sh/) installed
- To install dependencies use: `bun install`

- To run the project, use: `bun src/index.ts [options] [arguments]`

## Options
- `-a, --all`  
  It will stage all changes before proceeding.

- `-c, --commit`  
  Automatically create a Git commit using the generated message.

- `-d, --directory <directory>`  
  Specify a **path to a Git repository**.  
  Defaults to the current working directory if not provided.

## Configure
When you run gommit for the first time it will run a wizard to configure it. If you for some reason want to reconfigure again from scratch you can run `gommit config wizard`

#### After you have already created the configuration

- To customize a specific param you can use `gommit config set <key> <value>`,
- You can get a list of possible keys to configure like this `gommit config get keys`
- You can also open the config file and manually edit it. To open your default code editor `gommit config edit`

Note: the API url only needs to be configured when using Ollama, for openAI and Google it is automatic. If you are going to use a cloud model I recommend using `gemini-3-flash-preview` which you can use for free with the google free tier and works pretty well. If you use [Ollama](https://ollama.com/), the AI model needs to be decent enough otherwise it will take too long and will not perform as intended; I recommend at least `gpt-oss:20b`. Get the best AI model that your computer can run for better results.

## Contributing

Contributions are welcome and appreciated! 🎉!

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request to understand the project’s workflow, coding standards, and expectations.

## Licence
MIT
