from django.urls import path
from . import views

urlpatterns = [
    path('', views.map_view, name='home'),
    path('constructor/', views.constructor_view, name='constructor'),
    path('save_coordinates/', views.save_coordinates, name='save_coordinates'),
    path('get_lines/', views.get_lines, name='get_lines'),
    path('get_routes/', views.get_routes, name='get_routes'),
    path('update_route_lengths/', views.update_route_lengths, name='update_route_lengths'),
    path('routes/', views.route_list, name='route_list'),
    path('route/<int:route_id>/', views.route_page, name='route_page'),
    path('route/<int:route_id>/groups', views.groups_list_page, name='groups_list_page'),
    path('save_group_data/<int:route_id>/', views.save_group_data, name='save_group_data'),
    path('update_group_participants/<int:group_id>/', views.update_group_participants, name='update_group_participants'),
    path('delete_group/<int:group_id>/', views.delete_group, name='delete_group'),
    path('route/<int:route_id>/group/<int:group_id>/', views.group_page, name='group_page'),
]
