document.addEventListener('DOMContentLoaded', function() {
    var isAuthenticated = window.isAuthenticated;
    var userId = window.userId;
    var userName = window.userName;
    var loginUrl = window.loginUrl;

    document.querySelectorAll('[id^="participants_"]').forEach(function(element) {
        var groupId = element.id.split('_')[1];
        var participants = JSON.parse(element.value.replace(/'/g, '"'));
        var buttonsElement = document.getElementById('buttons_' + groupId);
        var leaderId = document.getElementById('group_leader_id_' + groupId).value;
        var participantCount = parseInt(document.getElementById('participant_quantity_' + groupId).textContent, 10);

        if (buttonsElement) {
            if (isAuthenticated) {
                if (participantCount >= 15) {
                    if (userId != leaderId) {
                        buttonsElement.innerHTML = '<span>Группа заполнена (максимум 15 участников).</span>';
                    } else {
                        buttonsElement.innerHTML = '<h6 style="color:green; margin-bottom: 1rem;">Вы - создатель этой группы</h6>' +
                                                   '<button class="btn" style="transition: none; animation: none;" onclick="openEditModal()">Редактировать группу</button>';
                    }
                } else if (participants.includes(userId) && (userId != leaderId)) {
                    buttonsElement.innerHTML = '<button class="btn btn-danger" onclick="removeUserFromGroup(' + groupId + ')">Выйти из группы</button>';
                } else if (userId != leaderId) {
                    buttonsElement.innerHTML = '<button class="btn" onclick="addUserInGroup(' + groupId + ')">Присоединиться к группе</button>';
                } else {
                    buttonsElement.innerHTML = '<h6 style="color:green; margin-bottom: 1rem;">Вы - создатель этой группы</h6>' +
                                               '<button class="btn" style="transition: none; animation: none;" onclick="openEditModal()">Редактировать группу</button>';
                }
            } else {
                buttonsElement.innerHTML = '<span>Для присоединения необходимо <a href="' + loginUrl + '">авторизоваться</a>.</span>';
            }
        }
    });
});

function createGroup() {
    if (!isAuthenticated) {
        alert("Для создания группы необходимо авторизоваться.");
        return;
    }

    var participants = [];
    participants.push(userId);
    var routeId = document.getElementById('route_id').value;
    var name = document.getElementById('groupName').value;

    var groupData = {
        name: name,
        leader_id: userId,
        participants: participants
    };

    var groupDataJSON = JSON.stringify(groupData, null, 2);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/save_group_data/" + routeId + "/", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Перезагружаем страницу, чтобы отобразить новую группу
            window.location.reload();
        }
    };
    xhr.send(groupDataJSON);
}

function addUserInGroup(groupId) {
    if (!isAuthenticated) {
        alert("Для присоединения к группе необходимо авторизоваться.");
        return;
    }

    var participantCountElement = document.getElementById('participant_quantity_' + groupId);
    var currentCount = parseInt(participantCountElement.textContent, 10);

    if (currentCount >= 15) {
        alert("Невозможно присоединиться к группе: достигнуто максимальное количество участников (15).");
        return;
    }

    var participants = document.getElementById('participants_' + groupId).value;
    participants = participants.replace(/'/g, '"');
    participants = JSON.parse(participants);
    if (!participants.includes(userId)) {
        participants.push(userId);
    }
    var groupData = {
        participants: participants
    }
    var groupDataJSON = JSON.stringify(groupData, null, 2);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/update_group_participants/" + groupId + "/", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('buttons_' + groupId).innerHTML = '<button class="btn btn-danger" onclick="removeUserFromGroup(' + groupId + ')">Выйти из группы</button>';

            var participantsDiv = document.getElementById('all_participants_' + groupId);
            var newParticipant = document.createElement('a');
            newParticipant.href = '/user/profile/';
            newParticipant.className = 'participant-badge current-user';
            newParticipant.textContent = userName;
            newParticipant.id = userId;
            participantsDiv.appendChild(newParticipant);

            var participantCountElement = document.getElementById('participant_quantity_' + groupId);
            var currentCount = parseInt(participantCountElement.textContent, 10);
            participantCountElement.textContent = currentCount + 1;

            if (currentCount + 1 >= 15) {
                document.getElementById('buttons_' + groupId).innerHTML = '<span>Группа заполнена (максимум 15 участников).</span>';
            }
        }
    };
    xhr.send(groupDataJSON);
}

function removeUserFromGroup(groupId) {
    if (!isAuthenticated) {
        alert("Для выхода из группы необходимо авторизоваться.");
        return;
    }

    var privacySettingElement = document.getElementById('group-privacy-setting_' + groupId);
    var privacySetting = privacySettingElement ? privacySettingElement.value : 'open';
    var leaderId = document.getElementById('group_leader_id_' + groupId).value;

    if (privacySetting === 'private' && userId !== leaderId) {
        var confirmLeave = confirm("Группа является закрытой. После выхода вы не сможете снова присоединиться к ней. Вы уверены, что хотите выйти?");
        if (!confirmLeave) {
            return;
        }
        setTimeout(function() {
            window.location.reload();
        }, 300);
    }

    var participants = document.getElementById('participants_' + groupId).value;
    participants = participants.replace(/'/g, '"');
    participants = JSON.parse(participants);
    if (participants.includes(userId)) {
        participants = participants.filter(item => item !== userId);
    }
    var groupData = {
        participants: participants
    }
    var groupDataJSON = JSON.stringify(groupData, null, 2);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/update_group_participants/" + groupId + "/", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('buttons_' + groupId).innerHTML = '<button class="btn" onclick="addUserInGroup(' + groupId + ')">Присоединиться к группе</button>';
            var participantsDiv = document.getElementById('all_participants_' + groupId);
            var participantToRemove = participantsDiv.querySelector('[id="' + userId + '"]');
            if (participantToRemove) {
                participantsDiv.removeChild(participantToRemove);
                var participantCountElement = document.getElementById('participant_quantity_' + groupId);
                var currentCount = parseInt(participantCountElement.textContent, 10);
                participantCountElement.textContent = currentCount - 1;

                // Если количество участников стало менее 15, восстанавливаем кнопку присоединения
                if (currentCount - 1 < 15) {
                    var isLeader = userId === document.getElementById('group_leader_id_' + groupId).value;
                    if (!isLeader) {
                        document.getElementById('buttons_' + groupId).innerHTML = '<button class="btn" onclick="addUserInGroup(' + groupId + ')">Присоединиться к группе</button>';
                    }
                }
            }
        }
    };
    xhr.send(groupDataJSON);
}

function deleteGroup(groupId) {
    if (confirm("Вы уверены, что хотите удалить эту группу?")) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/delete_group/" + groupId + "/", true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.status === "success") {
                    // Удаляем элемент группы из DOM
                    var groupCard = document.querySelector('[id="group_card_' + groupId + '"]');
                    if (groupCard) {
                        groupCard.remove();
                    }
                } else {
                    alert(response.message);
                }
            }
        };
        xhr.send();
    }
}
