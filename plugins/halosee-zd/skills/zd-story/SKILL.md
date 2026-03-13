---
name: zd-story
description: 创建禅道需求（Story）
argument-hint: create --title <标题> [--project <项目ID> | --product <产品ID>]
disable-model-invocation: true
allowed-tools: Bash
---

# 创建禅道需求

在禅道中创建需求，支持创建研发需求（项目级别）和用户需求（产品级别）。

## 需求类型说明

禅道有两种需求：

| 类型 | 级别 | API 端点 | 任务关联 |
|------|------|----------|----------|
| **研发需求** | 项目 | `/projects/{id}/stories` | ✓ 可以关联 |
| 用户需求 | 产品 | `/products/{id}/stories` | ✗ 不能直接关联 |

**默认创建研发需求**，因为任务是关联到研发需求的。

## 脚本路径

```bash
ZD_SCRIPT="${CLAUDE_SKILL_DIR}/../src/index.ts"
```

## 使用方法

### 创建研发需求（推荐）

```bash
# 创建研发需求（使用配置中的项目 ID）
npx tsx "$ZD_SCRIPT" story create --title "用户登录功能"

# 指定项目 ID
npx tsx "$ZD_SCRIPT" story create --title "用户登录功能" --project 8

# 指定优先级和描述
npx tsx "$ZD_SCRIPT" story create --title "用户登录功能" --pri 2 --spec "支持账号密码和手机号登录"
```

### 创建用户需求

```bash
# 创建用户需求（产品级别，任务不能直接关联）
npx tsx "$ZD_SCRIPT" story create --title "产品愿景" --type user --product 1
```

### 查看需求

```bash
npx tsx "$ZD_SCRIPT" story view 123
```

### 列出需求

```bash
# 列出项目的研发需求
npx tsx "$ZD_SCRIPT" story list --project 8

# 列出产品的用户需求
npx tsx "$ZD_SCRIPT" story list --product 1

# 过滤状态
npx tsx "$ZD_SCRIPT" story list --project 8 --status active
```

## 参数说明

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| --title | 是 | - | 需求标题 |
| --type | 否 | project | 需求类型: project(研发需求) / user(用户需求) |
| --project | 可配置 | 从配置 | 项目 ID（创建研发需求时使用） |
| --product | 可配置 | 从配置 | 产品 ID（创建用户需求时使用） |
| --pri | 否 | 3 | 优先级 (1-4) |
| --estimate | 否 | 0 | 预计工时 |
| --category | 否 | feature | 需求类别 |
| --assignedTo | 否 | - | 指派给 |
| --spec | 否 | - | 需求描述 |

## 执行步骤

### 1. 确定需求类型

```bash
# 默认创建研发需求（项目级别）
# 任务可以关联到研发需求

# 如需创建用户需求，使用 --type user
```

### 2. 获取项目/产品 ID

```bash
# 如果未指定 --project，从项目配置获取
if [ -f ".zd-project.json" ]; then
  project=$(jq -r '.projectId // empty' .zd-project.json)
fi
```

### 3. 创建需求

```bash
npx tsx "$ZD_SCRIPT" story create \
  --title "<需求标题>" \
  --project <项目ID> \
  --spec "<需求描述>"
```

## 与任务关联

**重要**: 任务只能关联研发需求（项目级别），不能直接关联用户需求。

```bash
# 1. 创建研发需求
npx tsx "$ZD_SCRIPT" story create --title "用户登录" --project 8
# 输出: 研发需求 #100 已创建

# 2. 创建关联任务
npx tsx "$ZD_SCRIPT" create --name "实现登录 API" --execution 11 --story 100
```

## 需求状态

| 状态 | 说明 |
|------|------|
| draft | 草稿 |
| active | 激活 |
| closed | 关闭 |
| changing | 变更中 |
| reviewing | 评审中 |
