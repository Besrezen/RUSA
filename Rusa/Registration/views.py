from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import UserSignUpForm, AdminSignUpForm
from django.contrib.auth.forms import AuthenticationForm


def view_adres(request):
    return render(request, "html/base.html")

def view_user(request):
    return render(request, "html/home_user.html")

def view_admin(request):
    return render(request, "html/home_admin.html")

def user_signup(request):
    if request.method == 'POST':
        form = UserSignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            # Перенаправление на страницу пользователя
            return redirect('view_user')
    else:
        form = UserSignUpForm()
    return render(request, 'html/signup_user.html', {'form': form})

def admin_signup(request):
    if request.method == 'POST':
        form = AdminSignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            # Перенаправление на страницу администратора
            return redirect('view_admin')
    else:
        form = AdminSignUpForm()
    return render(request, 'html/signup_admin.html', {'form': form})


def my_login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user.is_admin == 0:
                login(request, user)
                return redirect('view_user')
            else:
                login(request, user)
                return redirect('view_admin')
    else:
        form = AuthenticationForm()
    return render(request, 'html/login.html', {'form': form})
