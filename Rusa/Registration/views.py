from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import UserSignUpForm, AdminSignUpForm, CustomAuthenticationForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout

def logout_view(request):
    logout(request)
    return redirect('view_login')

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
    return render(request, 'html/signup_user.html', {'form': form})

def view_login(request):
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
    return render(request, 'html/login.html', {'form': form})
