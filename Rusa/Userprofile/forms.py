from django import forms
from .models import UserProfile
from django.core.exceptions import ValidationError
from datetime import datetime

class UserProfileForm(forms.ModelForm):
    birth_date = forms.DateField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'YYYY-MM-DD'}),
        input_formats=['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y']
    )

    class Meta:
        model = UserProfile
        fields = ('name', 'region', 'birth_date', 'profession', 'personal_photo')

    def clean_birth_date(self):
        birth_date = self.cleaned_data.get('birth_date')
        if birth_date:
            try:
                datetime.strptime(str(birth_date), '%Y-%m-%d')
            except ValueError:
                try:
                    datetime.strptime(str(birth_date), '%d/%m/%Y')
                except ValueError:
                    try:
                        datetime.strptime(str(birth_date), '%d-%m-%Y')
                    except ValueError:
                        raise ValidationError("Enter a valid date.")
        return birth_date
