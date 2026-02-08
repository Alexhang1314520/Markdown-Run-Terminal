import * as vscode from 'vscode';
import { parseMarkdownCodeBlocks, isRunnableCodeBlock } from './markdownParser';

export class MarkdownCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        vscode.workspace.onDidChangeConfiguration(() => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(
        document: vscode.TextDocument,
        _token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const config = vscode.workspace.getConfiguration('md-run-terminal');
        const supportedLanguages = config.get<string[]>('supportedLanguages', [
            'bash', 'sh', 'shell', 'zsh', 'console', 'terminal', ''
        ]);

        const codeBlocks = parseMarkdownCodeBlocks(document);
        const codeLenses: vscode.CodeLens[] = [];

        for (const block of codeBlocks) {
            if (isRunnableCodeBlock(block.language, supportedLanguages)) {
                const range = new vscode.Range(
                    block.startLine, 0,
                    block.startLine, 0
                );

                const codeLens = new vscode.CodeLens(range, {
                    title: '$(play) Run',
                    command: 'md-run-terminal.runInTerminal',
                    arguments: [block.content, block.language],
                    tooltip: 'Run this code block in terminal'
                });

                codeLenses.push(codeLens);
            }
        }

        return codeLenses;
    }

    public refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }
}
