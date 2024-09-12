# Rusa/asgi.py

import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import Chat.routing  # Импортируем маршруты из приложения Chat

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Rusa.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Обработка HTTP-запросов
    "websocket": AuthMiddlewareStack(
        URLRouter(
            Chat.routing.websocket_urlpatterns  # Маршруты WebSocket из Chat.routing
        )
    ),
})
