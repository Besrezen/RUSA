# Generated by Django 4.2 on 2024-10-28 10:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Constructor', '0016_alter_group_route_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='activity_description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='group',
            name='trip_datetime',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]