from django.db import models

class Line(models.Model):
    name = models.TextField(null=True)
    coordinates = models.TextField(null=True)
    length = models.DecimalField(null=True)