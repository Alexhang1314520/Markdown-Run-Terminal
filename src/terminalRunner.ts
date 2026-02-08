import * as vscode from 'vscode';

let mdRunTerminal: vscode.Terminal | undefined;

// 语言到解释器的映射
const LANGUAGE_INTERPRETERS: Record<string, string> = {
    // Python
    'python': 'python3 -c',
    'py': 'python3 -c',
    'python3': 'python3 -c',
    // JavaScript
    'javascript': 'node -e',
    'js': 'node -e',
    'node': 'node -e',
    // TypeScript (需要 ts-node)
    'typescript': 'npx ts-node -e',
    'ts': 'npx ts-node -e',
    // Ruby
    'ruby': 'ruby -e',
    'rb': 'ruby -e',
    // Perl
    'perl': 'perl -e',
    // PHP
    'php': 'php -r',
    // Lua
    'lua': 'lua -e',
    // R
    'r': 'Rscript -e',
};

// Shell 类语言（直接逐行执行）
const SHELL_LANGUAGES = [
    // Shell variants
    'bash', 'sh', 'shell', 'zsh', 'console', 'terminal',
    'powershell', 'ps1', 'cmd', 'batch',
    'fish', 'tcsh', 'csh', 'ksh', 'ash', 'dash',
    // Git
    'git', 'git-bash', 'gitbash',
    // Docker / Container
    'docker', 'docker-compose', 'dockerfile', 'containerfile',
    // Kubernetes / Cloud
    'kubectl', 'helm', 'terraform', 'ansible', 'vagrant',
    // Package managers / Build tools
    'npm', 'yarn', 'pnpm', 'pip', 'pipenv', 'poetry', 'cargo', 'gem', 'bundler',
    'make', 'makefile', 'cmake', 'gradle', 'maven', 'ant', 'bazel', 'meson', 'ninja',
    // Network / HTTP tools
    'curl', 'wget', 'http', 'httpie', 'ssh', 'scp', 'rsync', 'ftp', 'sftp',
    // Text processing
    'awk', 'sed', 'grep', 'jq', 'yq', 'xargs',
    // System admin
    'systemd', 'service', 'cron', 'crontab',
    'nginx', 'apache', 'caddy',
    // Text / Plain
    'text', 'txt', 'plain', 'plaintext', 'raw',
    // No language specified
    ''
];

// 需要写入临时文件执行的语言
const FILE_BASED_LANGUAGES: Record<string, { ext: string; runner: string }> = {
    'go': { ext: '.go', runner: 'go run' },
    'rust': { ext: '.rs', runner: 'rustc -o /tmp/rust_temp && /tmp/rust_temp' },
    'java': { ext: '.java', runner: 'java' },
    'kotlin': { ext: '.kt', runner: 'kotlin' },
    'scala': { ext: '.scala', runner: 'scala' },
    'swift': { ext: '.swift', runner: 'swift' },
    'c': { ext: '.c', runner: 'gcc -o /tmp/c_temp && /tmp/c_temp' },
    'cpp': { ext: '.cpp', runner: 'g++ -o /tmp/cpp_temp && /tmp/cpp_temp' },
    'csharp': { ext: '.cs', runner: 'dotnet script' },
    'cs': { ext: '.cs', runner: 'dotnet script' },
};

