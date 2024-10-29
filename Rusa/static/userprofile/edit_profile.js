$(document).ready(function() {
    $(".edit_profile").click(function() {
        editProfile();
    });

    function editProfile() {

        let privacySpan = $(".privacy");
        let privacyValue = privacySpan.text().trim();
        let privacyOptionOpen = privacyValue === 'Открытый' ? 'selected' : '';
        let privacyOptionClosed = privacyValue === 'Закрытый' ? 'selected' : '';
        privacySpan.replaceWith(`
            <select class="privacy_select">
                <option value="open" ${privacyOptionOpen}>Открытый</option>
                <option value="closed" ${privacyOptionClosed}>Закрытый</option>
            </select>
        `);

        let birthDateSpan = $(".birth_date");
        let birthDateValue = birthDateSpan.text().trim();

        if (birthDateValue && birthDateValue !== "None" && birthDateValue !== "дд.мм.гггг") {
            let birthDateParts = birthDateValue.split('.');
            let birthDateFormatted = `${birthDateParts[2]}-${birthDateParts[1]}-${birthDateParts[0]}`; // Преобразование даты
            birthDateSpan.replaceWith('<input type="date" class="birth_date_input" value="' + birthDateFormatted + '">');
        } else {
            birthDateSpan.replaceWith('<input type="date" class="birth_date_input" value="">');
        }

        let usernameSpan = $(".username");
        let usernameValue = usernameSpan.text().trim();
        usernameSpan.replaceWith('<input type="text" class="username_input" value="' + usernameValue + '">');

        let emailSpan = $(".email");
        let nameSpan = $(".name");
        let regionSpan = $(".region");
        let specializationSpan = $(".text_spcecialization");
        let aboutMeSpan = $(".text_area");

        let emailValue = emailSpan.text().trim();
        let nameValue = nameSpan.text().trim();
        let regionValue = regionSpan.text().trim();
        let specializationValue = specializationSpan.text().trim();
        let aboutMeValue = aboutMeSpan.text().trim();

        emailSpan.replaceWith('<input type="email" class="email_input" value="' + emailValue + '">');
        nameSpan.replaceWith('<input type="text" class="name_input" value="' + nameValue + '">');
        regionSpan.replaceWith('<input type="text" class="region_input" value="' + regionValue + '">');
        specializationSpan.replaceWith('<input type="text" class="specialization_input" value="' + specializationValue + '">');
        aboutMeSpan.replaceWith('<textarea class="about_me_input">' + aboutMeValue + '</textarea>');

        $(".edit_profile").replaceWith("<button type='button' class='btn btn-edit save_profile'>Сохранить</button>");
        $("#upload-photo-btn").show();

        $(".save_profile").click(function() {
            let newBirthDate = $(".birth_date_input").val() || null;
            let newUsername = $(".username_input").val().trim() || '';
            let newEmail = $(".email_input").val().trim();
            let newName = $(".name_input").val().trim() || '';
            let newRegion = $(".region_input").val().trim() || '';
            let newSpecialization = $(".specialization_input").val().trim() || '';
            let newAboutMe = $(".about_me_input").val().trim() || '';

            let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (newEmail && !emailRegex.test(newEmail)) {
                alert('Пожалуйста, введите корректный email.');
                return;
            }

            if (!newEmail || /^\s*$/.test(newEmail)) {
                newEmail = '';
            }

            let personalPhoto = $("#id_personal_photo")[0].files[0];

            let formData = new FormData();
            formData.append('birth_date', newBirthDate);
            formData.append('username', newUsername);
            formData.append('email', newEmail);
            formData.append('name', newName);
            formData.append('region', newRegion);
            formData.append('profession', newSpecialization);
            formData.append('about_me', newAboutMe);

            // Приватность
            let newPrivacy = $(".privacy_select").val();
            formData.append('privacy', newPrivacy);

            if (personalPhoto) {
                formData.append('personal_photo', personalPhoto);
            }
            formData.append('csrfmiddlewaretoken', $('input[name="csrfmiddlewaretoken"]').val());

            $.ajax({
                url: updateProfileUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.status === 'success') {
                        let displayDateFormatted = 'Не указано';

                        if (newBirthDate) {
                            let displayDateParts = newBirthDate.split('-');
                            if (displayDateParts.length === 3) { // Убедитесь, что дата правильно разбивается
                                displayDateFormatted = `${displayDateParts[2]}.${displayDateParts[1]}.${displayDateParts[0]}`;
                            }
                        }
                        $(".privacy_select").replaceWith('<span class="info-value privacy">' + (newPrivacy === 'open' ? 'Открытый' : 'Закрытый') + '</span>');
                        $(".birth_date_input").replaceWith('<span class="info-value birth_date">' + displayDateFormatted + '</span>');
                        $(".email_input").replaceWith('<span class="info-value email">' + (newEmail !== '' ? newEmail : 'Не указано') + '</span>');
                        $(".name_input").replaceWith('<span class="info-value name">' + (newName !== '' ? newName : 'Не указано') + '</span>');
                        $(".region_input").replaceWith('<span class="info-value region">' + (newRegion !== '' ? newRegion : 'Не указано') + '</span>');
                        $(".specialization_input").replaceWith('<span class="info-value text_spcecialization">' + (newSpecialization !== '' ? newSpecialization : 'Не указано') + '</span>');
                        $(".about_me_input").replaceWith('<span class="info-value text_area">' + (newAboutMe !== '' ? newAboutMe : 'Информация отсутствует') + '</span>');

                        $(".username_input").replaceWith('<span class="info-value username">' + (newUsername !== '' ? newUsername : 'Не указано') + '</span>');

                        if (personalPhoto) {
                            let reader = new FileReader();
                            reader.onload = function(e) {
                                $("#profile-photo").attr('src', e.target.result);
                            }
                            reader.readAsDataURL(personalPhoto);
                        }

                        $(".save_profile").replaceWith("<button type='button' class='btn btn-edit edit_profile'>Редактировать</button>");
                        $("#upload-photo-btn").hide();
                        $(".edit_profile").click(function() {
                            editProfile();
                        });
                    } else {
                        alert('Ошибка при обновлении профиля: ' + response.error);
                    }
                },
                error: function(response) {
                    alert('Ошибка при обновлении профиля');
                }
            });
        });
    }
});
