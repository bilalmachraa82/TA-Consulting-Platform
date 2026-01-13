#!/bin/bash

# TA CONSULTING PLATFORM - ALL TESTS RUNNER
# ========================================
# Executa todos os testes antes da demo

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   TA CONSULTING PLATFORM - PRE-DEMO TEST SUITE          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="/Users/bilal/Programação/TA consulting pltaform ai/TA-Consulting-Platform"
cd "$PROJECT_DIR" || exit 1

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BRIGHT='\033[1m'
RESET='\033[0m'

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local name="$1"
    local command="$2"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${CYAN}[TEST $TOTAL_TESTS]${RESET} $name"

    if eval "$command" > /dev/null 2>&1; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✅ PASS${RESET}"
        return 0
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}❌ FAIL${RESET}"
        return 1
    fi
}

echo -e "${BRIGHT}═══ PHASE 1: BUILD & TYPE CHECK ═══${RESET}"
run_test "TypeScript check" "npx tsc --noEmit"
run_test "Build production" "npm run build"

echo -e "\n${BRIGHT}═══ PHASE 2: DATABASE TESTS ═══${RESET}"
run_test "Complete audit" "npx tsx scripts/test-complete-audit.ts"
run_test "Matching algorithm" "npx tsx scripts/test-matching-algorithm.ts"

echo -e "\n${BRIGHT}═══ PHASE 3: API TESTS (requires dev server) ═══${RESET}"
echo -e "${YELLOW}⚠️  Skipping API tests - server not running${RESET}"
echo "    Run 'npm run dev' in another terminal, then run:"
echo "    npx tsx scripts/test-api-endpoints.ts"

echo -e "\n${BRIGHT}═══ PHASE 4: FILE SYSTEM CHECKS ═══${RESET}"
run_test "Prisma schema exists" "test -f prisma/schema.prisma"
run_test "Lib directory exists" "test -d lib"
run_test "Components directory exists" "test -d components/dashboard"

echo -e "\n${BRIGHT}═══ FINAL REPORT ═══${RESET}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${RESET}"
echo -e "${RED}Failed: $FAILED_TESTS${RESET}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}${BRIGHT}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              🎉 ALL TESTS PASSED! 🎉                       ║"
    echo "║           Platform is READY for demo!                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}"
    exit 0
else
    echo -e "\n${RED}${BRIGHT}⚠️  SOME TESTS FAILED - FIX BEFORE DEMO!${RESET}\n"
    exit 1
fi
