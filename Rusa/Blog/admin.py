# Blog/admin.py

from django.contrib import admin
from .models import Post, Comment

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1
    readonly_fields = ('created_at',)
    fields = ('author', 'content', 'created_at')
    verbose_name = 'Комментарий'
    verbose_name_plural = 'Комментарии'

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'updated_at')
    list_filter = ('author', 'created_at', 'updated_at')
    search_fields = ('title', 'content', 'author__username')
    inlines = [CommentInline]
    ordering = ('-created_at',) 
    date_hierarchy = 'created_at'
    fieldsets = (
        (None, {
            'fields': ('title', 'content', 'author')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',), 
        }),
    )
    readonly_fields = ('created_at', 'updated_at') 

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'created_at')
    list_filter = ('author', 'created_at') 
    search_fields = ('content', 'author__username', 'post__title') 
    ordering = ('created_at',)
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)
    fields = ('post', 'author', 'content', 'created_at')

from django.contrib.auth.models import Group
admin.site.unregister(Group)