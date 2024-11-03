from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test, login_required
from .models import Message

def is_admin(user):
    return user.is_staff

@user_passes_test(is_admin)
def chat_view(request, room_name='TEST'):
    messages = Message.objects.filter(room=room_name).order_by('timestamp')
    return render(request, 'Chat/chat.html', {
        'room_name': room_name,
        'messages': messages
    })
