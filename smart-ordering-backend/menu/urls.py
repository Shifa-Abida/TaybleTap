from django.urls import path
from . import views

urlpatterns = [
    path("", views.menu_list, name="menu_list"),
    path("low-stock/", views.low_stock_list, name="menu_low_stock"),
    path("<str:item_id>/", views.menu_detail, name="menu_detail"),
    path("<str:item_id>/toggle/", views.menu_toggle, name="menu_toggle"),
]
