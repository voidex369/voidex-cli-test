# 🏴‍☠️ VoidEx CLI

**VoidEx CLI** is a terminal-based Sovereign Agent designed for high-performance system interaction, security research, and autonomous task execution. Built with **React** and **Ink**, it provides a sleek, modern interface for orchestrating Large Language Models through OpenRouter.

![GitHub](https://img.shields.io/github/license/voidex369/voidex-cli)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-green)
![React](https://img.shields.io/badge/UI-React%20Ink-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🔥 What is VoidEx CLI?

**VoidEx CLI** is not just another chatbot. It's a **Sovereign Agent** with full access to your system, designed for:

- **Security Research** - Automated vulnerability scanning and analysis
- **Bug Hunting** - Responsible disclosure workflow automation
- **System Administration** - Execute complex bash commands with AI reasoning
- **Knowledge Persistence** - Long-term memory storage for learned facts
- **Session Resumption** - Save and resume entire conversation contexts

### 🎯 Key Innovations

1. **Sovereign Execution Engine** - Autonomous reasoning loop that analyzes, executes, and heals itself
2. **Interactive Approval System** - Nuclear-tier security with 4-digit code verification
3. **Smart Risk Analyzer** - 3-tier system (Safe/Caution/Critical) for command execution
4. **Live Tool Output** - Real-time streaming of command execution
5. **Auto-Detect Interactive Prompts** - Heuristic detection to prevent hangs
6. **Loop Detection** - Auto-stops repeated actions
7. **Memory Management** - Persistent long-term knowledge storage
8. **Custom Model Support** - Extendable with any OpenRouter model

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20.0.0 or higher
- **npm**: Standard Node package manager
- **OpenRouter API Key**: Get yours at [openrouter.ai/keys](https://openrouter.ai/keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/voidex369/voidex-cli.git
   cd voidex-cli
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run the application**
   ```bash
   node dist/cli.js
   ```

---

## 🔑 Authentication

To start using the sovereign capabilities, you need to configure your OpenRouter API Key:

1. Launch the app: `node dist/cli.js`
2. Type `/auth` inside the application.
3. Paste your API key (it should look like `sk-or-v1-...`).
4. Press **Enter** to save securely to your local configuration.

**Your API key is stored locally in `~/.voidex-cli/.env`**

---

## 🛠 Command Reference

The CLI support several interactive commands for configuration and management:

| Command | Description |
| :--- | :--- |
| `/help` | Display the comprehensive command menu. |
| `/auth` | Update your OpenRouter API Key. |
| `/model` | Toggle between available LLM models (includes Uncensored models). |
| `/theme` | Switch between visual themes (Dark, Light, Dracula, Nord). |
| `/stats` | View real-time system performance (CPU, RAM, Uptime). |
| `/stats session` | Session metrics & token usage. |
| `/stats model` | Model information & status. |
| `/tools` | List all available capabilities for the Sovereign Agent. |
| `/tools desc` | Show detailed tool descriptions. |
| `/chat save <id>` | Save current session to disk. |
| `/chat list` | View all saved sessions. |
| `/chat resume [id]` | Hot-load a previously saved session (interactive selection). |
| `/chat delete [id]` | Delete a saved session (interactive selection). |
| `/chat share <file>` | Export chat to file. |
| `/forget [n]` | Forget last N interactions. |
| `/exit` | Gracefully shut down the application. |

---

## 🧠 Sovereign Tool Matrix

The agent isn't just a chatbot; it's a system operator. Below are the tools it uses to interact with your environment:

### Core Tools

| Tool | Capability | Security Tier |
| :--- | :--- | :--- |
| `run_shell_command` | Execute any bash/cmd command | **Caution** (sudo, chmod, etc.) |
| `read_file` | Read file content | **Safe** |
| `write_file` | Write file content | **Caution** |
| `list_directory` | List directory contents | **Safe** |
| `glob` | Find files by pattern | **Safe** |
| `search_file_content` | Grep-like search | **Safe** |
| `web_fetch` | Scrape web pages | **Safe** |
| `replace` | Replace text in files | **Caution** |
| `save_memory` | Store knowledge permanently | **Safe** |
| `write_todos` | Create TODO.md file | **Safe** |
| `delegate_to_agent` | Sub-agent delegation | **Caution** |

### Security Tiers

#### 🟢 **Safe Tier** (Auto-Run)
- Reconnaissance tools: `curl`, `wget`, `nmap`, `ping`, `dig`
- File reading operations
- No dangerous redirection or system modification

#### 🟡 **Caution Tier** (Requires Approval)
- Root access: `sudo`
- Permission changes: `chmod`, `chown`
- File overwrites via redirection
- File modifications: `write_file`, `replace`
- Agent delegation

#### 🔴 **Critical Tier** (Nuclear Code Required)
- Force delete: `rm -rf`
- Disk formatting: `mkfs`
- Low-level writes: `dd`
- Fork bombs
- System power control: `shutdown`, `reboot`

---

## 🏗 Technology Stack

- **Framework**: [React](https://reactjs.org/) with [Ink](https://github.com/vadimdemedes/ink) for TUI components
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.3.3
- **Validation**: [Zod](https://zod.dev/) for robust configuration schema
- **API**: [OpenAI SDK](https://github.com/openai/openai-node) (Configured for OpenRouter)
- **Styling**: Pastel-rich color palettes with dynamic layout management
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Process Management**: Child Process with smart timeout and heuristics

### Architecture

```
voidex-cli/
├── src/
│   ├── cli.tsx                    ← Entry point
│   ├── lib/
│   │   ├── config.ts              ← Config management
│   │   ├── openrouter.ts          ← OpenAI client
│   │   ├── tools.ts               ← Tool implementations
│   │   ├── context.ts             ← System context
│   │   └── agent/
│   │       └── LocalExecutor.ts   ← Core execution engine
│   ├── ui/
│   │   ├── App.tsx                ← Main UI
│   │   ├── components/
│   │   │   ├── Chat.tsx           ← Chat interface
│   │   │   ├── InputArea.tsx      ← Input with suggestions
│   │   │   ├── HistoryViewport.tsx ← Message display
│   │   │   ├── StatusArea.tsx     ← Status & output
│   │   │   ├── ModelPicker.tsx    ← Model dialog
│   │   │   ├── ThemePicker.tsx    ← Theme dialog
│   │   │   └── AuthDialog.tsx     ← API key dialog
│   │   ├── contexts/
│   │   │   ├── KeypressContext.tsx
│   │   │   ├── MouseContext.tsx
│   │   │   ├── ScrollProvider.tsx
│   │   │   └── ThemeContext.tsx
│   │   └── hooks/
│   │       ├── useChat.ts         ← Core chat logic
│   │       ├── useAlternateBuffer.ts
│   │       ├── useAnimatedScrollbar.ts
│   │       ├── useBatchedScroll.ts
│   │       ├── useKeypress.ts
│   │       ├── useMouse.ts
│   │       └── useWindowSize.ts
│   ├── types/
│   │   └── index.ts               ← Type definitions
│   └── utils/
│       ├── memory.ts              ← Memory management
│       ├── events.ts
│       └── memory.test.ts
├── dist/                          ← Compiled output
└── ...
```

---

## 🎯 Usage Examples

### 1. Security Research Workflow

```
User: Scan this website for vulnerabilities: https://example.com
AI: [Thinking...]
AI: I'll perform a comprehensive security scan.

[Tool Call] run_shell_command
Command: curl -I https://example.com
Output: HTTP/1.1 200 OK
Server: Apache/2.4.29
X-Powered-By: PHP/7.2.24

[Tool Call] run_shell_command
Command: sqlmap -u "https://example.com?id=1" --dbs --batch
Output: [SQLMap results...]

[Tool Call] run_shell_command
Command: nmap -sV -p 80,443 example.com
Output: [Nmap scan results...]

[Memory Saved] Vulnerability found in PHP 7.2.24 (EOL)
```

### 2. Bug Hunting with Responsible Disclosure

```
User: Find SQL injection in theroyalbihar.com
AI: [Thinking...]

[Tool Call] web_fetch
URL: https://theroyalbihar.com
Output: [HTML content...]

[Tool Call] run_shell_command
Command: sqlmap -u "https://theroyalbihar.com/dining-item.php?id=5" --dbs
Output: [SQL Injection confirmed]

[Memory Saved] theroyalbihar.com is vulnerable to SQL Injection
[Memory Saved] Database: theroyalbihar_hpc_patna_2024

[Report Generated] reports/theroyalbihar/SQLI_THEROYALBIHAR_POC.md
```

### 3. System Administration

```
User: Backup all .md files in this project
AI: [Thinking...]

[Tool Call] glob
Pattern: *.md
Output: README.md, README_MODEL_CUSTOM.md, ...

[Tool Call] run_shell_command
Command: mkdir -p /tmp/backup && cp *.md /tmp/backup/
Output: Files copied successfully

[Memory Saved] Backup created at /tmp/backup/
```

### 4. Knowledge Persistence

```
User: Remember my name is VoidEx
AI: [Thinking...]

[Memory Saved] User's name is VoidEx
```

```
User: What's my name?
AI: Your name is VoidEx (learned from previous conversation)
```

### 5. Session Management

```
User: /chat save bug-hunt
AI: ✅ Chat saved as "bug-hunt"

User: /chat list
AI: Saved chats:
  1. bug-hunt
  2. admin-tasks
  3. security-scan

User: /chat resume 1
AI: ✅ Resumed session: bug-hunt
    (Previous conversation is loaded)
```

---

## 🛡️ Security Features

### 1. **Smart Risk Analyzer**

```typescript
// Example: Risk Analysis
Command: "rm -rf /tmp/important"
Risk Level: 🔴 Critical
Reason: Force Delete (rm -rf)
Action: Requires 4-digit nuclear code
```

### 2. **Interactive Approval System**

```
[Risk Level: CAUTION]
Tool: run_shell_command (sudo)
Command: apt-get update
Status: Waiting for approval...

Options:
  ▸ Allow once
    Always
    Deny

Press Enter to select, Ctrl+C to deny
```

### 3. **Nuclear Code Verification**

```
[Risk Level: CRITICAL]
Tool: run_shell_command (rm -rf)
Command: rm -rf /important

[SECURITY CHECK] Enter 4-digit code to proceed: █ █ █ █

Code verified: 2847
✅ Command executed
```

### 4. **Auto-Kill on Interactive Prompts**

```typescript
// Detects: [y/n], "password:", "confirm:"
// Action: Auto-kill after 3 seconds
```

### 5. **Memory Limit**

```typescript
// Max message size: 50KB
// Truncates large outputs for stability
```

### 6. **Iteration Limit**

```typescript
// Max iterations: 50
// Prevents infinite loops
// Requires approval to continue
```

---

## 📁 Project Structure

### Source Code Organization

```
voidex-cli/
├── src/                          ← TypeScript source
│   ├── cli.tsx                   ← Entry point
│   ├── lib/                      ← Core libraries
│   ├── ui/                       ← UI components
│   ├── types/                    ← Type definitions
│   └── utils/                    ← Utility functions
├── dist/                         ← Compiled JavaScript
├── tests/                        ← Test files
├── docs/                         ← Documentation
├── examples/                     ← Example usage
└── ...
```

### Configuration Files

```
~/.voidex-cli/
├── config.json                   ← Main configuration
├── custom-models.json            ← Custom models list
├── .env                          ← API Key storage
├── memory.md                     ← Long-term memory
└── chats/                        ← Saved sessions
    ├── bug-hunt.json
    ├── admin-tasks.json
    └── ...
```

---

## 📊 System Statistics

When running `/stats`, you'll see:

```
System Stats:
- CPU: 8 Cores
- RAM: 12.4GB / 16.0GB free
- Current Model: google/gemini-2.0-flash-exp:free
```

When running `/stats session`:

```
Session Metrics:
Total Messages: 45
  ├─ User: 15
  ├─ AI: 15
  └─ Tool: 15
Estimated Tokens: ~720
Session Length: 15 exchanges
```

When running `/stats model`:

```
Model Config Info:
Current Model: google/gemini-2.0-flash-exp:free
Location: ~/.voidex-cli/config.json
Status: Default Template
```

---

## 🎨 Visual Themes

**VoidEx CLI** supports multiple visual themes:

- **Dark** (Default) - Pastel dark palette
- **Light** - Clean white background
- **Dracula** - Purple/green theme
- **Nord** - Arctic color scheme

```
Theme Selection (Press Arrow keys, Enter to select, Esc to close):
┌─────────────────────────────────────────────┐
│ Select Theme                                 │
│                                             │
│ ▸ Default Dark                              │
│   Default Light                             │
│   Dracula Dark                              │
│   Nord                                      │
│                                             │
│ Preview:                                    │
│   def fibonacci(n):                         │
│       return n                              │
└─────────────────────────────────────────────┘
```

---

## 🎯 Real-World Use Cases

### 1. **Automated Security Audit**

```bash
# Run the CLI
node dist/cli.js

# Type your request
User: Audit the repository for security vulnerabilities
AI: [Scanning...]
AI: ✅ Found 3 vulnerabilities
   - PHP 7.2.24 (EOL) in /api/index.php
   - SQL Injection in /query.php?id=1
   - XSS vulnerability in /search.php

[Report saved] security_report.md
```

### 2. **Bug Bounty Hunting**

```bash
# Start bug hunting session
User: Find vulnerabilities in target.com
AI: [Thinking...]

# AI executes automated scans:
# 1. Subdomain enumeration
# 2. Port scanning
# 3. Vulnerability detection
# 4. Exploit verification

# Results auto-saved to:
# reports/target.com/VULNERABILITY_REPORT.md
```

### 3. **System Maintenance**

```bash
User: Clean up temporary files in /tmp
AI: [Thinking...]

[Tool Call] run_shell_command
Command: find /tmp -name "*.tmp" -mtime +7 -delete
Output: 127 files deleted

[Memory Saved] Cleaned 127 files from /tmp
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: "Connection failed" or "API Key invalid"
**Solution**: Run `/auth` to re-enter your API key

**Issue**: "Command not found"
**Solution**: Check if the tool is installed (e.g., `sqlmap`, `nmap`)

**Issue**: "Too many requests" (429 error)
**Solution**: Wait a few seconds, the app will auto-retry

**Issue**: "Loop detected"
**Solution**: The agent stopped an infinite loop. Try a different approach

**Issue**: "Memory full"
**Solution**: Delete old memories: `/forget 5` or edit `~/.voidex-cli/memory.md`

---

## 📚 Documentation

### For Developers

- **API Reference**: See `docs/API_REFERENCE.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Testing**: See `docs/TESTING.md`

### For Users

- **Command Guide**: See `docs/COMMAND_GUIDE.md`
- **Security Guide**: See `docs/SECURITY_GUIDE.md`
- **Use Cases**: See `docs/USE_CASES.md`

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Setup

```bash
git clone https://github.com/voidex369/voidex-cli.git
cd voidex-cli
npm install
npm run build
npm run dev        # For development with auto-rebuild
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React** & **Ink** - For the amazing TUI framework
- **OpenRouter** - For providing access to multiple AI models
- **VoidEx Community** - For feedback and bug reports

---

## 📞 Support

- **Telegram**: https://t.me/voidex369
- **GitHub Issues**: https://github.com/voidex369/voidex-cli/issues
- **Documentation**: Check the `docs/` folder

---

## ⚠️ Disclaimer

*VoidEx CLI is a powerful tool with full system access. Use it responsibly.*

- **Security**: Always verify commands before execution on production systems
- **Data Loss**: The author is not responsible for any data loss caused by autonomous commands
- **Legal**: Ensure compliance with local laws and regulations
- **Ethical Use**: Designed for security research and responsible disclosure only

**Remember**: With great power comes great responsibility. Always test in a safe environment first.

---

**Developed with ❤️ by [VoidEx](https://t.me/voidex369)**

*Stay secure, stay sovereign.*