export function runInTerminal(command: string, language: string = ''): void {
    const config = vscode.workspace.getConfiguration('md-run-terminal');
    const reuseTerminal = config.get<boolean>('reuseTerminal', true);

    if (reuseTerminal) {
        if (!mdRunTerminal || mdRunTerminal.exitStatus !== undefined) {
            mdRunTerminal = vscode.window.activeTerminal;
            if (!mdRunTerminal) {
                mdRunTerminal = vscode.window.createTerminal('MD Run');
            }
        }
    } else {
        mdRunTerminal = vscode.window.createTerminal('MD Run');
    }

    mdRunTerminal.show();

    const normalizedLang = language.toLowerCase().trim();

    // Shell 类语言：将多行命令用 && 连接，确保按顺序执行
    if (SHELL_LANGUAGES.includes(normalizedLang)) {
        const lines = command.split('\n').filter(line => {
            const trimmed = line.trim();
            // 过滤空行和纯注释行（以 # 开头）
            return trimmed !== '' && !trimmed.startsWith('#');
        });
        if (lines.length > 0) {
            // 用 && 连接所有命令，确保按顺序执行
            const combinedCommand = lines.join(' && ');
            mdRunTerminal.sendText(combinedCommand);
        }
        return;
    }

    // 使用解释器 -e/-c 执行的语言
    if (LANGUAGE_INTERPRETERS[normalizedLang]) {
        const interpreter = LANGUAGE_INTERPRETERS[normalizedLang];
        // 先去除首尾空白（包括尾部换行符）
        const trimmedCode = command.trim();
        // 使用双引号包裹，转义内部的特殊字符
        // 注意：保留实际换行符，不转换为 \n 字符串
        const escapedCode = trimmedCode
            .replace(/\\/g, '\\\\')     // 先转义反斜杠
            .replace(/"/g, '\\"')       // 转义双引号
            .replace(/`/g, '\\`')       // 转义反引号
            .replace(/\$/g, '\\$');     // 转义美元符号
        const fullCommand = `${interpreter} "${escapedCode}"`;
        mdRunTerminal.sendText(fullCommand);
        return;
    }

    // 需要文件的语言：提示用户
    if (FILE_BASED_LANGUAGES[normalizedLang]) {
        vscode.window.showInformationMessage(
            `${normalizedLang.toUpperCase()} 代码需要保存为文件后运行。建议在代码块中写运行命令，如: go run main.go`
        );
        return;
    }

    // SQL 类：提示
    if (['sql', 'mysql', 'postgresql', 'sqlite'].includes(normalizedLang)) {
        vscode.window.showInformationMessage(
            'SQL 语句需要在数据库客户端中执行。已复制到剪贴板。'
        );
        vscode.env.clipboard.writeText(command);
        return;
    }

    // 其他未知语言：用 && 连接多行命令
    const lines = command.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed !== '' && !trimmed.startsWith('#');
    });
    if (lines.length > 0) {
        const combinedCommand = lines.join(' && ');
        mdRunTerminal.sendText(combinedCommand);
    }
}

// 只在终端中显示命令，但不执行（不按回车）
export function typeInTerminal(command: string, language: string = ''): void {
    const config = vscode.workspace.getConfiguration('md-run-terminal');
    const reuseTerminal = config.get<boolean>('reuseTerminal', true);

    if (reuseTerminal) {
        if (!mdRunTerminal || mdRunTerminal.exitStatus !== undefined) {
            mdRunTerminal = vscode.window.activeTerminal;
            if (!mdRunTerminal) {
                mdRunTerminal = vscode.window.createTerminal('MD Run');
            }
        }
    } else {
        mdRunTerminal = vscode.window.createTerminal('MD Run');
    }

    mdRunTerminal.show();

    const normalizedLang = language.toLowerCase().trim();

    // Shell 类语言：用 && 连接所有命令（不执行）
    if (SHELL_LANGUAGES.includes(normalizedLang)) {
        const lines = command.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed !== '' && !trimmed.startsWith('#');
        });
        if (lines.length > 0) {
            // 用 && 连接所有命令，用户可以手动回车执行
            const combinedCommand = lines.join(' && ');
            mdRunTerminal.sendText(combinedCommand, false);
        }
        return;
    }

    // 使用解释器的语言：构建完整命令但不执行
    if (LANGUAGE_INTERPRETERS[normalizedLang]) {
        const interpreter = LANGUAGE_INTERPRETERS[normalizedLang];
        const trimmedCode = command.trim();
        const escapedCode = trimmedCode
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');
        const fullCommand = `${interpreter} "${escapedCode}"`;
        mdRunTerminal.sendText(fullCommand, false);
        return;
    }

    // 其他语言：用 && 连接所有命令（不执行）
    const lines = command.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed !== '' && !trimmed.startsWith('#');
    });
    if (lines.length > 0) {
        const combinedCommand = lines.join(' && ');
        mdRunTerminal.sendText(combinedCommand, false);
    }
}

export function disposeTerminal(): void {
    if (mdRunTerminal) {
        mdRunTerminal.dispose();
        mdRunTerminal = undefined;
    }
}
