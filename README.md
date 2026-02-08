<div align="center">

# Markdown Run Terminal

### Run code blocks from Markdown files directly in the terminal with a single click

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=leiyihang.md-run-terminal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/Alexhang1314520/Markdown-Run-Terminal)

---

**Run** | **Type** | **50+ Languages** | **Multi-line Support**

</div>

## Features

### Run & Type Buttons

Add **Run** and **Type** buttons to every code block in your Markdown files:

| Button | Action |
|--------|--------|
| **Run** | Execute the command immediately in the terminal |
| **Type** | Insert the command into the terminal without executing |

### Works in Both Views

| View | Description |
|------|-------------|
| **Editor** | CodeLens buttons appear above each code block |
| **Preview** | Interactive buttons overlay on code blocks |

### Multi-line Command Support

Execute multiple commands sequentially with `&&` chaining:

```bash
# Install dependencies
cd frontend && npm install && cd ..

# Download Go dependencies
go mod download
```

All commands execute in order. Comments and empty lines are automatically filtered.

### Execution Animation

Visual feedback during execution:
- Current command being executed
- Progress indicator (e.g., 2/3)
- Completion status with smooth animations

---

## Supported Languages

| Category | Languages |
|----------|-----------|
| **Shell** | `bash` `sh` `zsh` `powershell` `cmd` `fish` |
| **Scripting** | `python` `javascript` `typescript` `ruby` `perl` `php` `lua` |
| **Compiled** | `go` `rust` `java` `kotlin` `swift` `c` `cpp` `csharp` |
| **Tools** | `docker` `kubectl` `npm` `yarn` `git` `make` `curl` |
| **Data** | `sql` `mysql` `postgresql` `sqlite` |

---

## Installation

### Via VS Code

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for **"Markdown Run Terminal"**
4. Click **Install**

### Via Command Line

```bash
code --install-extension leiyihang.md-run-terminal
```

---

## Usage

### Basic Usage

1. Open any Markdown file (`.md`)
2. Create a code block with a language identifier:

````markdown
```bash
echo "Hello, World!"
```
````

3. Click **Run** to execute or **Type** to insert into terminal

### Multi-line Commands

````markdown
```bash
# Setup project
git clone https://github.com/user/repo.git
cd repo
npm install
npm run dev
```
````

All commands will be joined with `&&` and executed sequentially.

### Language Examples

**Python:**
````markdown
```python
print("Hello from Python!")
```
````

**JavaScript (Node.js):**
````markdown
```javascript
console.log("Hello from Node.js!");
```
````

**Shell commands without language specifier:**
````markdown
```
ls -la
pwd
```
````

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `md-run-terminal.reuseTerminal` | `true` | Reuse existing terminal instead of creating a new one |
| `md-run-terminal.supportedLanguages` | [see below] | Code block languages that show the run button |

### Default Supported Languages

```json
[
  "bash", "sh", "shell", "zsh", "console", "terminal",
  "powershell", "ps1", "cmd", "batch",
  "python", "py", "python3",
  "javascript", "js", "node",
  "typescript", "ts",
  "ruby", "rb", "perl", "php", "lua",
  "go", "rust", "java", "kotlin", "scala", "swift",
  "c", "cpp", "csharp", "cs",
  "sql", "mysql", "postgresql", "sqlite",
  "make", "makefile", "dockerfile",
  ""
]
```

---

## How It Works

| Language Type | Behavior |
|---------------|----------|
| **Shell** | Commands executed directly, joined with `&&` |
| **Interpreted** | Wrapped with interpreter (e.g., `python3 -c "code"`) |
| **Compiled** | Shows helpful message suggesting shell commands |

---

## Requirements

- VS Code **1.85.0** or higher
- Appropriate language runtimes for the languages you want to run

---

## Known Issues

- SQL code blocks are copied to clipboard instead of executed
- Some compiled languages require saving to file before execution

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with love for developers**

[Report Bug](https://github.com/Alexhang1314520/Markdown-Run-Terminal/issues) | [Request Feature](https://github.com/Alexhang1314520/Markdown-Run-Terminal/issues)

</div>
