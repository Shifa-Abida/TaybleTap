$headers = @{ "Content-Type" = "application/json" }
$body = '{"email":"shifa@test.com","password":"test123456"}'
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method Post -Headers $headers -Body $body
$token = $login.token
$menuHeaders = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

$data = '[
  {"name":"Chicken Biryani","emoji":"🍚","price":280,"category":"Biryani","desc":"Aromatic basmati rice with tender chicken","available":true},
  {"name":"Paneer Butter Masala","emoji":"🍛","price":220,"category":"Curries","desc":"Rich tomato-based curry with soft paneer","available":true},
  {"name":"Tandoori Platter","emoji":"🍖","price":380,"category":"Starters","desc":"Mixed grill platter with mint chutney","available":true},
  {"name":"Dal Makhani","emoji":"🥘","price":180,"category":"Curries","desc":"Slow-cooked black lentils in buttery sauce","available":false},
  {"name":"Garlic Naan","emoji":"🫓","price":60,"category":"Breads","desc":"Soft naan brushed with garlic butter","available":true},
  {"name":"Gulab Jamun","emoji":"🍰","price":80,"category":"Desserts","desc":"Soft milk dumplings in rose syrup","available":true},
  {"name":"Mango Lassi","emoji":"🥭","price":90,"category":"Drinks","desc":"Chilled mango yogurt drink","available":true},
  {"name":"Veg Spring Rolls","emoji":"🥟","price":120,"category":"Starters","desc":"Crispy rolls with spiced vegetables","available":true},
  {"name":"Mutton Biryani","emoji":"🍚","price":340,"category":"Biryani","desc":"Slow-cooked mutton with fragrant rice","available":false},
  {"name":"Masala Chai","emoji":"🍵","price":40,"category":"Drinks","desc":"Spiced Indian tea with ginger","available":true},
  {"name":"Butter Naan","emoji":"🫓","price":50,"category":"Breads","desc":"Soft leavened bread baked in tandoor","available":true},
  {"name":"Rasmalai","emoji":"🍮","price":100,"category":"Desserts","desc":"Soft cheese dumplings in sweetened milk","available":true},
  {"name":"Chicken 65","emoji":"🍗","price":200,"category":"Starters","desc":"Spicy deep-fried chicken","available":true},
  {"name":"Kadai Paneer","emoji":"🍛","price":240,"category":"Curries","desc":"Paneer in spiced tomato gravy with peppers","available":true},
  {"name":"Jeera Rice","emoji":"🍚","price":90,"category":"Biryani","desc":"Fragrant basmati rice with cumin seeds","available":true},
  {"name":"Plain Dosa","emoji":"🥞","price":70,"category":"Starters","desc":"Crispy rice lentil crepe with chutney","available":true},
  {"name":"Chicken Fried Rice","emoji":"🍳","price":180,"category":"Biryani","desc":"Wok-tossed rice with chicken and vegetables","available":true},
  {"name":"Coca-Cola","emoji":"🥤","price":50,"category":"Drinks","desc":"Chilled soft drink","available":true},
  {"name":"Mango Cheesecake","emoji":"🍰","price":150,"category":"Desserts","desc":"Creamy cheesecake with mango topping","available":true},
  {"name":"Roti","emoji":"🫓","price":30,"category":"Breads","desc":"Whole wheat flatbread baked on tandoor","available":true},
  {"name":"Mushroom Tikka","emoji":"🍄","price":200,"category":"Starters","desc":"Grilled mushrooms with tandoori marinade","available":true},
  {"name":"Palak Paneer","emoji":"🥬","price":230,"category":"Curries","desc":"Creamy spinach curry with paneer cubes","available":true},
  {"name":"Mix Veg Curry","emoji":"🥗","price":160,"category":"Curries","desc":"Assorted vegetables in spiced tomato gravy","available":true},
  {"name":"Egg Curry","emoji":"🥚","price":170,"category":"Curries","desc":"Boiled eggs in onion-tomato gravy","available":true},
  {"name":"Masala Papad","emoji":"🧂","price":50,"category":"Starters","desc":"Crispy papad with spicy masala toppings","available":true},
  {"name":"Sweet Corn Soup","emoji":"🍲","price":90,"category":"Starters","desc":"Hot sweet corn soup with vegetables","available":true},
  {"name":"Honey Chili Potato","emoji":"🥔","price":150,"category":"Starters","desc":"Crispy potato fingers in sweet spicy sauce","available":true},
  {"name":"Veg Manchurian","emoji":"🥟","price":160,"category":"Starters","desc":"Crispy veg balls in spicy Indo-Chinese sauce","available":true},
  {"name":"Paneer Tikka","emoji":"🧀","price":230,"category":"Starters","desc":"Marinated paneer grilled in tandoor","available":true},
  {"name":"Fish Tikka","emoji":"🐟","price":300,"category":"Starters","desc":"Spiced fish pieces grilled to perfection","available":true},
  {"name":"Prawn Fry","emoji":"🦐","price":350,"category":"Starters","desc":"Crispy fried prawns with coastal spices","available":true},
  {"name":"Chicken Manchurian","emoji":"🍗","price":220,"category":"Starters","desc":"Crispy chicken in spicy Indo-Chinese sauce","available":true},
  {"name":"Paneer Fried Rice","emoji":"🍳","price":160,"category":"Biryani","desc":"Wok-tossed rice with paneer and vegetables","available":true},
  {"name":"Steam Rice","emoji":"🍚","price":80,"category":"Biryani","desc":"Plain steamed basmati rice","available":true},
  {"name":"Dal Tadka","emoji":"🥘","price":140,"category":"Curries","desc":"Yellow lentils tempered with cumin and garlic","available":true},
  {"name":"Chicken Curry","emoji":"🍗","price":260,"category":"Curries","desc":"Traditional chicken curry in spiced gravy","available":true},
  {"name":"Mutton Curry","emoji":"🍖","price":320,"category":"Curries","desc":"Slow-cooked mutton in rich spicy gravy","available":true},
  {"name":"Prawn Curry","emoji":"🦐","price":380,"category":"Curries","desc":"Fresh prawns in coconut spiced curry","available":true},
  {"name":"Tandoori Roti","emoji":"🫓","price":25,"category":"Breads","desc":"Whole wheat roti baked in clay oven","available":true},
  {"name":"Laccha Paratha","emoji":"🫓","price":70,"category":"Breads","desc":"Layered flaky flatbread with butter","available":true},
  {"name":"Paneer Paratha","emoji":"🧀","price":90,"category":"Breads","desc":"Stuffed paratha with spiced paneer filling","available":true},
  {"name":"Mushroom Rice","emoji":"🍄","price":170,"category":"Biryani","desc":"Fragrant rice cooked with mushrooms and spices","available":true},
  {"name":"Sweet Lassi","emoji":"🥛","price":90,"category":"Drinks","desc":"Chilled sweet yogurt drink","available":true},
  {"name":"Cold Coffee","emoji":"☕","price":120,"category":"Drinks","desc":"Chilled coffee with ice cream","available":true},
  {"name":"Masala Soda","emoji":"🥤","price":60,"category":"Drinks","desc":"Refreshing soda with chatpata masala","available":true},
  {"name":"Rose Sherbet","emoji":"🌹","price":80,"category":"Drinks","desc":"Chilled rose drink with sabja seeds","available":true},
  {"name":"Jalebi with Rabri","emoji":"🍯","price":120,"category":"Desserts","desc":"Crispy jalebi served with thick rabdi","available":true},
  {"name":"Kulfi","emoji":"🍦","price":90,"category":"Desserts","desc":"Traditional Indian frozen milk dessert","available":true},
  {"name":"Gajar Ka Halwa","emoji":"🥕","price":110,"category":"Desserts","desc":"Warm carrot pudding with nuts and ghee","available":true},
  {"name":"Ice Cream","emoji":"🍨","price":80,"category":"Desserts","desc":"Choice of vanilla chocolate or mango flavour","available":true}
]'

$items = $data | ConvertFrom-Json
$count = 0
foreach ($item in $items) {
    $json = $item | ConvertTo-Json -Compress
    try {
        $r = Invoke-RestMethod -Uri "http://localhost:8000/api/menu/" -Method Post -Headers $menuHeaders -Body $json -ErrorAction SilentlyContinue
        $count++
        Write-Host "Added:" $item.name
    } catch {
        Write-Host "Failed:" $item.name
    }
}
Write-Host "Done! Total items seeded: $count"
