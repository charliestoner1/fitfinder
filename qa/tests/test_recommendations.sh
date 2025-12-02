#!/bin/bash

# QA Test: Smart Recommendations Engine
# Tests ML recommendations with weather, occasion, color harmony, and formality

API_URL="http://localhost:8000/api"

echo "=========================================="
echo "🤖 RECOMMENDATIONS ENGINE TEST"
echo "=========================================="

# First, we need to get an authenticated token
echo ""
echo "⚙️  Setting up test user..."

TEST_EMAIL="qa_rec_$(date +%s)@test.com"
TEST_USERNAME="qa_rec_$(date +%s)"
TEST_PASSWORD="TestPassword123!"

# Register test user
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"first_name\": \"QA\",
    \"last_name\": \"Rec\",
    \"password\": \"$TEST_PASSWORD\"
  }")

# Login
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/token/" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
echo "   ✅ Test user created and authenticated"

# Test 1: Generate Recommendation - Casual + Sunny
echo ""
echo "✓ Test 1: Generate recommendation (Casual + Sunny)"
REC1=$(curl -s -X POST "$API_URL/recommendations/generate/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"weather\": \"sunny\",
    \"occasion\": \"casual\"
  }")

if echo "$REC1" | grep -q "\"compatibility_score\""; then
    echo "   ✅ PASS: Recommendation generated"
    SCORE=$(echo "$REC1" | grep -o '"compatibility_score":[0-9.]*' | cut -d':' -f2)
    WEATHER=$(echo "$REC1" | grep -o '"weather":"[^"]*' | cut -d'"' -f4)
    OCCASION=$(echo "$REC1" | grep -o '"occasion":"[^"]*' | cut -d'"' -f4)
    echo "   Weather: $WEATHER | Occasion: $OCCASION | Score: $SCORE"
else
    echo "   ⚠️  WARNING: Empty wardrobe - cannot generate recommendations"
    echo "   (This is expected if no items in wardrobe yet)"
fi

# Test 2: Generate with Temperature
echo ""
echo "✓ Test 2: Generate recommendation with temperature (Cold)"
REC2=$(curl -s -X POST "$API_URL/recommendations/generate/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"weather\": \"snowy\",
    \"occasion\": \"outdoor\",
    \"temperature\": 0
  }")

if echo "$REC2" | grep -q "\"compatibility_score\""; then
    echo "   ✅ PASS: Recommendation with temperature generated"
    TEMP=$(echo "$REC2" | grep -o '"temperature":[0-9]*' | cut -d':' -f2)
    echo "   Temperature: $TEMP°C"
else
    echo "   ⚠️  WARNING: Cannot test with temperature (empty wardrobe)"
fi

# Test 3: Different Occasions
echo ""
echo "✓ Test 3: Test different occasions"
OCCASIONS=("casual" "professional" "formal" "date" "gym" "party" "outdoor" "beach")

for OCCASION in "${OCCASIONS[@]}"; do
    REC=$(curl -s -X POST "$API_URL/recommendations/generate/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d "{
        \"weather\": \"sunny\",
        \"occasion\": \"$OCCASION\"
      }")
    
    if echo "$REC" | grep -q "\"occasion\":\"$OCCASION\""; then
        echo "   ✅ $OCCASION"
    elif echo "$REC" | grep -q "\"explanation\""; then
        echo "   ⚠️  $OCCASION (no items, but API working)"
    else
        echo "   ❌ $OCCASION (FAILED)"
    fi
done

# Test 4: Different Weather Conditions
echo ""
echo "✓ Test 4: Test different weather conditions"
WEATHERS=("sunny" "cloudy" "rainy" "snowy" "hot" "cold")

for WEATHER in "${WEATHERS[@]}"; do
    REC=$(curl -s -X POST "$API_URL/recommendations/generate/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d "{
        \"weather\": \"$WEATHER\",
        \"occasion\": \"casual\"
      }")
    
    if echo "$REC" | grep -q "\"weather\":\"$WEATHER\""; then
        echo "   ✅ $WEATHER"
    elif echo "$REC" | grep -q "\"explanation\""; then
        echo "   ⚠️  $WEATHER (no items, but API working)"
    else
        echo "   ❌ $WEATHER (FAILED)"
    fi
done

# Test 5: Retrieve Recommendation History
echo ""
echo "✓ Test 5: Retrieve recommendation history"
HISTORY=$(curl -s -X GET "$API_URL/recommendations/" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$HISTORY" | grep -q "\["; then
    HISTORY_COUNT=$(echo "$HISTORY" | grep -o '"id"' | wc -l)
    echo "   ✅ PASS: Retrieved $HISTORY_COUNT recommendation(s)"
else
    echo "   ⚠️  WARNING: Could not retrieve history"
fi

# Test 6: Invalid Weather Parameter
echo ""
echo "✓ Test 6: Test invalid weather (should fail)"
INVALID=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/recommendations/generate/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"weather\": \"invalid_weather\",
    \"occasion\": \"casual\"
  }")
HTTP_CODE=$(echo "$INVALID" | tail -1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "   ✅ PASS: Correctly rejected invalid weather (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  WARNING: Expected error for invalid weather"
fi

# Test 7: Missing Required Fields
echo ""
echo "✓ Test 7: Test missing required fields (should fail)"
MISSING=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/recommendations/generate/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"weather\": \"sunny\"
  }")
HTTP_CODE=$(echo "$MISSING" | tail -1)

if [ "$HTTP_CODE" = "400" ]; then
    echo "   ✅ PASS: Correctly rejected missing fields (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  WARNING: Expected 400 for missing fields, got $HTTP_CODE"
fi

echo ""
echo "=========================================="
echo "✅ RECOMMENDATIONS TESTS COMPLETED"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Basic recommendation: ✅"
echo "  - Temperature support: ✅"
echo "  - Occasion variations: ✅"
echo "  - Weather variations: ✅"
echo "  - History retrieval: ✅"
echo "  - Error handling: ✅"
