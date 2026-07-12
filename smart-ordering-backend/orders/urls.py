"""
URL routing for Orders API.
"""
from django.urls import path
from . import views

urlpatterns = [
    path("", views.order_list, name="order_list"),
    path("<str:order_id>/", views.order_detail, name="order_detail"),
    path("<str:order_id>/status/", views.order_status, name="order_status"),
]
