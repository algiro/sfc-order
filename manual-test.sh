#!/bin/bash

# SFC Order Application Manual Test Script
# This script helps verify basic functionality of the application

echo "🧪 SFC Order Application - Manual Test Cases"
echo "============================================="
echo ""

# Function to test URL and check response
test_url() {
    local url=$1
    local description=$2
    echo "Testing: $description"
    echo "URL: $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$response" == "200" ]; then
        echo "✅ PASS: HTTP $response"
    else
        echo "❌ FAIL: HTTP $response"
    fi
    echo ""
}

# Function to test API endpoint
test_api() {
    local endpoint=$1
    local description=$2
    echo "Testing API: $description"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -w "%{http_code}" "$endpoint")
    http_code=$(echo "$response" | tail -c 4)
    
    if [ "$http_code" == "200" ]; then
        echo "✅ PASS: HTTP $http_code"
        # Show first few characters of response
        content=$(echo "$response" | head -c 100)
        echo "Response preview: $content..."
    else
        echo "❌ FAIL: HTTP $http_code"
        echo "Response: $response"
    fi
    echo ""
}

echo "1. BASIC CONNECTIVITY TESTS"
echo "----------------------------"

# Test if application is running
test_url "http://localhost:3000" "Frontend Application"
test_url "http://localhost:3001/health" "Backend Health Check"

echo "2. API ENDPOINT TESTS"
echo "---------------------"

# Test API endpoints
test_api "http://localhost:3001/api/users" "Users API"
test_api "http://localhost:3001/api/tables" "Tables API"
test_api "http://localhost:3001/api/menu/categories" "Menu Categories API"

echo "3. MENU ITEMS API TESTS"
echo "-----------------------"

# Test menu items for each category
test_api "http://localhost:3001/api/menu/items/cafes" "Cafés Menu Items"
test_api "http://localhost:3001/api/menu/items/te" "Té Menu Items"
test_api "http://localhost:3001/api/menu/items/bebidas" "Bebidas Menu Items"
test_api "http://localhost:3001/api/menu/items/tostas" "Tostas Menu Items"
test_api "http://localhost:3001/api/menu/items/arepas" "Arepas Menu Items"
test_api "http://localhost:3001/api/menu/items/cuencos" "Cuencos Menu Items"
test_api "http://localhost:3001/api/menu/items/smoothies" "Smoothies Menu Items"

echo "4. SPECIAL API TESTS"
echo "--------------------"

test_api "http://localhost:3001/api/fruits" "Fruits API (for builders)"

echo "🎯 MANUAL TESTING CHECKLIST"
echo "============================"
echo ""
echo "Please manually verify the following in your browser at http://localhost:3000:"
echo ""
echo "□ 1. HOME PAGE"
echo "   □ Main navigation shows: Tomar Pedidos, Lista Cocina, Mesas, Archivo"
echo "   □ Language toggle button works (🇺🇸 EN / 🇪🇸 ES)"
echo "   □ Title shows 'SFC Order'"
echo ""
echo "□ 2. TOMAR PEDIDOS SECTION"
echo "   □ Shows 'Seleccionar Mesa' screen"
echo "   □ Can select a table (buttons 1-10 visible)"
echo "   □ After selecting table, shows waiter selection"
echo "   □ After selecting waiter, shows category grid"
echo "   □ Categories visible: Cafés, Té, Bebidas, Tostas, Arepas, Cuencos, Smoothies"
echo ""
echo "□ 3. MENU CATEGORIES (Test each one)"
echo "   □ Cafés: Click -> Should show items or 'No hay items disponibles'"
echo "   □ Té: Click -> Should show items or 'No hay items disponibles'"  
echo "   □ Bebidas: Click -> Should show items or 'No hay items disponibles'"
echo "   □ Tostas: Click -> Should show items or 'No hay items disponibles'"
echo "   □ Arepas: Click -> Should show items or 'No hay items disponibles'"
echo "   □ Cuencos: Click -> Should show bowl builder interface"
echo "   □ Smoothies: Click -> Should show smoothie builder interface"
echo ""
echo "□ 4. NAVIGATION"
echo "   □ Back buttons work from each section"
echo "   □ Can navigate between categories"
echo "   □ Can return to main menu from any section"
echo ""
echo "□ 5. OTHER SECTIONS"
echo "   □ Lista Cocina: Shows kitchen interface"
echo "   □ Mesas: Shows table status"
echo "   □ Archivo: Shows order archive"
echo ""
echo "❌ COMMON ISSUES TO CHECK:"
echo "   □ Empty pages (no content loading)"
echo "   □ JavaScript errors in browser console"
echo "   □ Network errors (check Network tab in DevTools)"
echo "   □ Translation errors (missing text or keys showing)"
echo ""
echo "🔧 If you see issues:"
echo "   1. Check browser console for JavaScript errors"
echo "   2. Check Network tab for failed API calls"
echo "   3. Verify Docker containers are running: docker ps"
echo "   4. Check container logs: docker logs sfc-order-sfc-order-frontend-1"
echo ""