# userprofile/models.py

from django.db import models
from Registration.models import CustomUser
from datetime import date
from .utils import user_profile_photo_path, portfolio_image_path  # Импорт функции

class UserProfile(models.Model):

    PRIVACY_CHOICES = [
        ('open', 'Открытый'),
        ('closed', 'Закрытый'),
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    personal_photo = models.ImageField(
        upload_to=user_profile_photo_path,
        default='profile_photos/anon.png',
        blank=True,
        null=True
    )

    privacy = models.CharField(
        max_length=10,
        choices=PRIVACY_CHOICES,
        default='open'
    )

    def __str__(self):
        return self.user.username

class PortfolioImage(models.Model):
    image = models.ImageField(upload_to=portfolio_image_path)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='portfolio_images')
