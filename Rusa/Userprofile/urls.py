from django.urls import path
from .views import view_profile, update_profile, upload_portfolio_image, delete_portfolio_image

urlpatterns = [
    path('profile/', view_profile, name='view_profile'),
    path('profile/update_profile/', update_profile, name='update_profile'),
    path('profile/images/', upload_portfolio_image, name='upload_portfolio_image'),
    path('profile/delete/', delete_portfolio_image, name='delete_portfolio_image'),
]
