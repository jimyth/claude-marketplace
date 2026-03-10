---
name: zd-create
description: 创建禅道任务
argument-hint: --name <任务名称> --execution <执行ID>
---

# 创建禅道任务

在禅道中创建新任务。

## 脚本路径

```bash
# 动态查找插件脚本（按优先级：缓存目录 > 用户级）
ZD_SCRIPT="$(find ~/.claude/plugins/cache -path '*/halosee-zd/*/scripts/zentao-api.sh' 2>/dev/null | head -1)"
[ -z "$ZD_SCRIPT" ] && ZD_SCRIPT="$HOME/.claude/plugins/halosee-zd/scripts/zentao-api.sh"
```

## 执行前确认

创建任务前，请**先向用户确认以下参数**：

**必填参数**：
- 任务名称
- 执行/迭代 ID（如用户不知道，先查询项目列表获取）

**可选参数**（建议询问）：
- 任务类型（默认：devel 开发）
- 优先级（默认：3）
- 预计工时（默认：8小时，复杂任务可增加）

## 获取执行 ID

```bash
# 查看项目列表
bash "$ZD_SCRIPT" projects

# 查看项目的执行/迭代
bash "$ZD_SCRIPT" executions <project_id>
```

## 使用方法

```bash
# 最简创建（使用默认值）
bash "$ZD_SCRIPT" create \
  --name "实现用户登录功能" \
  --execution 7

# 指定工时（复杂任务）
bash "$ZD_SCRIPT" create \
  --name "重构订单模块" \
  --execution 7 \
  --estimate 16 \
  --type devel \
  --pri 2
```

## 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| --name | 任务名称 | **必填** |
| --execution | 执行/迭代 ID | **必填** |
| --type | 任务类型 | devel |
| --pri | 优先级 (1-4) | 3 |
| --estimate | 最初预计工时 | 8 |
| --desc | 任务描述 | - |
| --assignedTo | 指派给 | - |

**任务类型**：devel(开发)、design(设计)、test(测试)、study(研究)、discuss(讨论)、ui(界面)、affair(事务)、misc(其他)

**自动填充**：预计开始日期（当天）、截止日期（7天后）、剩余工时（=预计工时）
