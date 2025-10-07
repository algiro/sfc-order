# SFC Order Application Manual Test Script (PowerShell)
# This script helps verify basic functionality of the application

Write-Host "🧪 SFC Order Application - Manual Test Cases" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Function to test URL and check response
function Test-Url {
    param([string]$url, [string]$description)
    
    Write-Host "Testing: $description" -ForegroundColor Yellow
    Write-Host "URL: $url"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PASS: HTTP $($response.StatusCode)" -ForegroundColor Green
        } else {
            Write-Host "❌ FAIL: HTTP $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ FAIL: Connection error - $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Function to test API endpoint
function Test-Api {
    param([string]$endpoint, [string]$description)
    
    Write-Host "Testing API: $description" -ForegroundColor Yellow
    Write-Host "Endpoint: $endpoint"
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method GET -TimeoutSec 10
        Write-Host "✅ PASS: API responded successfully" -ForegroundColor Green
        
        # Show response preview
        $responseText = $response | ConvertTo-Json -Compress
        if ($responseText.Length -gt 100) {
            $preview = $responseText.Substring(0, 100) + "..."
        } else {
            $preview = $responseText
        }
        Write-Host "Response preview: $preview" -ForegroundColor Gray
    } catch {
        Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "1. BASIC CONNECTIVITY TESTS" -ForegroundColor Magenta
Write-Host "----------------------------"

# Test if application is running
Test-Url "http://localhost:3000" "Frontend Application"
Test-Url "http://localhost:3001/health" "Backend Health Check"

Write-Host "2. API ENDPOINT TESTS" -ForegroundColor Magenta
Write-Host "---------------------"

# Test API endpoints
Test-Api "http://localhost:3001/api/users" "Users API"
Test-Api "http://localhost:3001/api/tables" "Tables API"
Test-Api "http://localhost:3001/api/menu/categories" "Menu Categories API"

Write-Host "3. MENU ITEMS API TESTS" -ForegroundColor Magenta
Write-Host "-----------------------"

# Test menu items for each category
Test-Api "http://localhost:3001/api/menu/items/cafes" "Cafés Menu Items"
Test-Api "http://localhost:3001/api/menu/items/te" "Té Menu Items"
Test-Api "http://localhost:3001/api/menu/items/bebidas" "Bebidas Menu Items"
Test-Api "http://localhost:3001/api/menu/items/tostas" "Tostas Menu Items"
Test-Api "http://localhost:3001/api/menu/items/arepas" "Arepas Menu Items"
Test-Api "http://localhost:3001/api/menu/items/cuencos" "Cuencos Menu Items"
Test-Api "http://localhost:3001/api/menu/items/smoothies" "Smoothies Menu Items"

Write-Host "4. SPECIAL API TESTS" -ForegroundColor Magenta
Write-Host "--------------------"

Test-Api "http://localhost:3001/api/fruits" "Fruits API (for builders)"

Write-Host "🎯 MANUAL TESTING CHECKLIST" -ForegroundColor Cyan
Write-Host "============================"
Write-Host ""
Write-Host "Please manually verify the following in your browser at http://localhost:3000:" -ForegroundColor White
Write-Host ""
Write-Host "□ 1. HOME PAGE" -ForegroundColor Green
Write-Host "   □ Main navigation shows: Tomar Pedidos, Lista Cocina, Mesas, Archivo"
Write-Host "   □ Language toggle button works (🇺🇸 EN / 🇪🇸 ES)"
Write-Host "   □ Title shows 'SFC Order'"
Write-Host ""
Write-Host "□ 2. TOMAR PEDIDOS SECTION" -ForegroundColor Green
Write-Host "   □ Shows 'Seleccionar Mesa' screen"
Write-Host "   □ Can select a table (buttons 1-10 visible)"
Write-Host "   □ After selecting table, shows waiter selection"
Write-Host "   □ After selecting waiter, shows category grid"
Write-Host "   □ Categories visible: Cafés, Té, Bebidas, Tostas, Arepas, Cuencos, Smoothies"
Write-Host ""
Write-Host "□ 3. MENU CATEGORIES (Test each one)" -ForegroundColor Green
Write-Host "   □ Cafés: Click -> Should show items or 'No hay items disponibles'"
Write-Host "   □ Té: Click -> Should show items or 'No hay items disponibles'"  
Write-Host "   □ Bebidas: Click -> Should show items or 'No hay items disponibles'"
Write-Host "   □ Tostas: Click -> Should show items or 'No hay items disponibles'"
Write-Host "   □ Arepas: Click -> Should show items or 'No hay items disponibles'"
Write-Host "   □ Cuencos: Click -> Should show bowl builder interface"
Write-Host "   □ Smoothies: Click -> Should show smoothie builder interface"
Write-Host ""
Write-Host "□ 4. NAVIGATION" -ForegroundColor Green
Write-Host "   □ Back buttons work from each section"
Write-Host "   □ Can navigate between categories"
Write-Host "   □ Can return to main menu from any section"
Write-Host ""
Write-Host "□ 5. OTHER SECTIONS" -ForegroundColor Green
Write-Host "   □ Lista Cocina: Shows kitchen interface"
Write-Host "   □ Mesas: Shows table status"
Write-Host "   □ Archivo: Shows order archive"
Write-Host ""
Write-Host "❌ COMMON ISSUES TO CHECK:" -ForegroundColor Red
Write-Host "   □ Empty pages (no content loading)"
Write-Host "   □ JavaScript errors in browser console (F12)"
Write-Host "   □ Network errors (check Network tab in DevTools)"
Write-Host "   □ Translation errors (missing text or keys showing)"
Write-Host ""
Write-Host "🔧 If you see issues:" -ForegroundColor Yellow
Write-Host "   1. Check browser console for JavaScript errors"
Write-Host "   2. Check Network tab for failed API calls"
Write-Host "   3. Verify Docker containers are running: docker ps"
Write-Host "   4. Check container logs: docker logs sfc-order-sfc-order-frontend-1"
Write-Host ""

# Final status check
Write-Host "🚀 QUICK STATUS CHECK" -ForegroundColor Cyan
Write-Host "====================="

try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "sfc-order"
    if ($containers) {
        Write-Host "Docker containers:" -ForegroundColor Green
        $containers | ForEach-Object { Write-Host "  $_" }
    } else {
        Write-Host "❌ No SFC Order containers found running!" -ForegroundColor Red
        Write-Host "Run: docker compose up -d" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Docker not available or containers not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "To start manual testing, open: http://localhost:3000" -ForegroundColor Cyan