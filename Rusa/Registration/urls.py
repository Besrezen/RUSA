from django.urls import path
from django.contrib.auth.views import LoginView
from .views import user_signup, admin_signup, view_admin, view_login, show_login, view_main, logout_view

urlpatterns = [
    path('user/', user_signup, name='signup_user'),
    path('admin/', admin_signup, name='signup_admin'),
    path("view_admin/", view_admin, name='view_admin'),
    path("view_login/", view_login, name='view_login'),
    path("view_main/", view_main, name='view_main'),
    path('logout/', logout_view, name='logout_view'),
]
