---
name: zd-sum
description: 统计指定周期的任务工时
argument-hint: <YYYYMM>
---

# 工时统计

统计指定周期内已完成任务的工时汇总。

## 脚本路径

```bash
# 动态查找插件目录（按优先级：项目级 > 用户级）
ZD_SCRIPT="$(find . -path '*/.claude/plugins/halosee-zd/scripts/zentao-api.sh' 2>/dev/null | head -1)"
[ -z "$ZD_SCRIPT" ] && ZD_SCRIPT="$HOME/.claude/plugins/halosee-zd/scripts/zentao-api.sh"
```

## 周期说明

工时周期由 `/zd-config --cycle` 设置，默认为每月 24 号：
- 周期 24 表示：从上月 24 号到本月 24 号为一个统计周期
- 例如 `/zd-sum 202504` 统计 2025-03-24 到 2025-04-24 之间的工时

## 使用方法

```bash
# 统计 2025 年 3 月 24 日到 4 月 24 日的工时
bash "$ZD_SCRIPT" sum 202504

# 统计 2025 年 2 月 24 日到 3 月 24 日的工时
bash "$ZD_SCRIPT" sum 202503
```

## 输出示例

```
工时统计: 2025-03-24 至 2025-04-24

已完成任务: 5 个
总消耗工时: 32 小时

任务明细:
[2] 测试任务API修复 - 1h
[3] 实现登录功能 - 8h
[5] 重构订单模块 - 16h
[6] 修复支付Bug - 4h
[8] 优化查询性能 - 3h
```

## 参数说明

| 参数 | 说明 | 格式 |
|------|------|------|
| 周期 | 年月 | YYYYMM |

## 注意事项

- 只统计状态为 `done` 的任务
- 按 `finishedDate`（完成日期）归属到对应周期
- 工时周期可在 `/zd-config` 中修改
