$headers = @{ "Content-Type" = "application/json" }
$body = '{"email":"shifa@test.com","password":"test123456","name":"Shifa","restaurant_name":"My Restaurant","city":"Mumbai"}'
$result = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register/" -Method Post -Headers $headers -Body $body
$result | ConvertTo-Json
