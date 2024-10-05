from django.contrib import admin
from .models import Line, Group

class LineAdmin(admin.ModelAdmin):
    list_display = ('name', 'author_id', 'length', 'difficulty', 'popularity')  # Поля для отображения в списке
    search_fields = ('name',)  # Поля для поиска по имени маршрута
    list_filter = ('difficulty', 'seasons')  # Фильтры для админки
    ordering = ('name',)  # Порядок сортировки по имени

class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'leader_id', 'route_id', 'participants')  # Поля для отображения в списке
    search_fields = ('name',)  # Поля для поиска по имени группы
    list_filter = ('route_id',)  # Фильтр по маршруту
    ordering = ('name',)  # Порядок сортировки по имени

admin.site.register(Line, LineAdmin)
admin.site.register(Group, GroupAdmin)
