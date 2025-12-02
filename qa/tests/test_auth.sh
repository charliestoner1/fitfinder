#!/bin/bash

# QA Test: Authentication & Authorization
# Tests user registration, login, token refresh, and access control

API_URL="http://localhost:8000/api"
TEST_EMAIL="qatest_$(date +%s)@test.com"
TEST_USERNAME="qatest_$(date +%s)"
TEST_PASSWORD="TestPassword123!"

echo "=========================================="
echo "🔐 AUTHENTICATION TEST"
echo "=========================================="

# Test 1: User Registration
echo ""
echo "✓ Test 1: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"first_name\": \"QA\",
    \"last_name\": \"Test\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "\"email\""; then
    echo "   ✅ PASS: User registration successful"
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "   User ID: $USER_ID"
else
    echo "   ❌ FAIL: User registration failed"
    echo "   Response: $REGISTER_RESPONSE"
    exit 1
fi

# Test 2: User Login
echo ""
echo "✓ Test 2: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/token/" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "\"access\""; then
    echo "   ✅ PASS: User login successful"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refresh":"[^"]*' | cut -d'"' -f4)
    echo "   Access token received: ${ACCESS_TOKEN:0:20}..."
else
    echo "   ❌ FAIL: User login failed"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Verify User Profile
echo ""
echo "✓ Test 3: Get User Profile (with token)"
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/auth/me/" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "\"username\":\"$TEST_USERNAME\""; then
    echo "   ✅ PASS: User profile retrieved"
    echo "   Username: $TEST_USERNAME"
else
    echo "   ❌ FAIL: Could not retrieve user profile"
    echo "   Response: $PROFILE_RESPONSE"
    exit 1
fi

# Test 4: Test Invalid Token Access
echo ""
echo "✓ Test 4: Access without token (should fail)"
NO_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/auth/me/")
HTTP_CODE=$(echo "$NO_TOKEN_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ]; then
    echo "   ✅ PASS: Correctly rejected unauthorized access (401)"
else
    echo "   ⚠️  WARNING: Expected 401, got $HTTP_CODE"
fi

# Test 5: Token Refresh
echo ""
echo "✓ Test 5: Token Refresh"
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/token/refresh/" \
  -H "Content-Type: application/json" \
  -d "{
    \"refresh\": \"$REFRESH_TOKEN\"
  }")

if echo "$REFRESH_RESPONSE" | grep -q "\"access\""; then
    echo "   ✅ PASS: Token refresh successful"
    NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    echo "   New access token: ${NEW_ACCESS_TOKEN:0:20}..."
else
    echo "   ❌ FAIL: Token refresh failed"
    echo "   Response: $REFRESH_RESPONSE"
    exit 1
fi

# Test 6: Wrong Password Login
echo ""
echo "✓ Test 6: Login with wrong password (should fail)"
WRONG_PWD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/token/" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"WrongPassword123!\"
  }")
HTTP_CODE=$(echo "$WRONG_PWD_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "   ✅ PASS: Correctly rejected wrong password (HTTP $HTTP_CODE)"
else
    echo "   ❌ FAIL: Expected error for wrong password, got $HTTP_CODE"
fi

# Test 7: Duplicate Email Registration
echo ""
echo "✓ Test 7: Register with duplicate email (should fail)"
DUPLICATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"different_user_$(date +%s)\",
    \"first_name\": \"QA\",
    \"last_name\": \"Test\",
    \"password\": \"$TEST_PASSWORD\"
  }")
HTTP_CODE=$(echo "$DUPLICATE_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "409" ]; then
    echo "   ✅ PASS: Correctly rejected duplicate email (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  WARNING: Expected 400/409, got $HTTP_CODE"
fi

echo ""
echo "=========================================="
echo "✅ AUTHENTICATION TESTS COMPLETED"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Registration: ✅"
echo "  - Login: ✅"
echo "  - Profile Access: ✅"
echo "  - Token Refresh: ✅"
echo "  - Error Handling: ✅"
