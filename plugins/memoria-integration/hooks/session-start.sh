#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 调用 Node.js bridge 处理 session_start
node "${PLUGIN_ROOT}/bin/memoria-bridge.js" --event=session_start
