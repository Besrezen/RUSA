from django.apps import AppConfig

class UserProfileConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Userprofile'

    def ready(self):
        import Userprofile.signals  # Подключение сигналов
