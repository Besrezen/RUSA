from django.apps import AppConfig

class UserprofileConfig(AppConfig):
    name = 'Userprofile'

    def ready(self):
        import Userprofile.signals
