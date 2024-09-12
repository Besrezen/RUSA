# Chat/views.py

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Message

@login_required
def chat_view(request, room_name='TEST'):
    messages = Message.objects.filter(room=room_name).order_by('timestamp')
    return render(request, 'Chat/chat.html', {
        'room_name': room_name,
        'messages': messages
    })
