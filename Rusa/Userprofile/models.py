from django.db import models
from Registration.models import CustomUser
from datetime import date

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    profession = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    personal_photo = models.ImageField(upload_to='profile_photos/')
    def __str__(self):
        return self.user.username

'''    @property
    def age(self):
        if self.birth_date:
            today = date.today()
            return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        return None
'''

class PortfolioImage(models.Model):
    image = models.ImageField(upload_to='portfolio_images')
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='portfolio_images')
