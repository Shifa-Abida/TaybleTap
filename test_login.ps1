$headers = @{ "Content-Type" = "application/json" }
$body = '{"email":"shifa@test.com","password":"test123456"}'
$result = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method Post -Headers $headers -Body $body
$result | ConvertTo-Json
