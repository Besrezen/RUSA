from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import UserProfile
import datetime
import os

@login_required
def view_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    return render(request, 'Userprofile/profile.html', {'profile': profile})

@login_required
def update_profile(request):
    if request.method == 'POST':
        profile, created = UserProfile.objects.get_or_create(user=request.user)

        # Получение и преобразование даты в правильный формат
        birth_date = request.POST.get('birth_date')
        if birth_date:
            try:
                birth_date = datetime.datetime.strptime(birth_date, '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({'status': 'fail', 'error': 'Invalid date format'})

        profile.birth_date = birth_date
        profile.name = request.POST.get('name')
        profile.region = request.POST.get('region')
        profile.profession = request.POST.get('profession')
        profile.bio = request.POST.get('about_me')

        # Обработка загрузки фото профиля
        if 'personal_photo' in request.FILES:
            if profile.personal_photo and profile.personal_photo.url != 'def/anonim.png':
                if os.path.isfile(profile.personal_photo.path):
                    os.remove(profile.personal_photo.path)
            profile.personal_photo = request.FILES['personal_photo']

        profile.save()

        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'fail'})
