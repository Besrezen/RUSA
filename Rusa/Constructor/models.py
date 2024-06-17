from django.db import models

class Line(models.Model):
    author_id = models.DecimalField(max_digits=5, decimal_places=0, null=True)
    name = models.TextField(null=True)
    coordinates = models.TextField(null=True)
    length = models.DecimalField(max_digits=7, decimal_places=2, null=True)
    difficulty = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    seasons = models.TextField(null=True)
    popularity = models.DecimalField(max_digits=7, decimal_places=0, null=True)
    notes = models.TextField(null=True)

class Group(models.Model):
    leader_id = models.DecimalField(max_digits=5, decimal_places=0, null=True)
    name = models.TextField(null=True)
    participants = models.TextField(null=True)
    route_id = models.ForeignKey(Line, on_delete=models.SET_NULL, null=True)