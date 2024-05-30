from django import forms
from .models import UserProfile
from django.core.exceptions import ValidationError
from datetime import datetime

class UserProfileForm(forms.ModelForm):
    birth_date = forms.DateField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'YYYY-MM-DD'}),
        input_formats=['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y.%m.%d']
    )

    class Meta:
        model = UserProfile
        fields = ('name', 'region', 'birth_date', 'profession', 'personal_photo', 'bio')

    def clean_birth_date(self):
        birth_date = self.cleaned_data.get('birth_date')
        if birth_date:
            valid_formats = ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y.%m.%d']
            for fmt in valid_formats:
                try:
                    # Parse the date using the format
                    date_obj = datetime.strptime(birth_date, fmt)
                    # Return the date in YYYY-MM-DD format
                    return date_obj.strftime('%Y-%m-%d')
                except ValueError:
                    continue
            raise ValidationError("Enter a valid date.")
        return birth_date
