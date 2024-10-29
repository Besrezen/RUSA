from django.contrib import admin
from .models import Line, Group

class LineAdmin(admin.ModelAdmin):
    list_display = ('name', 'author_id', 'length', 'difficulty', 'popularity', 'created_at', 'updated_at')
    search_fields = ('name', 'author_id', 'notes')
    list_filter = ('difficulty', 'seasons', 'created_at')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'leader_id', 'route_id', 'participants', 'trip_datetime', 'privacy_setting')
    search_fields = ('name', 'leader_id')
    list_filter = ('route_id', 'privacy_setting', 'trip_datetime')
    ordering = ('-trip_datetime',)
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(Line, LineAdmin)
admin.site.register(Group, GroupAdmin)
