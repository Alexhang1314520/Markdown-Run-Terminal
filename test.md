# Test Markdown File

This is a test file for the MD Run Terminal extension.

## Example 1: Simple command

```bash
echo "Hello, World!"
```

## Example 2: Multiple lines

```sh
echo "Line 1"
echo "Line 2"
echo "Line 3"
```

## Example 3: List files

```shell
ls -la
```

## Example 4: Without language specifier

```
pwd
```

## Example 5: Non-runnable code (should not show button)

```javascript
console.log('This is JavaScript');
```

```python
print("This is Python")
```
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 克隆项目

```bash
git clone https://github.com/run-bigpig/jcp.git
cd ccjc
```

### 安装依赖

```bash
# 安装前端依赖
cd frontend && npm install && cd ..

# 下载 Go 依赖
go mod download
```

### 开发模式运行

```bash
wails dev
```

### 构建发布版本

```bash
# 构建当前平台
wails build

# 构建 Windows 版本
wails build -platform windows/amd64

# 构建 macOS 版本
wails build -platform darwin/amd64

# 构建 Linux 版本
wails build -platform linux/amd64
```