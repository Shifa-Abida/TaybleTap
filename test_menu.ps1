$headers = @{ "Content-Type" = "application/json" }
$body = '{"email":"shifa@test.com","password":"test123456"}'
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method Post -Headers $headers -Body $body
$token = $login.token
Write-Host "1. Login OK"

$menuHeaders = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# GET menu items
$get = Invoke-RestMethod -Uri "http://localhost:8000/api/menu/" -Method Get -Headers $menuHeaders
Write-Host "2. GET menu items:" $get.items.Count "items"

# POST new item
$addBody = '{"name":"Paneer Tikka","price":220,"category":"Starters","desc":"Grilled paneer cubes","available":true}'
$add = Invoke-RestMethod -Uri "http://localhost:8000/api/menu/" -Method Post -Headers $menuHeaders -Body $addBody
$itemId = $add.id
Write-Host "3. POST item:" $add.name "ID:" $itemId

# PUT update item
$putBody = '{"name":"Paneer Tikka Masala","price":240,"category":"Curries","desc":"Updated desc","available":false}'
$put = Invoke-RestMethod -Uri "http://localhost:8000/api/menu/$itemId/" -Method Put -Headers $menuHeaders -Body $putBody
Write-Host "4. PUT item: OK"

# PATCH toggle availability
$toggle = Invoke-RestMethod -Uri "http://localhost:8000/api/menu/$itemId/toggle/" -Method Patch -Headers $menuHeaders
Write-Host "5. PATCH toggle: available =" $toggle.available

# DELETE item
$del = Invoke-RestMethod -Uri "http://localhost:8000/api/menu/$itemId/" -Method Delete -Headers $menuHeaders
Write-Host "6. DELETE item: OK"

Write-Host "All menu API tests passed!"
