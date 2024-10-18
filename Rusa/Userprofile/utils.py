# userprofile/utils.py

import uuid
import os

def user_profile_photo_path(instance, filename):
    """
    Генерирует уникальное имя файла для аватарки пользователя.
    Файл сохраняется в директорию 'profile_photos/'.
    """
    ext = filename.split('.')[-1]
    # Генерация уникального имени с использованием UUID4
    unique_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('profile_photos/', unique_filename)


def portfolio_image_path(instance, filename):
    """
    Генерирует уникальное имя файла для фотографий портфолио.
    Файл сохраняется в директорию 'portfolio_images/'.
    """
    ext = filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('portfolio_images/', unique_filename)