from django.contrib import admin
from .models import Message

class MessageAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'content', 'timestamp')
    search_fields = ('room', 'user__username', 'content')
    list_filter = ('room', 'timestamp')
    ordering = ('-timestamp',)

admin.site.register(Message, MessageAdmin)
