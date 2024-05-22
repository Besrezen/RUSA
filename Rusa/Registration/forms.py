from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser

class UserSignUpForm(UserCreationForm):
    username = forms.CharField(label='Имя пользователя', max_length=150)
    email = forms.EmailField(label='Электронная почта')
    last_name = forms.CharField(label='Фамилия', max_length=150)
    first_name = forms.CharField(label='Имя', max_length=150)
    password1 = forms.CharField(label='Пароль', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Подтверждение пароля', widget=forms.PasswordInput)
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'last_name', 'first_name', 'password1')

class AdminSignUpForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password1')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_admin = True
        if commit:
            user.save()
        return user

class AuthenticationForm(UserCreationForm):
    username = forms.CharField(label='Имя пользователя', max_length=150)
    password1 = forms.CharField(label='Пароль', widget=forms.PasswordInput)
    class Meta:
        model = CustomUser
        fields = ('username', 'password1')