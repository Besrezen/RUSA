# Generated by Django 4.1.6 on 2024-06-05 17:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Constructor', '0006_merge_0005_line_notes_0005_line_popularity'),
    ]

    operations = [
        migrations.AddField(
            model_name='line',
            name='author_id',
            field=models.DecimalField(decimal_places=0, max_digits=5, null=True),
        ),
    ]
