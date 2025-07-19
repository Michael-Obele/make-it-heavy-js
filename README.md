# 🚀 Make It heavy (JS)

## Table of Contents

- [🌟 Features](#features)
- [🚀 Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🎯 Usage](#usage)
  - [Single Agent Mode](#single-agent-mode)
  - [Grok heavy Mode (Multi-Agent Orchestration)](#grok-heavy-mode-multi-agent-orchestration)
- [🏗️ Architecture](#architecture)
  - [Core Components](#core-components)
  - [Available Tools](#available-tools)
- [⚙️ Configuration](#configuration)
- [🙏 Acknowledgments](#acknowledgments)
- [📝 License](#license)

A TypeScript framework to emulate **Grok heavy** functionality using a powerful multi-agent system. Built on OpenRouter's API and Bun, Make It heavy delivers comprehensive, multi-perspective analysis through intelligent agent orchestration.

## 🌟 Features

- **🧠 Grok heavy Emulation**: Multi-agent system that delivers deep, comprehensive analysis like Grok heavy mode
- **🔀 Parallel Intelligence**: Deploy specialized agents simultaneously for maximum insight coverage
- **🎯 Dynamic Question Generation**: AI creates custom research questions tailored to each query
- **⚡ Built with Bun**: A fast, all-in-one JavaScript runtime
- **🛠️ Hot-Swappable Tools**: Automatically discovers and loads tools from the `tools/` directory
- **🔄 Intelligent Synthesis**: Combines multiple agent perspectives into unified, comprehensive answers
- **🎮 Single Agent Mode**: Run individual agents for simpler tasks with full tool access
- **🔒 Type-Safe Configuration**: Uses a TypeScript configuration file with Zod validation to ensure a robust and maintainable setup.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/)
- OpenRouter API key

### Installation

1. **Clone and install dependencies:**

```bash
git clone <https://github.com/Doriandarko/make-it-heavy-js.git>
cd make-it-heavy-js
bun install
```

2. **Configure API key:**
   Create a `.env` file in the root of the project and add your OpenRouter API key:

```
OPENROUTER_API_KEY="YOUR_API_KEY"
```

## 🎯 Usage

### Single Agent Mode

Run a single intelligent agent with full tool access:

```bash
bun src/main.ts
```

### Grok heavy Mode (Multi-Agent Orchestration)

Emulate Grok heavy's deep analysis with parallel intelligent agents:

```bash
bun src/make-it-heavy.ts
```

## 🏗️ Architecture

### Core Components

- **Agent System (`src/agent.ts`)**: Core agent logic with tool access
- **Orchestrator (`src/orchestrator.ts`)**: Manages parallel agents and synthesizes results
- **Tool System (`tools/`)**: Auto-discovered tools with a standardized interface

### Available Tools

| Tool                 | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `search_web`         | Web search with DuckDuckGo               |
| `browse_link`        | Browse a web page and return its content |
| `calculate`          | Safe mathematical calculations           |
| `read_file`          | Read file contents                       |
| `write_file`         | Create/overwrite files                   |
| `mark_task_complete` | Signal task completion                   |

## ⚙️ Configuration

Edit `config.ts` to customize behavior, including the model, number of parallel agents, and prompts.

## 🙏 Acknowledgments

This project was inspired by the original [Make It Heavy](https://github.com/Doriandarko/make-it-heavy) by Pietro Schirano.

## 📝 License

MIT License with Commercial Attribution Requirement. See [LICENSE](LICENSE) file for full details.
