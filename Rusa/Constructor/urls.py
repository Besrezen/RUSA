from django.urls import path
from . import views

urlpatterns = [
    path('', views.map_view, name='home'),
    path('save_coordinates/', views.save_coordinates, name='save_coordinates'),
    path('get_lines/', views.get_lines, name='get_lines'),
    path('get_routes/', views.get_routes, name='get_routes'),
    path('update_route_lengths/', views.update_route_lengths, name='update_route_lengths'),
    path('routes/', views.route_list, name='route_list'),
]
