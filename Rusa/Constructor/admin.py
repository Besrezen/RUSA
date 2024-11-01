from django.contrib import admin
from .models import Line, Group, Review

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

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_display_name', 'text', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'text', 'user__username', 'user__first_name', 'user__last_name')
    actions = ['approve_reviews', 'reject_reviews']
    readonly_fields = ('created_at',)

    def get_display_name(self, obj):
        return obj.get_display_name()
    get_display_name.short_description = 'Имя'

    def approve_reviews(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f'Одобрено {updated} отзывов.')
    approve_reviews.short_description = "Одобрить выбранные отзывы"

    def reject_reviews(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'Отклонено {updated} отзывов.')
    reject_reviews.short_description = "Отклонить выбранные отзывы"

admin.site.register(Line, LineAdmin)
admin.site.register(Group, GroupAdmin)
