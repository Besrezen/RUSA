# Generated by Django 4.2 on 2024-11-05 20:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Constructor', '0024_alter_line_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='line',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='Описание маршрута'),
        ),
    ]