# userprofile/urls.py
from django.urls import path
from .views import view_profile, update_profile, upload_portfolio_image, delete_portfolio_image

urlpatterns = [
    path('profile/update_profile/', update_profile, name='update_profile'),
    path('profile/images/', upload_portfolio_image, name='upload_portfolio_image'),
    path('profile/delete/', delete_portfolio_image, name='delete_portfolio_image'),
    path('profile/<str:username>/', view_profile, name='view_profile_by_username'),
    path('profile/', view_profile, name='view_profile'),
]
