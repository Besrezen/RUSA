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
