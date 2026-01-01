# API Security Test Script
# This script tests if your API endpoints are properly secured

$baseUrl = "http://localhost:5000"

Write-Host "`n=== Testing API Security ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl`n" -ForegroundColor Gray

# Test 1: Try to access boards without token
Write-Host "Test 1: Accessing /api/boards/user/123 WITHOUT token" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/boards/user/123" -Method GET -ErrorAction Stop
    Write-Host "❌ FAILED: Got response (should be blocked!)" -ForegroundColor Red
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASSED: Got 401 Unauthorized (correct!)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 2: Try to access admin panel without token
Write-Host "`nTest 2: Accessing /api/admin/all-students WITHOUT token" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/all-students" -Method GET -ErrorAction Stop
    Write-Host "❌ FAILED: Got response (should be blocked!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASSED: Got 401 Unauthorized (correct!)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 3: Try to upload image without token
Write-Host "`nTest 3: Uploading image WITHOUT token" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/images/upload" -Method POST -ErrorAction Stop
    Write-Host "❌ FAILED: Got response (should be blocked!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASSED: Got 401 Unauthorized (correct!)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 4: Try to create board without token
Write-Host "`nTest 4: Creating board WITHOUT token" -ForegroundColor Yellow
try {
    $body = @{
        name = "Test Board"
        roomId = "test-123"
        userId = "fake-user-id"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/boards/create" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ FAILED: Got response (should be blocked!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASSED: Got 401 Unauthorized (correct!)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "If all tests show ✅ PASSED, your API is properly secured!" -ForegroundColor Green
Write-Host "`nNote: Login and Signup endpoints should still work without tokens (they're public)." -ForegroundColor Gray
