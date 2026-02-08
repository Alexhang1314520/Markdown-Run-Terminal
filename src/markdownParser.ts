import * as vscode from 'vscode';

export interface CodeBlock {
    language: string;
    content: string;
    startLine: number;
    endLine: number;
}

export function parseMarkdownCodeBlocks(document: vscode.TextDocument): CodeBlock[] {
    const text = document.getText();
    const lines = text.split('\n');
    const codeBlocks: CodeBlock[] = [];

    let inCodeBlock = false;
    let currentBlock: Partial<CodeBlock> = {};
    let contentLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检测代码块开始: ```language
        const startMatch = line.match(/^```(\w*)$/);
        if (startMatch && !inCodeBlock) {
            inCodeBlock = true;
            currentBlock = {
                language: startMatch[1] || '',
                startLine: i,
            };
            contentLines = [];
            continue;
        }

        // 检测代码块结束: ```
        if (line.match(/^```$/) && inCodeBlock) {
            inCodeBlock = false;
            codeBlocks.push({
                language: currentBlock.language || '',
                content: contentLines.join('\n'),
                startLine: currentBlock.startLine!,
                endLine: i,
            });
            currentBlock = {};
            contentLines = [];
            continue;
        }

        // 收集代码块内容
        if (inCodeBlock) {
            contentLines.push(line);
        }
    }

    return codeBlocks;
}

export function isRunnableCodeBlock(language: string, supportedLanguages: string[]): boolean {
    const normalizedLang = language.toLowerCase().trim();
    return supportedLanguages.some(lang =>
        lang.toLowerCase().trim() === normalizedLang
    );
}
