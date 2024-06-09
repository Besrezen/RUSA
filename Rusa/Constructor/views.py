from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.contrib.auth.decorators import login_required
import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Line, Group
import json
from django.core import serializers
import datetime
from Registration.models import CustomUser
import ast


def map_view(request):
    api_key = settings.YANDEX_MAPS_API_KEY
    user_id = request.user.id
    context = {
        'api_key': api_key,
        'user_id': user_id
        }
    return render(request, 'map.html', context)

@login_required
def constructor_view(request):
    api_key = settings.YANDEX_MAPS_API_KEY
    context = {'api_key': api_key}
    return render(request, 'constructor.html', context)

@csrf_exempt
def save_coordinates(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        line = Line(author_id=data['userId'], name=data['name'], coordinates=data['coordinates'], seasons=data['seasons'], difficulty=data['difficulty'], length=data['length'], notes=data['notes'])
        line.save()
        return JsonResponse({"status": "success"}, status=200)
    
def get_lines(request):
    lines = Line.objects.all()
    coordinates_list = [line.coordinates for line in lines]
    return JsonResponse(coordinates_list, safe=False)

def get_routes(request):
    routes = Line.objects.all()
    routes_json = serializers.serialize('json', routes)
    return JsonResponse(routes_json, safe=False)

@csrf_exempt
def update_route_lengths(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        line = Line.objects.get(id=data['id'])
        line.length = data['length']
        line.save()
    return JsonResponse({"status": "success"}, status=200)

def route_list(request):
    sort_by = request.GET.get('sort_by', 'name')  # Default sort by name
    order = request.GET.get('order', 'asc')  # Default order ascending

    if order == 'desc':
        sort_by = '-' + sort_by

    routes = Line.objects.all().order_by(sort_by)
    for route in routes:
        route.map_url = create_map_url(route)
        route.is_not_empty_coords = not (str(route.coordinates) == "[]")
    context = {
        'routes': routes
        }

    return render(request, 'route_list.html', context)

def route_page(request, route_id):
    route = get_object_or_404(Line, pk=route_id)
    route_length = route.length / 1000
    route_time_sec = round(route_length / 5 * 3600)
    route_time = datetime.timedelta(seconds=route_time_sec)
    route_time_str = str(route_time)
    # if route_time < 1:
    #     route_time_minutes = round(route_time * 60)
    #     if 5 <= route_time_minutes <= 20 or route_time_minutes % 10 == 0 or 5 <= route_time_minutes % 10 <= 9:
    #         route_time_str = f"{route_time_minutes:.0f} минут"
    #     elif route_time_minutes % 10 == 1:
    #         route_time_str = f"{route_time_minutes:.0f} минута"
    #     else:
    #         route_time_str = f"{route_time_minutes:.0f} минуты"
    # else:
    #     if 2 <= route_time < 5:
    #         route_time_str = f"{route_time:.2f} часа"
    #     elif route_time >= 5:
    #         route_time_str = f"{route_time:.2f} часов"
    #     else:
    #         route_time_str = f"{route_time:.2f} час"
    context = {
        'route': route,
        'route_time': route_time_str,
        'route_length': round(route_length, 1),
        'route_popularity': route.popularity, 
        'route_difficulty': round(route.difficulty)
    }
    return render(request, 'route_page.html', context)

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

def groups_list_page(request, route_id):
    try:
        route = Line.objects.get(pk=route_id)
    except Line.DoesNotExist:
        print("Нет маршрута с таким ID")
    except Line.MultipleObjectsReturned:
        print("Найдено более одного маршрута с таким ID")

    groups = Group.objects.filter(route_id=route)
    user_id = request.user.id
    for group in groups:
        group.leader_name = get_person_name(group.leader_id)
        group.participant_quantity = len(ast.literal_eval(group.participants))
    context = {
        'groups': groups,
        'user_id': user_id,
        'route_id': route_id
    }
    print("HERE--------------------->", route_id)
    return render(request, 'groups_list.html', context)

@csrf_exempt
def save_group_data(request, route_id):
    try:
        route = Line.objects.get(pk=route_id)
    except Line.DoesNotExist:
        print("Нет маршрута с таким ID")
    except Line.MultipleObjectsReturned:
        print("Найдено более одного маршрута с таким ID")
    if request.method == 'POST':
        data = json.loads(request.body)
        group = Group(name=data['name'], leader_id=data['leader_id'], participants=data['participants'], route_id=route)
        group.save()
    return JsonResponse({"status": "success"}, status=200)

def get_person_name(id):
    try:
        person = CustomUser.objects.get(id=id)
        return person.username
    except CustomUser.DoesNotExist:
        return "Человек с таким ID не найден"
