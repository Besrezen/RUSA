from django.urls import path
from .views import create_group, group_detail, group_list, join_group, leave_group

urlpatterns = [
    path('route/<int:route_id>/create_group/', create_group, name='create_group'),
    path('group/<int:group_id>/', group_detail, name='group_detail'),
    path('groups/', group_list, name='group_list'),
    path('group/<int:group_id>/join/', join_group, name='join_group'),
    path('group/<int:group_id>/leave/', leave_group, name='leave_group'),
]
