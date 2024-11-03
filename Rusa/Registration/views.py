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
            return redirect('view_main')
    else:
        form = UserSignUpForm()
    return render(request, 'html/signup_user.html', {'form': form})

def view_login(request):
    error_message = None

    if request.method == "POST":
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('view_main')
        else:
            error_message = "Неправильный логин или пароль."
    else:
        form = CustomAuthenticationForm()

    context = {
        'form': form,
        'error_message': error_message,
    }
    return render(request, 'html/login.html', context)
