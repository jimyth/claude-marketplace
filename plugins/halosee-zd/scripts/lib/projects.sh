#!/bin/bash
# Project functions - List projects and executions

# Source common and api functions (same directory)
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${LIB_DIR}/common.sh"
source "${LIB_DIR}/api.sh"

do_projects() {
    echo "Fetching projects..."
    local result=$(api_get "/projects")

    if is_api_success "$result"; then
        echo "$result" | jq -r '.projects[]? // .[]? | "\(.id)\t\(.name)\t\(.status)"' | column -t -s $'\t'
    else
        error "Failed to get projects: $(parse_api_error "$result")"
    fi
}

do_executions() {
    local project_id="$1"
    [ -z "$project_id" ] && error "Project ID required: executions <project_id>"

    echo "Fetching executions for project #$project_id..."
    local result=$(api_get "/projects/$project_id/executions")

    if is_api_success "$result"; then
        echo "$result" | jq -r '.executions[]? // .[]? | "\(.id)\t\(.name)\t\(.status)"' | column -t -s $'\t'
    else
        error "Failed to get executions: $(parse_api_error "$result")"
    fi
}
