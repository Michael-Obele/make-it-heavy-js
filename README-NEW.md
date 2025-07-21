# 🚀 Make It Heavy JS

A clean, simple multi-agent orchestrator inspired by the Python version, built with TypeScript and Bun. Features a non-flickering TUI that looks exactly like the Python implementation.

## ✨ What's New

This is a completely rewritten version that fixes all the major issues from the original:

- ✅ **No more flickering TUI** - Clean terminal interface like the Python version
- ✅ **Reliable agent execution** - No more random agent failures
- ✅ **Class-based architecture** - Following the Python structure
- ✅ **Debug mode** - Easy troubleshooting with `--debug` flag
- ✅ **Simple configuration** - Environment variables or config file
- ✅ **Clean codebase** - Removed all unnecessary complexity

## 🌟 Features

- **Multi-Agent Research**: Deploy 4 parallel AI agents for comprehensive analysis
- **Real-time Progress Display**: Live TUI showing agent status without flickering
- **Web Search Integration**: Agents can search and analyze web content
- **Interactive & Direct Modes**: Use interactively or with direct queries
- **Debug Mode**: Detailed logging for troubleshooting
- **Clean Architecture**: Simple, maintainable class-based structure
- **Modern Validation**: Uses Valibot for fast, lightweight schema validation

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime
- OpenRouter API key from [https://openrouter.ai/keys](https://openrouter.ai/keys)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd make-it-heavy-js
```

2. Install dependencies:
```bash
bun install
```

3. Set your OpenRouter API key:
```bash
export OPENROUTER_API_KEY="your_api_key_here"
```

Or update `config.ts` directly:
```typescript
api_key: process.env.OPENROUTER_API_KEY || "your_api_key_here"
```

## 🎯 Usage

### Interactive Mode

Start the interactive CLI:
```bash
bun run dev
```

Example session:
```
Multi-Agent Orchestrator
Configured for 4 parallel agents
Type 'quit', 'exit', or 'bye' to exit
--------------------------------------------------
Using model: alibaba/qwen-turbo
Orchestrator initialized successfully!
--------------------------------------------------

User: What is machine learning?

Orchestrator: Starting multi-agent analysis...

MAKE IT HEAVY • QWEN-TURBO
● RUNNING • 5S

AGENT 01  ● ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
AGENT 02  ● ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
AGENT 03  ● ::::::::::····························································
AGENT 04  ● ::::::::::····························································
```

### Direct Query Mode

Ask questions directly:
```bash
bun run dev "Explain artificial intelligence"
```

### Debug Mode

Enable detailed logging:
```bash
bun run debug "Your question here"
```

Or with environment variable:
```bash
DEBUG=true bun run dev "Your question here"
```

## 🏗️ Architecture

### Clean Structure
```
make-it-heavy-js/
├── src/
│   ├── cli.ts                 # Main CLI interface (like Python's OrchestratorCLI)
│   ├── make-it-heavy.ts       # Entry point
│   └── orchestrator-clean.ts  # Core orchestrator logic
├── tools/
│   ├── base.tool.ts          # Tool interface
│   ├── browse.tool.ts        # Web content analysis
│   ├── calculator.tool.ts    # Mathematical calculations
│   ├── search.tool.ts        # Web search functionality
│   ├── task_done.tool.ts     # Task completion marker
│   └── index.ts              # Tool discovery
├── config.ts                 # Configuration
└── package.json
```

### Core Components

#### 1. OrchestratorCLI (`cli.ts`)
- Interactive and direct query modes
- Real-time progress display (Python-style TUI)
- Command handling (help, quit, etc.)
- API key validation

#### 2. TaskOrchestrator (`orchestrator-clean.ts`)
- Task decomposition into agent subtasks
- Parallel agent execution
- Result aggregation and synthesis
- Progress tracking

#### 3. Tool System (`tools/`)
- **search_web**: DuckDuckGo web search
- **browse_link**: Web content analysis
- **calculator**: Mathematical operations
- **mark_task_complete**: Task completion marker

## ⚙️ Configuration

### Environment Variables
```bash
export OPENROUTER_API_KEY="your_key"          # Required
export MODEL="alibaba/qwen-turbo"             # Optional
export DEBUG="true"                           # Optional
```

### Config File (`config.ts`)
```typescript
{
  openrouter: {
    api_key: "your_key",
    model: "alibaba/qwen-turbo",
    base_url: "https://openrouter.ai/api/v1"
  },
  orchestrator: {
    parallel_agents: 4,
    task_timeout: 600
  },
  agent: {
    max_iterations: 15,
    temperature: 0.7
  }
}
```

## 🎮 Examples

### Research Query
```bash
bun run dev "Compare renewable vs fossil fuel energy"
```

### Technical Analysis
```bash
bun run dev "Analyze the pros and cons of microservices architecture"
```

### Current Events
```bash
bun run dev "What are the latest developments in AI in 2024?"
```

## 🛠️ Troubleshooting

### Common Issues

**"API key not configured"**
- Set `OPENROUTER_API_KEY` environment variable
- Or update `config.ts` with your key
- Get a key from [https://openrouter.ai/keys](https://openrouter.ai/keys)

**Agents fail consistently**
- Enable debug mode: `bun run debug "your query"`
- Check your OpenRouter API key and credits
- Verify internet connection for web search

**TUI flickering (shouldn't happen now)**
- The new implementation uses proper terminal clearing
- If you see flickering, please report as a bug

### Debug Mode

Enable detailed logging:
```bash
DEBUG=true bun run dev "your question"
```

Debug output shows:
- Task decomposition details
- Agent iteration progress
- Tool execution logs
- Error details and stack traces

## 📁 Project Structure

```
make-it-heavy-js/
├── README.md                 # This file
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration  
├── config.ts                 # Application configuration
├── src/                      # Source code
│   ├── cli.ts               # CLI interface (main class)
│   ├── make-it-heavy.ts     # Entry point
│   └── orchestrator-clean.ts # Core orchestration logic
└── tools/                    # Agent tools
    ├── base.tool.ts         # Tool interface
    ├── browse.tool.ts       # Web content analysis
    ├── calculator.tool.ts   # Mathematical operations
    ├── search.tool.ts       # Web search
    ├── task_done.tool.ts    # Task completion
    └── index.ts             # Tool registry
```

## 🎯 Key Improvements from Original

1. **Fixed Flickering**: Uses proper terminal clearing instead of complex TUI libraries
2. **Reliable Agents**: Removed artificial failure logic and improved error handling  
3. **Clean Architecture**: Class-based design following Python version structure
4. **Better Debug Mode**: Comprehensive logging with `--debug` flag
5. **Simplified Dependencies**: Removed unnecessary libraries (ora, boxen, cli-table3, etc.)
6. **Modern Validation**: Replaced Zod with Valibot for faster, more efficient schema validation
7. **Environment Variables**: Proper configuration via env vars
8. **Better Error Messages**: Clear feedback when things go wrong
9. **Consistent TUI**: Looks exactly like the Python version

## 🔧 Scripts

```bash
bun run dev          # Interactive mode
bun run start        # Same as dev
bun run debug        # Enable debug logging
bun run help         # Show help
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the clean architecture
4. Test with debug mode
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the Python Make It Heavy implementation
- Built with [Bun](https://bun.sh) for speed and simplicity
- Uses [OpenRouter](https://openrouter.ai) for AI model access

---

**Made with ❤️ for clean, reliable multi-agent orchestration**