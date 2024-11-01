# Generated by Django 4.2 on 2024-11-01 13:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Constructor', '0022_review'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='group',
            options={'verbose_name': 'Группа', 'verbose_name_plural': 'Группы'},
        ),
        migrations.AlterModelOptions(
            name='line',
            options={'verbose_name': 'Маршрут', 'verbose_name_plural': 'Маршруты'},
        ),
        migrations.AlterModelOptions(
            name='review',
            options={'verbose_name': 'Отзыв', 'verbose_name_plural': 'Отзывы'},
        ),
        migrations.AddField(
            model_name='line',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='Описание маршрута'),
        ),
    ]
