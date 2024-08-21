$(document).ready(function() {
    $(".edit_profile").click(function() {
        editProfile();
    });

    function editProfile() {
        let birthDateSpan = $(".birth_date");
        let birthDateValue = birthDateSpan.text().trim();

        if (birthDateValue && birthDateValue !== "None" && birthDateValue !== "дд.мм.гггг") {
            let birthDateParts = birthDateValue.split('.');
            let birthDateFormatted = `${birthDateParts[2]}-${birthDateParts[1]}-${birthDateParts[0]}`; // Преобразование даты
            birthDateSpan.replaceWith('<input type="date" class="birth_date_input" value="' + birthDateFormatted + '">');
        } else {
            birthDateSpan.replaceWith('<input type="date" class="birth_date_input" value="">');
        }

        let emailSpan = $(".email");
        let nameSpan = $(".name");
        let regionSpan = $(".region");
        let specializationSpan = $(".text_spcecialization");
        let aboutMeSpan = $(".text_area");

        let emailValue = emailSpan.text();
        let nameValue = nameSpan.text();
        let regionValue = regionSpan.text();
        let specializationValue = specializationSpan.text();
        let aboutMeValue = aboutMeSpan.text();

        emailSpan.replaceWith('<input type="email" class="email_input" value="' + emailValue + '">');
        nameSpan.replaceWith('<input type="text" class="name_input" value="' + nameValue + '">');
        regionSpan.replaceWith('<input type="text" class="region_input" value="' + regionValue + '">');
        specializationSpan.replaceWith('<input type="text" class="specialization_input" value="' + specializationValue + '">');
        aboutMeSpan.replaceWith('<textarea class="about_me_input">' + aboutMeValue + '</textarea>');

        $(".edit_profile").replaceWith("<button type='button' class='btn btn-edit save_profile'>Сохранить</button>");
        $("#upload-photo-btn").show();

        $(".save_profile").click(function() {
            let newBirthDate = $(".birth_date_input").val() || null;
            let newEmail = $(".email_input").val();
            let newName = $(".name_input").val();
            let newRegion = $(".region_input").val();
            let newSpecialization = $(".specialization_input").val();
            let newAboutMe = $(".about_me_input").val();
            let personalPhoto = $("#id_personal_photo")[0].files[0];

            // Преобразование даты в ISO формат (YYYY-MM-DD)

            let birthDateFormatted = newBirthDate;
            let formData = new FormData();
            formData.append('birth_date', birthDateFormatted);
            formData.append('name', newName);
            formData.append('region', newRegion);
            formData.append('profession', newSpecialization);
            formData.append('about_me', newAboutMe);
            if (personalPhoto) {
                formData.append('personal_photo', personalPhoto);
            }
            formData.append('csrfmiddlewaretoken', $('input[name="csrfmiddlewaretoken"]').val());

            // Отправка данных на сервер с помощью AJAX
            $.ajax({
                url: 'update_profile/',  // URL для обновления профиля
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.status === 'success') {
                        let displayDateFormatted = 'Не указано';

                    // Преобразование даты обратно для отображения, если она существует
                    if (birthDateFormatted) {
                        let displayDateParts = birthDateFormatted.split('-');
                        if (displayDateParts.length === 3) { // Убедитесь, что дата правильно разбивается
                            displayDateFormatted = `${displayDateParts[2]}.${displayDateParts[1]}.${displayDateParts[0]}`;
                        }
                    }

                        $(".birth_date_input").replaceWith('<span class="birth_date">' + displayDateFormatted + '</span>');
                        $(".email_input").replaceWith('<span class="email">' + newEmail + '</span>');
                        $(".name_input").replaceWith('<span class="name">' + newName + '</span>');
                        $(".region_input").replaceWith('<span class="region">' + newRegion + '</span>');
                        $(".specialization_input").replaceWith('<span class="text_spcecialization">' + newSpecialization + '</span>');
                        $(".about_me_input").replaceWith('<span class="text_area">' + newAboutMe + '</span>');

                        // Обновление фото профиля
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
