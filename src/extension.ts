import * as vscode from 'vscode';
import { randomBytes } from 'crypto';
import { MarkdownCodeLensProvider } from './codeLensProvider';
import { runInTerminal, typeInTerminal, disposeTerminal } from './terminalRunner';
import { markdownItPlugin } from './markdownItPlugin';

export function activate(context: vscode.ExtensionContext) {
    const sessionNonce = randomBytes(16).toString('hex');

    const getDebugEnabled = (): boolean => {
        const config = vscode.workspace.getConfiguration('md-run-terminal');
        return config.get<boolean>('debug', false);
    };

    const logDebug = (...args: unknown[]): void => {
        if (getDebugEnabled()) {
            // eslint-disable-next-line no-console
            console.log(...args);
        }
    };

    // eslint-disable-next-line no-console
    console.log('MD Run Terminal extension is now active');

    // 注册 CodeLens Provider（编辑器视图）
    const codeLensProvider = new MarkdownCodeLensProvider();
    const codeLensDisposable = vscode.languages.registerCodeLensProvider(
        { language: 'markdown', scheme: 'file' },
        codeLensProvider
    );

    // 注册运行命令
    const runCommand = vscode.commands.registerCommand(
        'md-run-terminal.runInTerminal',
        (command: string, language?: string) => {
            if (command && command.trim()) {
                runInTerminal(command, language ?? '');
            } else {
                vscode.window.showWarningMessage('No command to run');
            }
        }
    );

    // 注册 URI Handler（用于预览视图的按钮点击）
    const uriHandler = vscode.window.registerUriHandler({
        async handleUri(uri: vscode.Uri): Promise<void> {
            logDebug('MD Run Terminal: URI received:', uri.toString());

            let decodedQuery = uri.query;
            try {
                // VS Code 可能对 query 进行了额外编码，需要先解码
                decodedQuery = decodeURIComponent(uri.query);
            } catch {
                // ignore malformed percent-encoding and try best-effort parsing
            }

            // 手动解析 query 参数，避免 URLSearchParams 把 + 解析为空格
            const params: Record<string, string> = {};
            decodedQuery.split('&').forEach(pair => {
                const [key, ...valueParts] = pair.split('=');
                if (key) {
                    // 保留 + 符号，不要转换为空格
                    params[key] = valueParts.join('=');
                }
            });

            const base64Command = params['cmd'] || '';
            const language = params['lang'] || '';
            const nonce = params['nonce'] || '';

            if (!base64Command) {
                return;
            }

            const action = uri.path === '/type' ? 'type' : uri.path === '/run' ? 'run' : null;
            if (!action) {
                return;
            }

            let decodedCommand = '';
            try {
                // 解码 base64 命令
                // 使用 Buffer 解码 base64 -> UTF-8 string
                decodedCommand = Buffer.from(base64Command, 'base64').toString('utf8');
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('MD Run Terminal: Failed to decode command:', e);
                return;
            }

            const isTrustedSource = nonce === sessionNonce;
            const isWorkspaceTrusted = vscode.workspace.isTrusted;
            const needsConfirmation = !isTrustedSource || !isWorkspaceTrusted;

            if (needsConfirmation) {
                const trimmed = decodedCommand.trim();
                const lines = trimmed ? trimmed.split(/\r?\n/) : [];
                const preview = lines.length > 0 ? lines[0].slice(0, 160) : '';
                const summaryParts: string[] = [];
                if (preview) summaryParts.push(`"${preview}${lines[0].length > 160 ? '…' : ''}"`);
                if (lines.length > 1) summaryParts.push(`${lines.length} lines`);
                const summary = summaryParts.length ? `\n\n${summaryParts.join(' · ')}` : '';

                const sourceLabel = isTrustedSource ? 'Untrusted workspace' : 'External source';
                const confirmLabel = action === 'run' ? 'Run' : 'Type';
                const choice = await vscode.window.showWarningMessage(
                    `${sourceLabel} request to ${confirmLabel.toLowerCase()} a command in your terminal.${summary}`,
                    { modal: true },
                    confirmLabel
                );
                if (choice !== confirmLabel) {
                    return;
                }
            }

            logDebug('MD Run Terminal: executing action:', action, { chars: decodedCommand.length, language });

            if (action === 'run') {
                runInTerminal(decodedCommand, language);
            } else {
                typeInTerminal(decodedCommand, language);
            }
        }
    });

    // 监听文档变化，刷新 CodeLens
    const docChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'markdown') {
            codeLensProvider.refresh();
        }
    });

    context.subscriptions.push(
        codeLensDisposable,
        runCommand,
        uriHandler,
        docChangeDisposable
    );

    // 返回 markdown-it 插件（用于预览视图）
    return {
        extendMarkdownIt(md: unknown) {
            logDebug('MD Run Terminal: extendMarkdownIt called');
            markdownItPlugin(md as Parameters<typeof markdownItPlugin>[0], { nonce: sessionNonce });
            return md;
        }
    };
}

export function deactivate() {
    disposeTerminal();
}
