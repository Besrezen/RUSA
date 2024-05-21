from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Route, Group
from django.http import JsonResponse

@login_required
def create_group(request, route_id):
    route = get_object_or_404(Route, id=route_id)
    group, created = Group.objects.get_or_create(route=route)
    if request.method == 'POST':
        group.users.add(request.user)
        return redirect('group_detail', group_id=group.id)
    return render(request, 'create_group.html', {'route': route, 'group': group})

@login_required
def group_detail(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    return render(request, 'group_detail.html', {'group': group})

@login_required
def group_list(request):
    groups = Group.objects.all()
    return render(request, 'group_list.html', {'groups': groups})

@login_required
def join_group(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    if request.method == 'POST':
        group.users.add(request.user)
        return JsonResponse({'success': True})
    return JsonResponse({'success': False})