from django.urls import path
from .views import map_view, save_coordinates, get_lines, get_routes

urlpatterns = [
    path('', map_view, name='home'),
    path('save_coordinates/', save_coordinates, name='save_coordinates'),
    path('get_lines/', get_lines, name='get_lines'),
    path('get_routes/', get_routes, name='get_routes'),
]
