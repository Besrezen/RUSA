from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import UserSignUpForm, AdminSignUpForm, CustomAuthenticationForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout

def view_adres(request):
    return render(request, "html/page48229631.html")

def logout_view(request):
    logout(request)
    return redirect('view_login')

@login_required
def view_admin(request):
    return render(request, "html/home_admin.html")

def view_login(request):
    form = CustomAuthenticationForm()
    return render(request, "html/page48432039.html", {'form': form})

def show_login(request):
    return redirect('view_login')

@login_required
def view_main(request):
    return redirect('view_profile')

def user_signup(request):
    if request.method == 'POST':
        form = UserSignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            # Перенаправление на страницу пользователя
            return redirect('view_main')
    else:
        form = UserSignUpForm()
    return render(request, 'html/page48229631.html', {'form': form})

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
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user.is_admin == 0:
                login(request, user)
                return redirect('view_main')
            else:
                login(request, user)
                return redirect('view_main')
    else:
        form = CustomAuthenticationForm()
    return render(request, 'html/page48432039.html', {'form': form})
