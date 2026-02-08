import * as vscode from 'vscode';
import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type Renderer from 'markdown-it/lib/renderer.mjs';

const DEFAULT_SUPPORTED_LANGUAGES = ['bash', 'sh', 'shell', 'zsh', 'console', 'terminal', ''];

export function markdownItPlugin(md: MarkdownIt, pluginOptions: { nonce: string }): void {
    const defaultFence = md.renderer.rules.fence;

    md.renderer.rules.fence = (
        tokens: Token[],
        idx: number,
        mdOptions: MarkdownIt.Options,
        _env: unknown,
        self: Renderer
    ): string => {
        const token = tokens[idx];
        const language = token.info.trim().split(/\s+/)[0].toLowerCase();
        const code = token.content;

        const config = vscode.workspace.getConfiguration('md-run-terminal');
        const supportedLanguages = config.get<string[]>('supportedLanguages', DEFAULT_SUPPORTED_LANGUAGES);
        const isLanguageSupported = supportedLanguages.some((lang) => lang.toLowerCase().trim() === language);

        // 获取默认渲染结果
        let defaultRendered = '';
        if (defaultFence) {
            defaultRendered = defaultFence(tokens, idx, mdOptions, _env, self);
        } else {
            defaultRendered = `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`;
        }

        // 检查是否是支持的语言
        if (isLanguageSupported) {
            const wrapper = `
                <div class="md-run-terminal-wrapper"
                     data-md-run-terminal="1"
                     data-md-run-terminal-nonce="${pluginOptions.nonce}"
                     data-language="${md.utils.escapeHtml(language).replace(/"/g, '&quot;')}"
                     style="position: relative;">
                    <div class="md-run-terminal-btn-group" style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        display: flex;
                        gap: 4px;
                        z-index: 10;
                    ">
                        <button class="md-run-terminal-btn md-run-terminal-type-btn"
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
