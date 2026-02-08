import * as vscode from 'vscode';
import { MarkdownCodeLensProvider } from './codeLensProvider';
import { runInTerminal, typeInTerminal, disposeTerminal } from './terminalRunner';
import { markdownItPlugin } from './markdownItPlugin';

export function activate(context: vscode.ExtensionContext) {
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
        (command: string) => {
            if (command && command.trim()) {
                runInTerminal(command);
            } else {
                vscode.window.showWarningMessage('No command to run');
            }
        }
    );

    // 注册 URI Handler（用于预览视图的按钮点击）
    const uriHandler = vscode.window.registerUriHandler({
        handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
            console.log('MD Run Terminal: URI received:', uri.toString());

            // VS Code 可能对 query 进行了额外编码，需要先解码
            const decodedQuery = decodeURIComponent(uri.query);

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

            console.log('MD Run Terminal: base64Command:', base64Command);

            if (base64Command) {
                try {
                    // 解码 base64 命令
                    // 使用 Buffer 解码 base64 -> UTF-8 string
                    const decodedCommand = Buffer.from(base64Command, 'base64').toString('utf8');
                    console.log('MD Run Terminal: Decoded command:', decodedCommand, 'Language:', language);

                    // 根据 URI 路径决定执行方式
                    if (uri.path === '/run') {
                        runInTerminal(decodedCommand, language);
                    } else if (uri.path === '/type') {
                        typeInTerminal(decodedCommand, language);
                    }
                } catch (e) {
                    console.error('MD Run Terminal: Failed to decode command:', e);
                }
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
            console.log('MD Run Terminal: extendMarkdownIt called');
            markdownItPlugin(md as Parameters<typeof markdownItPlugin>[0]);
            return md;
        }
    };
}

export function deactivate() {
    disposeTerminal();
}
