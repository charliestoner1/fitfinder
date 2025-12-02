#!/bin/bash

# QA Master Test Runner
# Runs all test suites and generates a comprehensive report

QA_DIR="/Users/namtran/fitfinder/qa"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$QA_DIR/test_reports/REPORT_$TIMESTAMP.md"

# Create reports directory if it doesn't exist
mkdir -p "$QA_DIR/test_reports"

echo "=========================================="
echo "🚀 FITFINDER QA TEST SUITE"
echo "=========================================="
echo ""
echo "Test started: $(date)"
echo "Report: $REPORT_FILE"
echo ""

# Initialize report
cat > "$REPORT_FILE" << EOF
# FitFinder QA Test Report
**Generated**: $(date)

---

## 📊 Test Summary

EOF

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test and log results
run_test() {
    local test_name=$1
    local test_script=$2
    
    echo ""
    echo "Running: $test_name..."
    echo "---" >> "$REPORT_FILE"
    echo "## $test_name" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Run the test and capture output
    if bash "$test_script" >> "$REPORT_FILE" 2>&1; then
        echo "✅ PASSED: $test_name"
        ((PASSED_TESTS++))
    else
        echo "❌ FAILED: $test_name"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
    echo "" >> "$REPORT_FILE"
}

# Run all tests
echo "Starting test execution..."
echo ""

# Test 1: Database Migrations
if [ -f "$QA_DIR/tests/test_database.sh" ]; then
    run_test "Database Migrations" "$QA_DIR/tests/test_database.sh"
fi

# Test 2: Authentication
if [ -f "$QA_DIR/tests/test_auth.sh" ]; then
    run_test "Authentication & Authorization" "$QA_DIR/tests/test_auth.sh"
fi

# Test 3: API Endpoints
if [ -f "$QA_DIR/tests/test_api_endpoints.sh" ]; then
    run_test "API Endpoints" "$QA_DIR/tests/test_api_endpoints.sh"
fi

# Test 4: Recommendations
if [ -f "$QA_DIR/tests/test_recommendations.sh" ]; then
    run_test "Recommendations Engine" "$QA_DIR/tests/test_recommendations.sh"
fi

# Generate summary report
echo ""
echo "=========================================="
echo "📋 TEST EXECUTION COMPLETED"
echo "=========================================="
echo ""
echo "Results:"
echo "  Total Tests: $TOTAL_TESTS"
echo "  Passed: $PASSED_TESTS ✅"
echo "  Failed: $FAILED_TESTS ❌"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo "✅ ALL TESTS PASSED!"
else
    echo ""
    echo "⚠️  $FAILED_TESTS test(s) failed. See report for details."
fi

# Append summary to report
cat >> "$REPORT_FILE" << EOF

---

## 📊 Final Summary

| Metric | Value |
|--------|-------|
| Total Tests | $TOTAL_TESTS |
| Passed | $PASSED_TESTS ✅ |
| Failed | $FAILED_TESTS ❌ |
| Success Rate | $(( PASSED_TESTS * 100 / TOTAL_TESTS ))% |
| Timestamp | $(date) |

---

## 🔗 Test Suites Run

- [x] Database Migrations
- [x] Authentication & Authorization
- [x] API Endpoints
- [x] Recommendations Engine

---

## 📝 Notes

- All tests assume Django backend running on \`http://localhost:8000\`
- Tests create temporary test users for authentication tests
- API tests validate endpoint availability and HTTP status codes
- For detailed logs, check individual test output above

EOF

echo ""
echo "Full report saved to: $REPORT_FILE"
echo ""
echo "View report:"
echo "  cat $REPORT_FILE"
echo ""
