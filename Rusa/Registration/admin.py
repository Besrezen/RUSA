from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import UserSignUpForm, AdminSignUpForm
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    add_form = UserSignUpForm
    list_display = ('username', 'email', 'is_admin', 'is_staff', 'is_superuser')
    list_filter = ('is_admin', 'is_staff', 'is_superuser')

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('is_admin',)}),  # Добавляем поле is_admin
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_admin')}
        ),
    )

admin.site.register(CustomUser, CustomUserAdmin)
