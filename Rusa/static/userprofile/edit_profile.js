$(document).ready(function() {
    $(".edit_profile").click(function() {
        editProfile();
    });

    function editProfile() {
        // Замена span на input для всех редактируемых полей
        let ageSpan = $(".age");
        let emailSpan = $(".email");
        let nameSpan = $(".name");
        let regionSpan = $(".region");
        let specializationSpan = $(".text_spcecialization");
        let aboutMeSpan = $(".text_area");

        let ageValue = ageSpan.text().replace(' лет', '');
        let emailValue = emailSpan.text();
        let nameValue = nameSpan.text();
        let regionValue = regionSpan.text();
        let specializationValue = specializationSpan.text();
        let aboutMeValue = aboutMeSpan.text();

        ageSpan.replaceWith('<input type="text" class="age_input" value="' + ageValue + '">');
        emailSpan.replaceWith('<input type="email" class="email_input" value="' + emailValue + '">');
        nameSpan.replaceWith('<input type="text" class="name_input" value="' + nameValue + '">');
        regionSpan.replaceWith('<input type="text" class="region_input" value="' + regionValue + '">');
        specializationSpan.replaceWith('<input type="text" class="specialization_input" value="' + specializationValue + '">');
        aboutMeSpan.replaceWith('<textarea class="about_me_input">' + aboutMeValue + '</textarea>');

        // Замена кнопки "Редактировать" на "Сохранить"
        $(".edit_profile").replaceWith("<button class='save_profile'>Сохранить</button>");

        $(".save_profile").click(function() {
            // Получение новых значений
            let newAge = $(".age_input").val();
            let newEmail = $(".email_input").val();
            let newName = $(".name_input").val();
            let newRegion = $(".region_input").val();
            let newSpecialization = $(".specialization_input").val();
            let newAboutMe = $(".about_me_input").val();

            // Отправка данных на сервер с помощью AJAX
            $.ajax({
                url: 'update_profile/',  // URL для обновления профиля
                type: 'POST',
                data: {
                    'birth_date': newAge,
                    'name': newName,
                    'region': newRegion,
                    'profession': newSpecialization,
                    'bio': newAboutMe,
                    'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').val()
                },
                success: function(response) {
                    // Обновление значений на странице
                    $(".age_input").replaceWith('<span class="age">' + newAge + ' лет</span>');
                    $(".email_input").replaceWith('<span class="email">' + newEmail + '</span>');
                    $(".name_input").replaceWith('<span class="name">' + newName + '</span>');
                    $(".region_input").replaceWith('<span class="region">' + newRegion + '</span>');
                    $(".specialization_input").replaceWith('<span class="text_spcecialization">' + newSpecialization + '</span>');
                    $(".about_me_input").replaceWith('<span class="text_area">' + newAboutMe + '</span>');

                    // Замена кнопки "Сохранить" обратно на "Редактировать"
                    $(".save_profile").replaceWith("<button class='edit_profile'>Редактировать</button>");

                    // Повторное привязывание обработчика к новой кнопке "Редактировать"
                    $(".edit_profile").click(function() {
                        editProfile();
                    });
                },
                error: function(response) {
                    // Обработка ошибок
                    alert('Ошибка при обновлении профиля');
                }
            });
        });
    }
});
