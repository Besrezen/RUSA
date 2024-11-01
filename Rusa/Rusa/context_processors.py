# Rusa/context_processors.py

from django.conf import settings

def google_auth(request):
    return {
        'SOCIAL_AUTH_GOOGLE_OAUTH2_KEY': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
    }
