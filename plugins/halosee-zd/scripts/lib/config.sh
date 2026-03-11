#!/bin/bash
# Config functions - Configuration management commands

# Source common and api functions (same directory)
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${LIB_DIR}/common.sh"
source "${LIB_DIR}/api.sh"

do_config() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --url)
                set_config '.zentao.url' "\"$2\""
                success "URL set: $2"
                shift 2
                ;;
            --token)
                set_config '.zentao.token' "\"$2\""
                success "Token set"
                shift 2
                ;;
            --account)
                set_config '.zentao.account' "\"$2\""
                success "Account set: $2"
                shift 2
                ;;
            --password)
                set_config '.zentao.password' "\"$2\""
                success "Password set"
                shift 2
                ;;
            --cycle)
                set_config '.zentao.cycle' "$2"
                success "Cycle set: $2"
                shift 2
                ;;
            --show)
                echo "URL: $(get_zentao_url)"
                echo "Account: $(get_account)"
                echo "Cycle: $(get_cycle)"
                shift
                ;;
            --test)
                test_connection
                shift
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
}
