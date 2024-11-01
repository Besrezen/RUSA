# main/models.py

from django.db import models
from django.conf import settings
import uuid
import os

def generate_uuid_filename(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('preview_photos/', new_filename)

class Line(models.Model):
    author_id = models.DecimalField(max_digits=5, decimal_places=0, null=True)
    name = models.TextField(null=True)
    coordinates = models.TextField(null=True)
    length = models.DecimalField(max_digits=7, decimal_places=2, null=True)
    difficulty = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    seasons = models.TextField(null=True)
    popularity = models.DecimalField(max_digits=7, null=False, default=0, decimal_places=0)
    notes = models.TextField(null=True)
    previewPhoto = models.ImageField(upload_to=generate_uuid_filename, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def delete(self, *args, **kwargs):
        if self.previewPhoto:
            if os.path.isfile(self.previewPhoto.path):
                os.remove(self.previewPhoto.path)
        super(Line, self).delete(*args, **kwargs)

class Group(models.Model):
    PRIVACY_CHOICES = [
        ('open', 'Открытая группа'),
        ('link', 'Доступная по ссылке'),
        ('private', 'Закрытая')
    ]
    
    leader_id = models.DecimalField(max_digits=5, decimal_places=0, null=True)
    name = models.TextField(null=True)
    participants = models.TextField(null=True)
    route_id = models.ForeignKey(Line, on_delete=models.CASCADE, null=True)
    trip_datetime = models.DateTimeField(null=True, blank=True)
    activity_description = models.TextField(null=True, blank=True, default='')
    privacy_setting = models.CharField(max_length=10, choices=PRIVACY_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Review(models.Model):
    STATUS_CHOICES = [
        ('pending', 'На рассмотрении'),
        ('approved', 'Одобрен'),
        ('rejected', 'Отклонен'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviews'
    )
    name = models.CharField(
        max_length=100,
        blank=True,
        help_text='Имя пользователя (для неавторизованных)'
    )
    text = models.TextField(help_text='Текст отзыва')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending',
        help_text='Статус отзыва'
    )

    def __str__(self):
        return f"{self.get_display_name()} - {self.status}"

    def get_display_name(self):
        return self.name if self.name else (self.user.get_full_name() or self.user.username)