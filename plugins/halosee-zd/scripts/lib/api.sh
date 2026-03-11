#!/bin/bash
# API functions - Login, requests, error handling

# Source common functions (same directory)
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${LIB_DIR}/common.sh"

zentao_login() {
    local base_url=$(get_zentao_url)
    local account=$(get_account)
    local password=$(get_password)

    if [ -z "$base_url" ]; then
        error "URL not configured. Run: /zentao-config --url <url>"
    fi

    if [ -z "$account" ] || [ -z "$password" ]; then
        error "Account or password not configured. Run: /zentao-config --account <account> --password <password>"
    fi

    echo "Logging in..."

    local response=$(curl -s -X POST "${base_url}/api.php/v1/tokens" \
        -H "Content-Type: application/json" \
        -d "{\"account\":\"${account}\",\"password\":\"${password}\"}" 2>/dev/null)

    if [ -z "$response" ]; then
        error "Cannot connect to Zentao API. Check URL."
    fi

    local token=$(echo "$response" | jq -r '.token // empty' 2>/dev/null)

    if [ -n "$token" ] && [ "$token" != "null" ]; then
        success "Login successful"
        set_config '.zentao.token' "\"$token\""
        echo "$token"
    else
        local err_msg=$(echo "$response" | jq -r '.error // .message // "Unknown error"' 2>/dev/null)
        error "Login failed: $err_msg"
    fi
}

api_request() {
    local method="$1"
    local endpoint="$2"
    local data="${3:-}"

    local base_url=$(get_zentao_url)
    local token=$(get_token)

    if [ -z "$base_url" ]; then
        error "URL not configured"
    fi

    if [ -z "$token" ] || [ "$token" = "null" ]; then
        warn "Token not found, logging in..."
        token=$(zentao_login)
        if [ -z "$token" ]; then
            error "Login failed"
        fi
    fi

    local url="${base_url}/api.php/v1${endpoint}"
    local args=(-s -X "$method" -H "Content-Type: application/json" -H "Token: $token")

    if [ -n "$data" ]; then
        args+=(-d "$data")
    fi

    local response http_code
    response=$(curl "${args[@]}" -w "\n%{http_code}" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    response=$(echo "$response" | sed '$d')

    if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
        if [ "$http_code" = "401" ]; then
            warn "Token expired, re-logging in..."
            set_config '.zentao.token' '""'
            token=$(zentao_login)
            if [ -n "$token" ]; then
                args=(-s -X "$method" -H "Content-Type: application/json" -H "Token: $token")
                [ -n "$data" ] && args+=(-d "$data")
                response=$(curl "${args[@]}" -w "\n%{http_code}" "$url" 2>/dev/null)
                http_code=$(echo "$response" | tail -n1)
                response=$(echo "$response" | sed '$d')
            fi
        fi

        if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
            error "API request failed (HTTP $http_code): $response"
        fi
    fi

    echo "$response"
}

api_get() {
    api_request "GET" "$1"
}

api_post() {
    api_request "POST" "$1" "$2"
}

is_api_success() {
    local response="$1"
    local error=$(echo "$response" | jq -r '.error // empty' 2>/dev/null)
    [ -z "$error" ]
}

parse_api_error() {
    local response="$1"
    echo "$response" | jq -r '.error // .message // "Unknown error"' 2>/dev/null
}

test_connection() {
    local base_url=$(get_zentao_url)
    [ -z "$base_url" ] && error "URL not configured"

    echo "Testing connection: $base_url"

    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${base_url}/" 2>/dev/null)
    if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
        success "Zentao service accessible"
    else
        error "Cannot access Zentao (HTTP $http_code)"
    fi

    zentao_login
}
