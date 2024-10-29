# userprofile/views.py
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseBadRequest
from .models import UserProfile, PortfolioImage
import datetime
import os
from Constructor.models import Line, Group
import ast
from django.views.decorators.csrf import csrf_exempt
import json
from Constructor.views import get_person_name
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

User = get_user_model()

@csrf_exempt
def view_profile(request, username=None):
    if username is None:
        if request.user.is_authenticated:
            return redirect('view_profile_by_username', username=request.user.username)
        else:
            return redirect('view_login')

    
    user = get_object_or_404(User, username=username)
    profile, created = UserProfile.objects.get_or_create(user=user)
    is_owner = (user == request.user)

    if not is_owner and profile.privacy == 'closed':
        return render(request, 'profile_unavailable.html', {'profile': profile})

    sort_by = request.GET.get('sort_by', 'created_at')
    order = request.GET.get('order', 'desc')

    if order == 'desc':
        sort_by_param = '-' + sort_by
    else:
        sort_by_param = sort_by

    user_routes = Line.objects.filter(author_id=profile.user.id).order_by(sort_by_param)

    for route in user_routes:
        route.map_url = create_map_url(route)
        route.is_not_empty_coords = bool(route.coordinates)
        route.len_km = round(route.length / 1000, 1)
        route.diff_rounded = round(route.difficulty)
        route.has_preview = bool(route.previewPhoto)

    paginator = Paginator(user_routes, 6)
    page = request.GET.get('page')

    try:
        user_routes_page = paginator.page(page)
    except PageNotAnInteger:
        user_routes_page = paginator.page(1)
    except EmptyPage:
        user_routes_page = paginator.page(paginator.num_pages)

    group_sort_by = request.GET.get('group_sort_by', 'created_at')
    group_order = request.GET.get('group_order', 'desc')

    all_groups = Group.objects.all()
    user_groups = []

    for group in all_groups:
        participant_ids = ast.literal_eval(group.participants)
        if str(profile.user.id) in participant_ids or group.leader_id == profile.user.id:
            if is_owner:
                user_groups.append(group)
            else:
                if group.privacy_setting == 'open':
                    user_groups.append(group)

    reverse = (group_order == 'desc')
    if group_sort_by == 'participant_quantity':
        for group in user_groups:
            participant_ids = ast.literal_eval(group.participants)
            group.participant_quantity = len(participant_ids)
        user_groups.sort(key=lambda x: x.participant_quantity, reverse=reverse)
    else:
        user_groups.sort(key=lambda x: getattr(x, group_sort_by), reverse=reverse)

    group_paginator = Paginator(user_groups, 3)
    group_page = request.GET.get('group_page')

    try:
        user_groups_page = group_paginator.page(group_page)
    except PageNotAnInteger:
        user_groups_page = group_paginator.page(1)
    except EmptyPage:
        user_groups_page = group_paginator.page(group_paginator.num_pages)

    for group in user_groups_page:
        participant_ids = ast.literal_eval(group.participants)
        group.participant_quantity = len(participant_ids)
        group.leader_name = get_person_name(group.leader_id)
        group.participants_names = [get_person_name(id) for id in participant_ids]
        group.participants_ids = participant_ids
        group.zipped_participants = zip(participant_ids, group.participants_names)

    context = {
        'profile': profile,
        'user_routes': user_routes_page,
        'page_obj': user_routes_page,
        'paginator': paginator,
        'is_paginated': user_routes_page.has_other_pages(),
        'sort_by': sort_by,
        'order': order,
        'portfolio_images': PortfolioImage.objects.filter(user=profile),
        'user_groups': user_groups_page,
        'group_page_obj': user_groups_page,
        'group_paginator': group_paginator,
        'group_is_paginated': user_groups_page.has_other_pages(),
        'group_sort_by': group_sort_by,
        'group_order': group_order,
        'is_owner': is_owner,
    }
    return render(request, 'profile.html', context)

@login_required
@csrf_exempt
def update_profile(request):
    if request.method == 'POST':
        profile, created = UserProfile.objects.get_or_create(user=request.user)

        birth_date = request.POST.get('birth_date')
        if birth_date:
            try:
                birth_date = datetime.datetime.strptime(birth_date, '%Y-%m-%d').date()
                profile.birth_date = birth_date
            except ValueError:
                profile.birth_date = None

        profile.name = request.POST.get('name')
        profile.region = request.POST.get('region')
        profile.profession = request.POST.get('profession')
        profile.bio = request.POST.get('about_me')

        if 'personal_photo' in request.FILES:
            new_photo = request.FILES['personal_photo']
            if profile.personal_photo and profile.personal_photo.name != 'profile_photos/anon.png':
                if os.path.isfile(profile.personal_photo.path):
                    os.remove(profile.personal_photo.path)
            profile.personal_photo = new_photo

        new_privacy = request.POST.get('privacy')
        if new_privacy in dict(UserProfile.PRIVACY_CHOICES).keys():
            profile.privacy = new_privacy
        else:
            return JsonResponse({'status': 'fail', 'error': 'Некорректное значение приватности.'})

        new_username = request.POST.get('username').strip()
        if new_username and new_username != request.user.username:
            if User.objects.filter(username=new_username).exists():
                return JsonResponse({'status': 'fail', 'error': 'Этот никнейм уже занят.'})
            else:
                request.user.username = new_username
                request.user.save()

        new_email = request.POST.get('email').strip()
        if new_email:
            try:
                validate_email(new_email)
                request.user.email = new_email
            except ValidationError:
                return JsonResponse({'status': 'fail', 'error': 'Некорректный формат email.'})
        else:
            request.user.email = ''

        request.user.save()
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


@login_required
@csrf_exempt
def upload_portfolio_image(request):
    if request.method == 'POST':
        if 'image' in request.FILES:
            user_profile = request.user.userprofile
            image = request.FILES['image']
            portfolio_image = PortfolioImage.objects.create(user=user_profile, image=image)
            return JsonResponse({
                'status': 'success',
                'image_url': portfolio_image.image.url,
                'image_id': portfolio_image.id
            })
        else:
            return JsonResponse({'status': 'error', 'error': 'Image file not found.'})
    return JsonResponse({'status': 'error', 'error': 'Invalid request method.'})


@login_required
@csrf_exempt
def delete_portfolio_image(request):
    if request.method == 'POST':
        image_id = request.POST.get('image_id')
        try:
            image = PortfolioImage.objects.get(id=image_id, user=request.user.userprofile)
            image_path = image.image.path
            image.delete()

            if os.path.exists(image_path):
                os.remove(image_path)
            return JsonResponse({'status': 'success'})
        except PortfolioImage.DoesNotExist:
            return JsonResponse({'status': 'error', 'error': 'Image not found'})
    return JsonResponse({'status': 'error', 'error': 'Invalid request'})
