from django.shortcuts import render, get_object_or_404
from django.conf import settings
import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Line
import json
from django.core import serializers

def map_view(request):
    api_key = settings.YANDEX_MAPS_API_KEY
    context = {'api_key': api_key}
    return render(request, 'map.html', context)

@csrf_exempt
def save_coordinates(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        line = Line(name=data['name'], coordinates=data['coordinates'], seasons=data['seasons'], difficulty=data['difficulty'], length=data['length'], notes=data['notes'])
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
    return render(request, 'route_list.html', {'routes': routes})

def route_page(request, route_id):
    route = get_object_or_404(Line, pk=route_id)
    route_length = route.length / 1000
    route_time = route_length / 5
    if route_time < 1:
        route_time_minutes = round(route_time * 60)
        if 5 <= route_time_minutes <= 20 or route_time_minutes % 10 == 0 or 5 <= route_time_minutes % 10 <= 9:
            route_time_str = f"{route_time_minutes:.0f} минут"
        elif route_time_minutes % 10 == 1:
            route_time_str = f"{route_time_minutes:.0f} минута"
        else:
            route_time_str = f"{route_time_minutes:.0f} минуты"
    else:
        if 2 <= route_time < 5:
            route_time_str = f"{route_time:.2f} часа"
        elif route_time >= 5:
            route_time_str = f"{route_time:.2f} часов"
        else:
            route_time_str = f"{route_time:.2f} час"
    context = {
        'route': route,
        'route_time': route_time_str,
        'route_length': round(route_length, 1),
        'route_popularity': route.popularity, 
        'route_difficulty': round(route.difficulty), 
    }
    return render(request, 'route_page.html', context)

