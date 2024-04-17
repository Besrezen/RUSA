from django.shortcuts import render
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
        line = Line(coordinates=data)
        line.save()
        return JsonResponse({"status": "success"}, status=200)
    
def get_lines(request):
    lines = Line.objects.all()
    coordinates_list = [line.coordinates for line in lines]
    return JsonResponse(coordinates_list, safe=False)