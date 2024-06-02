from django import forms
from .models import UserProfile
from django.core.exceptions import ValidationError
from datetime import datetime
from django.forms.widgets import DateInput

class UserProfileForm(forms.ModelForm):
    birth_date = forms.DateField(
        widget=DateInput(attrs={'type': 'date', 'placeholder': 'ДД.ММ.ГГГГ'}, format='%d.%m.%Y'),
        input_formats=['%d.%m.%Y']
    )
    class Meta:
        model = UserProfile
        fields = ('name', 'region', 'birth_date', 'profession', 'personal_photo', 'bio')
