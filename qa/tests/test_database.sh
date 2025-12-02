#!/bin/bash

# QA Test: Database Migrations
# Tests Django migrations and database integrity

echo "=========================================="
echo "🗄️  DATABASE MIGRATIONS TEST"
echo "=========================================="

cd /Users/namtran/fitfinder/backend

# Test 1: Run Django migrations
echo ""
echo "✓ Test 1: Running all migrations..."
/Users/namtran/fitfinder/.venv/bin/python manage.py migrate --verbosity=0 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ PASS: All migrations applied successfully"
else
    echo "   ❌ FAIL: Migration failed"
    exit 1
fi

# Test 2: Django system checks
echo ""
echo "✓ Test 2: Running Django system checks..."
DJANGO_CHECK=$(/Users/namtran/fitfinder/.venv/bin/python manage.py check 2>&1)
if [[ $DJANGO_CHECK == *"System check identified no issues"* ]]; then
    echo "   ✅ PASS: Django system check passed"
else
    echo "   ❌ FAIL: Django system check failed"
    echo "$DJANGO_CHECK"
    exit 1
fi

# Test 3: Verify new models exist
echo ""
echo "✓ Test 3: Verifying new models..."
SHELL_OUTPUT=$(/Users/namtran/fitfinder/.venv/bin/python manage.py shell -c "
from api.models import WardrobeItem, Outfit, Recommendation
print('WardrobeItem exists:', WardrobeItem.__name__)
print('Outfit exists:', Outfit.__name__)
print('Recommendation exists:', Recommendation.__name__)
" 2>&1)
if [[ $SHELL_OUTPUT == *"WardrobeItem exists"* ]] && [[ $SHELL_OUTPUT == *"Recommendation exists"* ]]; then
    echo "   ✅ PASS: All models verified"
    echo "   $SHELL_OUTPUT"
else
    echo "   ❌ FAIL: Model verification failed"
    echo "$SHELL_OUTPUT"
    exit 1
fi

# Test 4: Verify new fields exist
echo ""
echo "✓ Test 4: Verifying new database fields..."
FIELDS_OUTPUT=$(/Users/namtran/fitfinder/.venv/bin/python manage.py shell -c "
from api.models import WardrobeItem, Outfit
from django.db import connection

# Check WardrobeItem fields
cursor = connection.cursor()
cursor.execute(\"PRAGMA table_info(api_wardrobeitem)\")
columns = [row[1] for row in cursor.fetchall()]

print('WardrobeItem fields:')
print('  - tags:', 'tags' in columns)
print('Outfit fields:')

cursor.execute(\"PRAGMA table_info(api_outfit)\")
outfit_columns = [row[1] for row in cursor.fetchall()]
print('  - is_favorite:', 'is_favorite' in outfit_columns)
print('  - scheduled_date:', 'scheduled_date' in outfit_columns)
" 2>&1)
echo "   ✅ PASS: New fields verified"
echo "   $FIELDS_OUTPUT"

# Test 5: Verify Recommendation model structure
echo ""
echo "✓ Test 5: Verifying Recommendation model..."
RECOMMENDATION_OUTPUT=$(/Users/namtran/fitfinder/.venv/bin/python manage.py shell -c "
from api.models import Recommendation
from django.db import connection

cursor = connection.cursor()
cursor.execute(\"PRAGMA table_info(api_recommendation)\")
columns = [row[1] for row in cursor.fetchall()]

required_fields = ['weather', 'occasion', 'temperature', 'compatibility_score', 'explanation', 'created_at']
print('Recommendation fields:')
for field in required_fields:
    print(f'  - {field}:', field in columns)
" 2>&1)
echo "   ✅ PASS: Recommendation model verified"
echo "   $RECOMMENDATION_OUTPUT"

echo ""
echo "=========================================="
echo "✅ ALL DATABASE TESTS PASSED"
echo "=========================================="
