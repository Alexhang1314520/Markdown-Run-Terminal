import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type Renderer from 'markdown-it/lib/renderer.mjs';

const SUPPORTED_LANGUAGES = [
    // Shell / Command line
    'bash', 'sh', 'shell', 'zsh', 'console', 'terminal', 'powershell', 'ps1', 'cmd', 'batch',
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
    // Python
    'python', 'py', 'python3', 'python2', 'ipython', 'jupyter',
    // JavaScript / TypeScript
    'javascript', 'js', 'node', 'nodejs', 'typescript', 'ts', 'deno', 'bun',
    // Ruby
    'ruby', 'rb', 'rake', 'rails',
    // Other scripting
    'perl', 'pl', 'php', 'r', 'lua', 'tcl', 'awk',
    'groovy', 'elixir', 'erlang', 'clojure', 'scheme', 'lisp', 'racket',
    // Compiled languages
    'go', 'golang', 'rust', 'rs', 'java', 'kotlin', 'kt', 'scala',
    'swift', 'objective-c', 'objc',
    'c', 'cpp', 'c++', 'cxx', 'cc', 'h', 'hpp',
    'csharp', 'cs', 'c#', 'fsharp', 'fs', 'f#',
    'd', 'nim', 'zig', 'crystal', 'haskell', 'hs', 'ocaml', 'ml',
    // Database
    'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'mssql', 'tsql',
    'mongodb', 'mongo', 'redis', 'cassandra', 'cql',
    'graphql', 'gql',
    // Config files (may contain runnable commands)
    'yaml', 'yml', 'json', 'jsonc', 'json5',
    'toml', 'ini', 'conf', 'config', 'cfg', 'env', 'dotenv',
    'properties', 'plist',
    // Markup with potential commands
    'xml', 'html', 'svg',
    // Version control
    'diff', 'patch',
    // Vim / Editor
    'vim', 'viml', 'vimscript', 'emacs', 'elisp',
    // System admin
    'systemd', 'service', 'cron', 'crontab',
    'nginx', 'apache', 'caddy',
    // Text / Plain
    'text', 'txt', 'plain', 'plaintext', 'raw',
    // No language specified
    ''
];

export function markdownItPlugin(md: MarkdownIt): void {
    const defaultFence = md.renderer.rules.fence;

    md.renderer.rules.fence = (
        tokens: Token[],
        idx: number,
        options: MarkdownIt.Options,
        env: unknown,
        self: Renderer
    ): string => {
        const token = tokens[idx];
        const language = token.info.trim().toLowerCase();
        const code = token.content;

        // 获取默认渲染结果
        let defaultRendered = '';
        if (defaultFence) {
            defaultRendered = defaultFence(tokens, idx, options, env, self);
        } else {
            defaultRendered = `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`;
        }

        // 检查是否是支持的语言
        if (SUPPORTED_LANGUAGES.includes(language)) {
            // 使用 data 属性存储命令，由预览脚本处理点击事件
            const escapedCode = md.utils.escapeHtml(code)
                .replace(/"/g, '&quot;');

            const wrapper = `
                <div class="md-run-terminal-wrapper" style="position: relative;">
                    <div class="md-run-terminal-btn-group" style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        display: flex;
                        gap: 4px;
                        z-index: 10;
                    ">
                        <button class="md-run-terminal-btn md-run-terminal-type-btn"
                                data-command="${escapedCode}"
                                data-language="${language}"
                                data-action="type"
                                title="Type in Terminal (without executing)"
                                style="
                                    background: #6c757d;
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                    padding: 4px 10px;
                                    cursor: pointer;
                                    font-size: 12px;
                                    font-family: system-ui, sans-serif;
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 4px;
                                    line-height: 1.2;
                                ">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink: 0;">
                                <path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm2-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2zm.5 2h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
                            </svg>
                            Type
                        </button>
                        <button class="md-run-terminal-btn md-run-terminal-run-btn"
                                data-command="${escapedCode}"
                                data-language="${language}"
                                data-action="run"
                                title="Run in Terminal"
                                style="
                                    background: #007acc;
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                    padding: 4px 10px;
                                    cursor: pointer;
                                    font-size: 12px;
                                    font-family: system-ui, sans-serif;
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 4px;
                                    line-height: 1.2;
                                ">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style="flex-shrink: 0;">
                                <path d="M4 2l10 6-10 6V2z"/>
                            </svg>
                            Run
                        </button>
                    </div>
                    ${defaultRendered}
                </div>
            `;
            return wrapper;
        }

        return defaultRendered;
    };
}
