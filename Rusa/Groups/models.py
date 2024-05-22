from django.conf import settings
from django.db import models

class Route(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    start_location = models.CharField(max_length=200)
    end_location = models.CharField(max_length=200)
    date = models.DateField()

    def __str__(self):
        return self.name

class Group(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.route.name} - {self.created_at}"
