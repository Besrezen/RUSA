from django.contrib import admin
from .models import UserProfile, PortfolioImage

admin.site.register(PortfolioImage)

class PortfolioImageInline(admin.TabularInline):  # Встроенная форма для PortfolioImage
    model = PortfolioImage
    extra = 1  # Количество пустых строк для добавления новых изображений

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'region', 'profession')  # Поля для отображения в списке
    search_fields = ('user__username', 'name', 'profession')  # Поля для поиска
    inlines = [PortfolioImageInline]  # Встроенная форма для изображений

admin.site.register(UserProfile, UserProfileAdmin)


# Register your models here.
