from django.urls import path
from tables import views

urlpatterns = [
    # List all tables / Create new table
    path('', views.tables_list, name='tables_list'),

    # Get/Update/Delete specific table
    path('<str:table_id>/', views.tables_detail, name='tables_detail'),

    # Toggle table active status
    path('<str:table_id>/toggle/', views.tables_toggle, name='tables_toggle'),

    # Get QR code image for a table
    path('<str:table_id>/qr/', views.tables_qr, name='tables_qr'),

    # Regenerate all QR codes
    path('generate-all/', views.tables_generate_all, name='tables_generate_all'),
]