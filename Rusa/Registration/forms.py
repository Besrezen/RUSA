from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser

class UserSignUpForm(UserCreationForm):
    username = forms.CharField(
        label="Имя пользователя",
        max_length=150,
        required=True,
        help_text="Требуется. Не более 150 символов. Только буквы, цифры и @/./+/-/_."
    )
    email = forms.EmailField(
        required=True,
        help_text="Введите ваш адрес электронной почты."
    )
    password1 = forms.CharField(
        label="Пароль",
        widget=forms.PasswordInput,
        help_text=(
            "Ваш пароль не должен быть слишком похож на другую личную информацию.\n"
            "Ваш пароль должен содержать не менее 8 символов.\n"
            "Ваш пароль не должен быть распространенным паролем.\n"
            "Ваш пароль не должен состоять только из цифр."
        )
    )
    password2 = forms.CharField(
        label="Подтверждение пароля",
        widget=forms.PasswordInput,
        help_text="Введите тот же пароль, что и выше, для проверки."
    )
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password1')

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


class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        max_length=254,
        widget=forms.TextInput(attrs={'autofocus': True}),
        label="Имя пользователя",
    )
    password = forms.CharField(
        label="Пароль",
        strip=False,
        widget=forms.PasswordInput,
    )