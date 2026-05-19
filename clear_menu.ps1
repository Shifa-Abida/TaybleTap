$headers = @{ "Content-Type" = "application/json" }
$body = '{"email":"shifa@test.com","password":"test123456"}'
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method Post -Headers $headers -Body $body
$token = $login.token
$menuHeaders = @{ "Authorization" = "Bearer $token" }

# Get all items
$get = Invoke-RestMethod -Uri "http://localhost:8000/api/menu/" -Method Get -Headers $menuHeaders
$items = $get.items
Write-Host "Found" $items.Count "existing items, deleting..."

# Delete each item
foreach ($item in $items) {
    Invoke-RestMethod -Uri "http://localhost:8000/api/menu/$($item.id)/" -Method Delete -Headers $menuHeaders -ErrorAction SilentlyContinue | Out-Null
}
Write-Host "All items deleted"
