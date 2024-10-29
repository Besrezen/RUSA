# Generated by Django 4.2 on 2024-10-28 16:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Constructor', '0018_group_privacy_setting'),
    ]

    operations = [
        migrations.AlterField(
            model_name='group',
            name='privacy_setting',
            field=models.CharField(choices=[('open', 'Открытая группа'), ('link', 'Доступная по ссылке'), ('private', 'Приватная')], default='open', max_length=10),
        ),
    ]