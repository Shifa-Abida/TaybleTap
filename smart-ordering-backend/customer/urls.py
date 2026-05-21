"""
URL routing for Customer-facing public API.
All endpoints are public (no auth required).
"""
from django.urls import path
from . import views

urlpatterns = [
    path("menu/", views.public_menu, name="customer_menu"),
    path("recommendations/", views.recommendations, name="customer_recommendations"),
    path("otp/request/", views.request_customer_otp, name="customer_request_otp"),
    path("otp/verify/", views.verify_customer_otp, name="customer_verify_otp"),
    path("restaurant/", views.restaurant_info, name="customer_restaurant_info"),
    path("order/", views.place_order, name="customer_place_order"),
    path("order/<str:order_id>/", views.order_status, name="customer_order_status"),
]
