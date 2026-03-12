---
name: zd-init
description: 初始化当前项目的禅道配置，存储项目ID和执行列表到 .zd-project.json
argument-hint: [--refresh] [--show]
disable-model-invocation: true
allowed-tools: Bash
---

# 初始化禅道项目配置

在当前项目目录下创建 `.zd-project.json` 配置文件，存储项目信息和执行列表。

## 脚本路径

```bash
ZD_SCRIPT="${CLAUDE_SKILL_DIR}/../../scripts/zentao-api.sh"
```

## 使用方法

```bash
# 首次初始化 - 选择项目并生成配置
/zd-init

# 刷新配置 - 重新从服务器获取最新信息
/zd-init --refresh

# 查看当前配置
/zd-init --show
```

## 执行步骤

### 1. 执行初始化命令

```bash
bash "$ZD_SCRIPT" init
```

### 2. 选择项目

系统会列出你有权限的项目，输入项目 ID 进行选择。

### 3. 配置生成

系统自动获取该项目的执行/迭代列表，并生成配置文件。

## 配置文件格式

配置文件 `.zd-project.json` 示例：

```json
{
  "projectId": 2,
  "projectName": "我的项目",
  "executions": [
    { "id": 7, "name": "开发", "status": "doing", "keywords": ["开发"] },
    { "id": 8, "name": "测试", "status": "wait", "keywords": ["测试"] }
  ],
  "defaultExecution": 7,
  "taskTypes": {
    "devel": { "name": "开发", "keywords": ["开发", "实现", "编码"] },
    "test": { "name": "测试", "keywords": ["测试", "bug", "修复"] }
  },
  "defaults": {
    "type": "devel",
    "pri": 3,
    "estimate": 8
  }
}
```

## 配置作用

初始化配置后，`/zd-create` 会自动：

1. **读取默认值**：使用配置中的默认项目、执行、优先级等
2. **智能推断**：根据任务内容关键词自动匹配最合适的执行和任务类型
3. **减少交互**：无需每次选择项目和执行

## 参数说明

| 参数 | 说明 |
|------|------|
| --refresh | 刷新配置，重新从服务器获取信息 |
| --show | 显示当前配置内容 |

## 自定义配置

你可以手动编辑 `.zd-project.json` 文件：

- **修改 keywords**：调整每个执行的关键词，提高推断准确性
- **修改 defaults**：设置默认的任务类型、优先级、工时
- **修改 defaultExecution**：设置默认的执行 ID

## 注意事项

- 配置文件应添加到 `.gitignore`（如果不想提交到版本库）
- 团队成员可以各自维护自己的本地配置
- 配置过期时使用 `--refresh` 刷新
