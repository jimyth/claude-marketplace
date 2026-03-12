---
name: zd-story
description: 创建禅道需求（Story）
argument-hint: create --title <标题> [--product <产品ID>]
disable-model-invocation: true
allowed-tools: Bash
---

# 创建禅道需求

在禅道中创建需求（Story），支持设置标题、产品、优先级、描述等。

## 脚本路径

```bash
ZD_SCRIPT="${CLAUDE_SKILL_DIR}/../src/index.ts"
```

## 使用方法

### 创建需求

```bash
# 创建需求（使用配置中的产品 ID）
npx tsx "$ZD_SCRIPT" story create --title "用户登录功能"

# 指定产品 ID
npx tsx "$ZD_SCRIPT" story create --title "用户登录功能" --product 1

# 指定优先级和描述
npx tsx "$ZD_SCRIPT" story create --title "用户登录功能" --pri 2 --spec "支持账号密码和手机号登录"
```

### 查看需求

```bash
npx tsx "$ZD_SCRIPT" story view 123
```

### 列出需求

```bash
# 列出产品的所有需求
npx tsx "$ZD_SCRIPT" story list --product 1

# 过滤状态
npx tsx "$ZD_SCRIPT" story list --product 1 --status active

# 过滤指派给我的需求
npx tsx "$ZD_SCRIPT" story list --product 1 --assignedTo me
```

## 参数说明

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| --title | 是 | - | 需求标题 |
| --product | 可配置 | 从配置 | 产品 ID |
| --pri | 否 | 3 | 优先级 (1-4) |
| --estimate | 否 | 0 | 预计工时 |
| --assignedTo | 否 | - | 指派给 |
| --spec | 否 | - | 需求描述/验收标准 |
| --verify | 否 | - | 验收标准 |

## 执行步骤

### 1. 检查产品 ID

```bash
# 如果未指定 --product，从项目配置获取
if [ -f ".zd-project.json" ]; then
  product=$(jq -r '.productId // empty' .zd-project.json)
fi
```

### 2. 生成需求描述

根据对话上下文自动生成需求描述，包含：
- **背景**：为什么需要这个需求
- **目标**：要实现什么功能
- **验收标准**：完成的定义

### 3. 创建需求

```bash
npx tsx "$ZD_SCRIPT" story create \
  --title "<需求标题>" \
  --product <产品ID> \
  --spec "<需求描述>"
```

## 与任务关联

创建需求后，可以使用返回的需求 ID 创建关联任务：

```bash
# 先创建需求
npx tsx "$ZD_SCRIPT" story create --title "用户登录" --product 1
# 输出: 需求 #100 已创建

# 再创建关联任务
npx tsx "$ZD_SCRIPT" create --name "实现登录 API" --execution 7 --story 100
```

## 需求状态

| 状态 | 说明 |
|------|------|
| draft | 草稿 |
| active | 激活 |
| closed | 关闭 |
| changing | 变更中 |
| reviewing | 评审中 |
