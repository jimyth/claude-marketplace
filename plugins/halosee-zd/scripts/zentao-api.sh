#!/bin/bash
# Zentao API Client - Modular Architecture
# Create and manage Zentao tasks

set -e

# Get script directory and source all modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/common.sh"
source "${SCRIPT_DIR}/lib/api.sh"
source "${SCRIPT_DIR}/lib/config.sh"
source "${SCRIPT_DIR}/lib/projects.sh"
source "${SCRIPT_DIR}/lib/tasks.sh"
source "${SCRIPT_DIR}/lib/sum.sh"

# Main command dispatch
case "${1:-}" in
    "login") shift; zentao_login ;;
    "config") shift; do_config "$@" ;;
    "projects") shift; do_projects ;;
    "executions") shift; do_executions "$1" ;;
    "create") shift; do_create "$@" ;;
    "list") shift; do_list "$@" ;;
    "view") shift; do_view "$1" ;;
    "start") shift; do_start "$@" ;;
    "finish") shift; do_finish "$@" ;;
    "sum") shift; do_sum "$1" ;;
    *)
        echo "Zentao Sync Tool"
        echo ""
        echo "Usage: zentao-api.sh <command> [options]"
        echo ""
        echo "Commands:"
        echo "  login       Login and get token"
        echo "  config      Configure settings"
        echo "  projects    List all projects"
        echo "  executions  List executions in a project"
        echo "  create      Create a new task"
        echo "  list        List my tasks"
        echo "  view        View task details"
        echo "  start       Start a task"
        echo "  finish      Complete a task"
        echo "  sum         Summarize hours for a period"
        echo ""
        echo "Create task options:"
        echo "  --name        Task name (required)"
        echo "  --execution   Execution/iteration ID (required)"
        echo "  --type        Task type: devel,design,test,study,discuss,ui,affair,misc (default: devel)"
        echo "  --pri         Priority 1-4 (default: 3)"
        echo "  --estimate    Estimated hours (default: 8)"
        echo "  --left        Remaining hours (default: same as estimate)"
        echo "  --desc        Task description"
        echo "  --assignedTo  Assign to account (default: current user)"
        echo "  --story       Related story ID"
        echo "  --deadline    Deadline date (default: 7 days later)"
        echo "  --no-start    Don't auto-start after creation"
        echo ""
        echo "Config options:"
        echo "  --url         Zentao server URL"
        echo "  --account     Login account"
        echo "  --password    Login password"
        echo "  --cycle       Work hours cycle day (default: 24)"
        echo "  --show        Show current config"
        echo "  --test        Test connection"
        ;;
esac
