# Changelog

All notable changes to the "Markdown Run Terminal" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2024-XX-XX

### Added
- Initial release
- **Run** button to execute code blocks in terminal
- **Type** button to insert commands without executing
- Support for 50+ programming languages and tools
- Multi-line command support with `&&` chaining for sequential execution
- Automatic filtering of comments (`#`) and empty lines
- Execution animation with:
  - Real-time command display
  - Progress indicator (e.g., 2/3)
  - Completion status animation
- Works in both editor view (CodeLens) and preview view (interactive buttons)
- Terminal reuse option to avoid creating multiple terminals
- Configurable supported languages list

### Supported Languages
- **Shell**: bash, sh, zsh, powershell, cmd, fish, tcsh, ksh
- **Scripting**: python, javascript, typescript, ruby, perl, php, lua
- **Compiled**: go, rust, java, kotlin, scala, swift, c, cpp, csharp
- **DevOps**: docker, kubectl, helm, terraform, ansible
- **Package Managers**: npm, yarn, pnpm, pip, cargo, gem
- **Build Tools**: make, cmake, gradle, maven
- **Data**: sql, mysql, postgresql, sqlite
- **Network**: curl, wget, ssh

---

[Unreleased]: https://github.com/leiyihang/md-run-terminal/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/leiyihang/md-run-terminal/releases/tag/v0.0.1
