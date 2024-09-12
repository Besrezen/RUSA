# Chat/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('chat/<str:room_name>/', views.chat_view, name='chat_room'),
    path('chat/', views.chat_view, name='chat_test'),  # Тестовая комната TEST
]
