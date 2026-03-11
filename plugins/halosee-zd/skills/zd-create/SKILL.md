---
name: zd-create
description: 创建禅道任务
argument-hint: <任务名称>
disable-model-invocation: true
allowed-tools: Bash
---

# 创建禅道任务

在禅道中创建新任务。

## 脚本路径

```bash
ZD_SCRIPT="$(find ~/.claude/plugins/cache -path '*/halosee-zd/*/scripts/zentao-api.sh' 2>/dev/null | head -1)"
[ -z "$ZD_SCRIPT" ] && ZD_SCRIPT="$HOME/.claude/plugins/halosee-zd/scripts/zentao-api.sh"
```

## 使用方式

### 方式一：直接创建（推荐）

```
/zd-create 实现用户登录功能
```

Claude 会自动：
1. 查询项目列表，让用户选择目标项目
2. 获取该项目的执行/迭代，让用户选择
3. 使用默认值创建任务

### 方式二：完整参数

```
/zd-create 实现用户登录功能 --execution 7 --estimate 16
```

## 执行步骤

### 1. 解析任务名称

任务名称: `$ARGUMENTS` 中 `--` 之前的部分

### 2. 获取执行 ID（如用户未指定）

```bash
# 列出项目供用户选择
bash "$ZD_SCRIPT" projects

# 用户选择项目后，列出执行/迭代
bash "$ZD_SCRIPT" executions <project_id>
```

### 3. 创建任务

```bash
bash "$ZD_SCRIPT" create \
  --name "<任务名称>" \
  --execution <执行ID> \
  --estimate <工时，默认8>
```

## 参数说明

| 参数 | 来源 | 默认值 |
|------|------|--------|
| 任务名称 | `$ARGUMENTS` 或询问 | **必填** |
| --execution | 询问或参数 | **必填** |
| --estimate | 参数 | 8 |
| --type | 参数 | devel |
| --pri | 参数 | 3 |

**任务类型**：devel(开发)、design(设计)、test(测试)、study(研究)、discuss(讨论)、ui(界面)、affair(事务)、misc(其他)
