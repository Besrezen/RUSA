from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import UserProfile

@login_required
def view_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    return render(request, 'Userprofile/profile.html', {'profile': profile})

@login_required
def update_profile(request):
    if request.method == 'POST':
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.birth_date = request.POST.get('birth_date')
        profile.name = request.POST.get('name')
        profile.region = request.POST.get('region')
        profile.profession = request.POST.get('profession')
        profile.bio = request.POST.get('about_me')
        profile.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'fail'})
