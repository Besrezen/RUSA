from django.urls import path
from .views import view_profile, update_profile

urlpatterns = [
    path('profile/', view_profile, name='view_profile'),
    path('profile/update_profile/', update_profile, name='update_profile'),
]
