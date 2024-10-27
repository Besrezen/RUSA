from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core import serializers
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from .models import Line, Group
import json
import requests
import datetime
import ast
from Registration.models import CustomUser
from Chat.models import Message

def map_view(request):
    api_key = settings.YANDEX_MAPS_API_KEY
    user_id = request.user.id

    # Получаем три самых популярных маршрута по количеству просмотров
    top_routes = Line.objects.order_by('-popularity')[:3]

    # Добавляем дополнительные атрибуты, как в функции route_list
    for route in top_routes:
        route.is_not_empty_coords = bool(route.coordinates)
        route.len_km = round(route.length / 1000, 1)
        route.diff_rounded = round(route.difficulty)
        route.has_preview = bool(route.previewPhoto)

    context = {
        'api_key': api_key,
        'user_id': user_id,
        'top_routes': top_routes,
    }
    return render(request, 'home.html', context)


@login_required
def constructor_view(request):
    api_key = settings.YANDEX_MAPS_API_KEY
    user_id = request.user.id
    context = {'api_key': api_key,
               'user_id': user_id
            }
    return render(request, 'constructor.html', context)

@csrf_exempt
def save_coordinates(request):
    if request.method == 'POST':
        previewFile = request.FILES.get('previewPhoto')
        userId = request.POST.get('userId')
        name = request.POST.get('name')
        coordinates = request.POST.get('coordinates')
        seasons = request.POST.get('seasons')
        difficulty = request.POST.get('difficulty')
        length = request.POST.get('length')
        notes = request.POST.get('notes')
        previewFile = request.FILES.get('previewPhoto')
        notesJson = json.loads(notes)
        seasonsJson = json.loads(seasons)

        line = Line(
            author_id=userId,
            name=name,
            coordinates=coordinates,
            seasons=seasonsJson,
            difficulty=difficulty,
            length=length,
            notes=notesJson,
            previewPhoto=previewFile
        )
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
    sort_by = request.GET.get('sort_by', 'name')
    order = request.GET.get('order', 'asc')

    if order == 'desc':
        sort_by = '-' + sort_by

    routes = Line.objects.all().order_by(sort_by)

    for route in routes:
        route.map_url = create_map_url(route)
        route.is_not_empty_coords = bool(route.coordinates)
        route.len_km = round(route.length / 1000, 1)
        route.diff_rounded = round(route.difficulty)
        route.has_preview = bool(route.previewPhoto)

    paginator = Paginator(routes, 9)
    page = request.GET.get('page')

    try:
        routes_page = paginator.page(page)
    except PageNotAnInteger:
        routes_page = paginator.page(1)
    except EmptyPage:
        routes_page = paginator.page(paginator.num_pages)

    context = {
        'routes': routes_page,
        'page_obj': routes_page,
        'paginator': paginator,
        'is_paginated': routes_page.has_other_pages(),
        'sort_by': request.GET.get('sort_by', 'name'),
        'order': request.GET.get('order', 'asc'),
    }
    return render(request, 'route_list.html', context)

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
        ids = ast.literal_eval(group.participants)
        group.leader_name = get_person_name(group.leader_id)
        group.participant_quantity = len(ids)
        group.participants_names = []
        group.participants_ids = []
        for id in ids:
                group.participants_names.append(get_person_name(id))
                group.participants_ids.append(id)
                group.zipped_participants = zip(ids, group.participants_names)
    context = {
    'groups': groups,
    'user_id': user_id,
    'route_id': route_id,
    'user_name': get_person_name(user_id)
    }
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
@csrf_exempt
def update_group_participants(request, group_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            group = Group.objects.get(pk=group_id)
            group.participants = data['participants']
            group.save()
            return JsonResponse({"status": "success"}, status=200)
        except Group.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Группа не найдена"}, status=404)

def get_person_name(id):
    try:
        person = CustomUser.objects.get(id=id)
        return person.username
    except CustomUser.DoesNotExist:
        return "Человек с таким ID не найден"

@csrf_exempt
def delete_group(request, group_id):
    if request.method == "POST":
        try:
            group = Group.objects.get(id=group_id)
            if request.user.id == group.leader_id:
                group.delete()
                return JsonResponse({"status": "success", "message": "Группа успешно удалена."})
            else:
                return JsonResponse({"status": "error", "message": "Вы не являетесь лидером этой группы."})
        except Group.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Группа не найдена."})
    return JsonResponse({"status": "error", "message": "Неверный метод запроса."})

@login_required
def group_page(request, route_id, group_id):
    route = get_object_or_404(Line, pk=route_id)
    group = get_object_or_404(Group, pk=group_id)

    route_length = route.length / 1000
    route_time_sec = round(route_length / 5 * 3600)
    route_time = datetime.timedelta(seconds=route_time_sec)
    route_time_str = str(route_time)

    ids = ast.literal_eval(group.participants)
    group.leader_name = get_person_name(group.leader_id)
    group.participant_quantity = len(ids)
    group.participants_names = []
    group.participants_ids = []
    for id in ids:
        group.participants_names.append(get_person_name(id))
        group.participants_ids.append(id)
    group.zipped_participants = zip(ids, group.participants_names)

    room_name = f"r_{route.id}_g_{group.id}"

    messages = Message.objects.filter(room=room_name).order_by('-timestamp')[:40]
    messages = reversed(messages)

    context = {
        'route': route,
        'group': group,
        'route_time': route_time_str,
        'route_length': round(route_length, 1),
        'route_popularity': route.popularity, 
        'route_difficulty': round(route.difficulty),
        'route_author': get_person_name(route.author_id),
        'user_id': request.user.id,
        'user_name': get_person_name(request.user.id),
        'room_name': room_name,
        'messages': messages,
    }
    return render(request, 'group_page.html', context)

def load_more_messages(request, room_name):
    last_timestamp_str = request.GET.get('last_timestamp', None)
    if last_timestamp_str:
        last_timestamp = parse_datetime(last_timestamp_str)
        if last_timestamp is None:
            return JsonResponse({'messages': [], 'no_more_messages': True})
    else:
        last_timestamp = timezone.now()
    messages = Message.objects.filter(room=room_name, timestamp__lt=last_timestamp).order_by('-timestamp')[:40]
    if not messages:
        return JsonResponse({'messages': [], 'no_more_messages': True})
    messages_data = [{
        'username': message.user.username,
        'content': message.content,
        'timestamp': message.timestamp.isoformat()
    } for message in messages]
    return JsonResponse({'messages': messages_data, 'no_more_messages': False})


def route_page(request, route_id):
    route = get_object_or_404(Line, pk=route_id)
    route.popularity += 1
    route.save()
    route_length = route.length / 1000
    route_time_sec = round(route_length / 5 * 3600)
    route_time = datetime.timedelta(seconds=route_time_sec)
    route_time_str = str(route_time)
    user_id = request.user.id

    room_name = f"route_{route.id}"
    messages = Message.objects.filter(room=room_name).order_by('-timestamp')[:40]
    messages = reversed(messages)

    context = {
        'route': route,
        'route_time': route_time_str,
        'route_length': round(route_length, 1),
        'route_popularity': route.popularity, 
        'route_difficulty': round(route.difficulty),
        'route_author': get_person_name(route.author_id),
        'user_id': user_id,
        'author_id': route.author_id,
        'room_name': room_name, 
        'messages': messages, 
        'route_created_at': route.created_at,
    }
    return render(request, 'route_page.html', context)


@login_required
def delete_route(request, route_id):
    if request.method == 'POST':
        try:
            route = Line.objects.get(pk=route_id)
            if route.author_id != request.user.id:
                return JsonResponse({"status": "error", "message": "У вас нет прав для удаления этого маршрута."}, status=403)
            Group.objects.filter(route_id=route).delete()
            route.delete()
            return JsonResponse({"status": "success", "message": "Маршрут успешно удален."}, status=200)
        except Line.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Маршрут не найден."}, status=404)
    else:
        return JsonResponse({"status": "error", "message": "Неверный метод запроса."}, status=400)