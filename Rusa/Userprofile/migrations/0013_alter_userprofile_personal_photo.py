# Generated by Django 4.1.6 on 2024-10-13 16:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Userprofile', '0012_alter_userprofile_personal_photo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='personal_photo',
            field=models.ImageField(default='profile_photos/anon.png', upload_to='profile_photos/'),
        ),
    ]