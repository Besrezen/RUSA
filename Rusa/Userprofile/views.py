from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import UserProfile
import datetime
import os
from Constructor.models import Line
import json


@login_required
def view_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    user_routes = Line.objects.filter(author_id=request.user.id)
    for route in user_routes:
        route.map_url = create_map_url(route)
        route.is_not_empty_coords = not (str(route.coordinates) == "[]")
    context = {
        'profile': profile,
        'user_routes': user_routes
        }
    return render(request, 'Userprofile/profile.html', context)

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
            if profile.personal_photo and profile.personal_photo.url != 'img/anonim.png':
                if os.path.isfile(profile.personal_photo.path):
                    os.remove(profile.personal_photo.path)
            profile.personal_photo = request.FILES['personal_photo']

        profile.save()

        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'fail'})

def create_map_url(route):
    # Первая и последняя координаты для меток
    coordinates = json.loads(route.coordinates)
    if (coordinates):
        start = coordinates[0]
        end = coordinates[-1]

        # Параметры меток
        start_marker = f"{start[0]},{start[1]},pm2ntl3"  # Красная метка в начале
        # end_marker = f"{end[0]},{end[1]}," + "{% static 'img/finish_flag.png' %}"  # Пользовательское изображение для метки в конце
        end_marker = f"{end[0]},{end[1]},pm2ntl3"

        # Параметры линии (красная пунктирная линия толщиной 4)
        line = f"pl=c:ff0000ff,w:4,{get_coordinates_string(coordinates)}"

        center = calculate_center(coordinates)

        # Формирование полного URL для Static Maps API
        static_map_url = (
            f"https://static-maps.yandex.ru/v1?"
            f"l=map&"
            f"size=500,300&"
            f"ll={center[0]},{center[1]}&"
            # f"pt={start_marker}~{end_marker}~"
            f"{line}&"
            # f"size=500,300,lang=ru_RU"
            f"pt={start_marker}~{end_marker}&"
            f"apikey=3c6f0569-0691-4254-8518-55a4f66b4295"
        )
    else:
        static_map_url = "https://via.placeholder.com/500x300"
    # static_map_url = json.loads(route.coordinates)[0]

    # Результирующий URL
    return static_map_url

def get_coordinates_string(coordinates):
    return ",".join([f"{lon},{lat}" for lon, lat in coordinates])

def calculate_center(coordinates):
    avg_lat = sum(lat for lon, lat in coordinates) / len(coordinates)
    avg_lon = sum(lon for lon, lat in coordinates) / len(coordinates)
    return avg_lon, avg_lat