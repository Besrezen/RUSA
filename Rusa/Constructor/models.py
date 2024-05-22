from django.db import models

class Line(models.Model):
    name = models.TextField(null=True)
    coordinates = models.TextField(null=True)
    length = models.DecimalField(max_digits=7, decimal_places=2, null=True)
    difficulty = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    seasons = models.TextField(null=True)
    popularity = models.DecimalField(max_digits=7, decimal_places=0, null=True)

