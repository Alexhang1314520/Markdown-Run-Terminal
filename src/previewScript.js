// 预览脚本 - 处理 Run 和 Type 按钮点击事件
(function() {
    // 创建一个隐藏的链接元素，用于触发 vscode:// URI
    var hiddenLink = document.createElement('a');
    hiddenLink.id = 'md-run-terminal-hidden-link';
    hiddenLink.style.display = 'none';
    document.body.appendChild(hiddenLink);

    // 事件委托处理所有按钮点击
    document.addEventListener('click', function(event) {
        var target = event.target;
        var button = target.closest ? target.closest('.md-run-terminal-btn') : null;

        // 兼容没有 closest 的情况
        if (!button) {
            var el = target;
            while (el) {
                if (el.classList && el.classList.contains('md-run-terminal-btn')) {
                    button = el;
                    break;
                }
                el = el.parentElement;
            }
        }

        if (button) {
            event.preventDefault();
            event.stopPropagation();

            var action = button.getAttribute('data-action') || 'run';
            if (action !== 'run' && action !== 'type') {
                action = 'run';
            }

            // 只响应扩展生成的 wrapper，避免被伪造按钮诱导执行
            var wrapper = button.closest ? button.closest('.md-run-terminal-wrapper') : null;
            if (!wrapper) {
                var p = button.parentElement;
                while (p) {
                    if (p.classList && p.classList.contains('md-run-terminal-wrapper')) {
                        wrapper = p;
                        break;
                    }
                    p = p.parentElement;
                }
            }
            if (!wrapper) return;
            if (wrapper.getAttribute('data-md-run-terminal') !== '1') return;

            var nonce = wrapper.getAttribute('data-md-run-terminal-nonce') || '';
            if (!nonce) return;

            var language = wrapper.getAttribute('data-language') || '';

            // 从 code 元素读取可见文本，避免信任 data-command
            var codeEl = wrapper.querySelector('pre code') || wrapper.querySelector('code');
            var decodedCommand = codeEl ? (codeEl.textContent || '') : '';
            if (!decodedCommand) return;

            // 使用 base64 编码命令，避免 URL 特殊字符问题（如 & 被误解为参数分隔符）
            // 先 encodeURIComponent 处理 Unicode，再 btoa 编码
            var base64Command = btoa(unescape(encodeURIComponent(decodedCommand)));

            // 构建 vscode:// URI 并触发
            // 格式: vscode://leiyihang.md-run-terminal/{action}?cmd=base64_command&lang=language&nonce=...
            var vsCodeUri = 'vscode://leiyihang.md-run-terminal/' + action + '?cmd=' + base64Command + '&lang=' + encodeURIComponent(language) + '&nonce=' + encodeURIComponent(nonce);

            // 通过隐藏链接触发 URI
            hiddenLink.href = vsCodeUri;
            hiddenLink.click();

            // 视觉反馈
            showFeedback(button, true, action, decodedCommand);
        }
    });

    function showFeedback(button, success, action, command) {
        var originalBg = button.style.background;
        var originalHTML = button.innerHTML;

        if (success) {
            if (action === 'type') {
                // Type 按钮：显示完整命令（用 && 连接）
                showTypeAnimation(button, command, originalBg, originalHTML);
            } else {
                // Run 按钮：显示逐行执行动画
                showRunAnimation(button, command, originalBg, originalHTML);
            }
        } else {
            button.style.background = '#dc3545';
            button.innerHTML = 'Failed';
            setTimeout(function() {
                button.style.background = originalBg;
                button.innerHTML = originalHTML;
            }, 1500);
        }
    }

    function showTypeAnimation(button, command, originalBg, originalHTML) {
        // 解析命令行（过滤空行和注释）
        var lines = command.split('\n').filter(function(line) {
            var trimmed = line.trim();
            return trimmed !== '' && !trimmed.startsWith('#');
        });

        if (lines.length === 0) {
            button.style.background = '#28a745';
            button.innerHTML = '<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg> Typed';
            setTimeout(function() {
                button.style.background = originalBg;
                button.innerHTML = originalHTML;
            }, 1500);
            return;
        }

        // 用 && 连接所有命令
        var fullCommand = lines.join(' && ');

        // 找到代码块容器
        var wrapper = button.closest('.md-run-terminal-wrapper');
        if (!wrapper) {
            return;
        }

        wrapper.style.position = 'relative';

        // 添加动画样式
        if (!document.getElementById('md-run-terminal-styles')) {
            var style = document.createElement('style');
            style.id = 'md-run-terminal-styles';
            style.textContent = [
                '@keyframes md-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
                '@keyframes md-check-pop { 0% { transform: scale(0) rotate(-45deg); } 60% { transform: scale(1.2) rotate(0deg); } 100% { transform: scale(1) rotate(0deg); } }',
                '@keyframes md-fade-in { from { opacity: 0; } to { opacity: 1; } }',
                '@keyframes md-cmd-enter { 0% { transform: translateY(30px) scale(0.95); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }',
                '@keyframes md-cmd-exit { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-30px) scale(0.95); opacity: 0; } }',
                '@keyframes md-progress-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }',
                '@keyframes md-typing { from { width: 0; } to { width: 100%; } }',
                '@keyframes md-cursor-blink { 0%, 50% { border-right-color: #00b4d8; } 51%, 100% { border-right-color: transparent; } }'
            ].join('\n');
            document.head.appendChild(style);
        }

        // 创建动画覆盖层
        var overlay = document.createElement('div');
        overlay.className = 'md-run-terminal-overlay';
        overlay.style.cssText = [
            'position: absolute',
            'top: 0',
            'left: 0',
            'right: 0',
            'bottom: 0',
            'background: #1a1a1a',
            'z-index: 100',
            'display: flex',
            'flex-direction: column',
            'border-radius: 6px',
            'overflow: hidden',
            'animation: md-fade-in 0.25s ease-out'
        ].join(';');

        // 顶部区域
        var topArea = document.createElement('div');
        topArea.style.cssText = 'padding: 10px 16px; background: linear-gradient(180deg, #222 0%, #1a1a1a 100%);';

        // 状态行
        var statusRow = document.createElement('div');
        statusRow.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 8px;';

        // 左侧状态
        var statusLeft = document.createElement('div');
        statusLeft.style.cssText = 'display: flex; align-items: center; gap: 8px; flex-shrink: 0;';
        statusLeft.innerHTML = '<div style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; animation: md-progress-pulse 1.5s ease-in-out infinite;"></div><span style="color: #999; font-size: 11px; font-family: system-ui, sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Typing</span>';

        // 中间命令显示区域
        var cmdArea = document.createElement('div');
        cmdArea.style.cssText = 'flex: 1; min-width: 0; overflow: hidden;';

        var cmdText = document.createElement('div');
        cmdText.style.cssText = [
            'font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
            'font-size: 13px',
            'color: #e0e0e0',
            'overflow: hidden',
            'text-overflow: ellipsis',
            'white-space: nowrap',
            'padding: 4px 10px',
            'background: rgba(245, 158, 11, 0.15)',
            'border-radius: 4px',
            'border: 1px solid rgba(245, 158, 11, 0.3)'
        ].join(';');
        cmdText.textContent = fullCommand;
        cmdText.title = fullCommand;
        cmdArea.appendChild(cmdText);

        // 右侧命令数量
        var statusRight = document.createElement('div');
        statusRight.style.cssText = 'display: flex; align-items: center; gap: 6px; color: #666; font-size: 13px; font-family: ui-monospace, monospace; flex-shrink: 0;';
        statusRight.innerHTML = '<span style="color: #f59e0b; font-weight: 600;">' + lines.length + '</span><span style="color: #444;">cmd</span>';

        statusRow.appendChild(statusLeft);
        statusRow.appendChild(cmdArea);
        statusRow.appendChild(statusRight);
        topArea.appendChild(statusRow);

        // 进度条
        var progressContainer = document.createElement('div');
        progressContainer.style.cssText = 'height: 3px; background: #2a2a2a; border-radius: 2px; overflow: hidden;';
        var progressBar = document.createElement('div');
        progressBar.style.cssText = 'height: 100%; width: 0%; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%); background-size: 200% 100%; border-radius: 2px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);';
        progressContainer.appendChild(progressBar);
        topArea.appendChild(progressContainer);
        overlay.appendChild(topArea);

        // 底部填充区域
        var bottomArea = document.createElement('div');
        bottomArea.style.cssText = 'flex: 1; background: #1a1a1a;';
        overlay.appendChild(bottomArea);

        wrapper.appendChild(overlay);

        // 禁用按钮
        button.disabled = true;
        button.style.opacity = '0.5';

        // 动画进度
        setTimeout(function() {
            progressBar.style.width = '100%';
        }, 100);

        // 完成动画
        setTimeout(function() {
            statusLeft.innerHTML = '<div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></div><span style="color: #22c55e; font-size: 11px; font-family: system-ui, sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Typed</span>';
            cmdText.style.background = 'rgba(34, 197, 94, 0.15)';
            cmdText.style.borderColor = 'rgba(34, 197, 94, 0.3)';
            progressBar.style.background = 'linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #22c55e 100%)';

            setTimeout(function() {
                overlay.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                overlay.style.opacity = '0';
                overlay.style.transform = 'scale(0.98)';

                setTimeout(function() {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    button.disabled = false;
                    button.style.opacity = '1';
                    button.style.background = originalBg;
                    button.innerHTML = originalHTML;
                }, 400);
            }, 800);
        }, 1000);
    }

    function showRunAnimation(button, command, originalBg, originalHTML) {
        // 解析命令行（过滤空行和注释）
        var lines = command.split('\n').filter(function(line) {
            var trimmed = line.trim();
            return trimmed !== '' && !trimmed.startsWith('#');
        });

        if (lines.length === 0) {
            button.style.background = '#28a745';
            button.innerHTML = '<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg> Done';
            setTimeout(function() {
                button.style.background = originalBg;
                button.innerHTML = originalHTML;
            }, 1500);
            return;
        }

        // 找到代码块容器
        var wrapper = button.closest('.md-run-terminal-wrapper');
        if (!wrapper) {
            return;
        }

        wrapper.style.position = 'relative';

        // 添加动画样式
        if (!document.getElementById('md-run-terminal-styles')) {
            var style = document.createElement('style');
            style.id = 'md-run-terminal-styles';
            style.textContent = [
                '@keyframes md-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
                '@keyframes md-check-pop { 0% { transform: scale(0) rotate(-45deg); } 60% { transform: scale(1.2) rotate(0deg); } 100% { transform: scale(1) rotate(0deg); } }',
                '@keyframes md-fade-in { from { opacity: 0; } to { opacity: 1; } }',
                '@keyframes md-cmd-enter { 0% { transform: translateY(30px) scale(0.95); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }',
                '@keyframes md-cmd-exit { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-30px) scale(0.95); opacity: 0; } }',
                '@keyframes md-progress-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }',
                '@keyframes md-typing { from { width: 0; } to { width: 100%; } }',
                '@keyframes md-cursor-blink { 0%, 50% { border-right-color: #00b4d8; } 51%, 100% { border-right-color: transparent; } }'
            ].join('\n');
            document.head.appendChild(style);
        }

        // 创建动画覆盖层 - 完全不透明背景
        var overlay = document.createElement('div');
        overlay.className = 'md-run-terminal-overlay';
        overlay.style.cssText = [
            'position: absolute',
            'top: 0',
            'left: 0',
            'right: 0',
            'bottom: 0',
            'background: #1a1a1a',  // 完全不透明
            'z-index: 100',
            'display: flex',
            'flex-direction: column',
            'border-radius: 6px',
            'overflow: hidden',
            'animation: md-fade-in 0.25s ease-out'
        ].join(';');

        // 顶部区域
        var topArea = document.createElement('div');
        topArea.style.cssText = 'padding: 10px 16px; background: linear-gradient(180deg, #222 0%, #1a1a1a 100%);';

        // 状态行 - 包含状态、命令、进度数字
        var statusRow = document.createElement('div');
        statusRow.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 8px;';

        // 左侧状态
        var statusLeft = document.createElement('div');
        statusLeft.style.cssText = 'display: flex; align-items: center; gap: 8px; flex-shrink: 0;';
        statusLeft.innerHTML = '<div style="width: 8px; height: 8px; border-radius: 50%; background: #007acc; animation: md-progress-pulse 1.5s ease-in-out infinite;"></div><span style="color: #999; font-size: 11px; font-family: system-ui, sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Executing</span>';

        // 中间命令显示区域
        var cmdArea = document.createElement('div');
        cmdArea.style.cssText = 'flex: 1; min-width: 0; overflow: hidden;';

        var cmdText = document.createElement('div');
        cmdText.className = 'md-run-cmd-text';
        cmdText.style.cssText = [
            'font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
            'font-size: 13px',
            'color: #e0e0e0',
            'overflow: hidden',
            'text-overflow: ellipsis',
            'white-space: nowrap',
            'padding: 4px 10px',
            'background: rgba(0, 122, 204, 0.15)',
            'border-radius: 4px',
            'border: 1px solid rgba(0, 122, 204, 0.3)'
        ].join(';');
        cmdText.textContent = lines[0];
        cmdText.title = lines[0];
        cmdArea.appendChild(cmdText);

        // 右侧进度
        var statusRight = document.createElement('div');
        statusRight.className = 'md-run-progress-text';
        statusRight.style.cssText = 'display: flex; align-items: center; gap: 6px; color: #666; font-size: 13px; font-family: ui-monospace, monospace; flex-shrink: 0;';
        statusRight.innerHTML = '<span style="color: #007acc; font-weight: 600;">1</span><span style="color: #444;">/</span><span>' + lines.length + '</span>';

        statusRow.appendChild(statusLeft);
        statusRow.appendChild(cmdArea);
        statusRow.appendChild(statusRight);
        topArea.appendChild(statusRow);

        // 进度条
        var progressContainer = document.createElement('div');
        progressContainer.style.cssText = 'height: 3px; background: #2a2a2a; border-radius: 2px; overflow: hidden;';
        var progressBar = document.createElement('div');
        progressBar.style.cssText = 'height: 100%; width: 0%; background: linear-gradient(90deg, #007acc 0%, #00b4d8 50%, #007acc 100%); background-size: 200% 100%; border-radius: 2px; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);';
        progressContainer.appendChild(progressBar);
        topArea.appendChild(progressContainer);
        overlay.appendChild(topArea);

        // 底部填充区域 - 保持整体布局
        var bottomArea = document.createElement('div');
        bottomArea.style.cssText = 'flex: 1; background: #1a1a1a;';
        overlay.appendChild(bottomArea);

        wrapper.appendChild(overlay);

        // 禁用按钮
        button.disabled = true;
        button.style.opacity = '0.5';

        var currentIndex = 0;
        var intervalTime = Math.max(600, Math.min(1200, 5000 / lines.length));

        function animateNext() {
            if (currentIndex < lines.length) {
                // 更新进度
                var progress = (currentIndex + 1) / lines.length;
                progressBar.style.width = (progress * 100) + '%';
                statusRight.innerHTML = '<span style="color: #007acc; font-weight: 600;">' + (currentIndex + 1) + '</span><span style="color: #444;">/</span><span>' + lines.length + '</span>';

                if (currentIndex > 0) {
                    // 更新命令文本
                    cmdText.textContent = lines[currentIndex];
                    cmdText.title = lines[currentIndex];
                }

                currentIndex++;
                setTimeout(animateNext, intervalTime);
            } else {
                // 全部完成 - 显示最终进度
                statusRight.innerHTML = '<span style="color: #22c55e; font-weight: 600;">' + lines.length + '</span><span style="color: #444;">/</span><span>' + lines.length + '</span>';
                statusLeft.innerHTML = '<div style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></div><span style="color: #22c55e; font-size: 11px; font-family: system-ui, sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Complete</span>';

                // 完成状态 - 更新命令区域样式
                cmdText.style.background = 'rgba(34, 197, 94, 0.15)';
                cmdText.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                progressBar.style.background = 'linear-gradient(90deg, #22c55e 0%, #4ade80 50%, #22c55e 100%)';

                setTimeout(function() {
                    overlay.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    overlay.style.opacity = '0';
                    overlay.style.transform = 'scale(0.98)';

                    setTimeout(function() {
                        if (overlay.parentNode) {
                            overlay.parentNode.removeChild(overlay);
                        }
                        button.disabled = false;
                        button.style.opacity = '1';
                        button.style.background = originalBg;
                        button.innerHTML = originalHTML;
                    }, 400);
                }, 1000);
            }
        }

        // 开始动画
        setTimeout(animateNext, 500);
    }

    console.log('MD Run Terminal: Preview script loaded');
})();
