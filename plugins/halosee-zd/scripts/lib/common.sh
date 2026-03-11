#!/bin/bash
# Common functions - Colors, errors, config management

# Config paths
ZENTAO_CONFIG_DIR="${HOME}/.zentao-sync"
ZENTAO_CONFIG_FILE="${ZENTAO_CONFIG_DIR}/config.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}Warning: $1${NC}" >&2
}

success() {
    echo -e "${GREEN}$1${NC}"
}

init_config() {
    if [ ! -d "$ZENTAO_CONFIG_DIR" ]; then
        mkdir -p "$ZENTAO_CONFIG_DIR"
        chmod 700 "$ZENTAO_CONFIG_DIR"
    fi

    if [ ! -f "$ZENTAO_CONFIG_FILE" ]; then
        echo '{"zentao":{"url":"","token":"","account":"","password":"","cycle":24}}' > "$ZENTAO_CONFIG_FILE"
        chmod 600 "$ZENTAO_CONFIG_FILE"
    fi
}

get_config() {
    local key="$1"
    init_config
    jq -r "$key" "$ZENTAO_CONFIG_FILE"
}

get_zentao_url() {
    local url=$(get_config '.zentao.url')
    echo "${url%/}"
}

get_token() {
    get_config '.zentao.token'
}

get_account() {
    get_config '.zentao.account'
}

get_password() {
    get_config '.zentao.password'
}

get_cycle() {
    local cycle=$(get_config '.zentao.cycle')
    if [ -z "$cycle" ] || [ "$cycle" = "null" ]; then
        echo "24"
    else
        echo "$cycle"
    fi
}

set_config() {
    local key="$1"
    local value="$2"
    init_config

    local tmp_file=$(mktemp)
    if jq "$key = $value" "$ZENTAO_CONFIG_FILE" > "$tmp_file"; then
        mv "$tmp_file" "$ZENTAO_CONFIG_FILE"
        chmod 600 "$ZENTAO_CONFIG_FILE"
    else
        rm -f "$tmp_file"
        error "Failed to update config"
    fi
}
