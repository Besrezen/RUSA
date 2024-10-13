document.addEventListener('DOMContentLoaded', function() {
    // Используем глобальные переменные, определенные в шаблоне
    var isAuthenticated = window.isAuthenticated; // true или false
    var userId = window.userId; // ID пользователя или пустая строка
    var userName = window.userName; // Имя пользователя или пустая строка
    var loginUrl = window.loginUrl; // URL страницы авторизации

    // Обрабатываем каждую группу
    document.querySelectorAll('[id^="participants_"]').forEach(function(element) {
        var groupId = element.id.split('_')[1];
        var participants = JSON.parse(element.value.replace(/'/g, '"'));
        var buttonsElement = document.getElementById('buttons_' + groupId);
        var leaderId = document.getElementById('group_leader_id_' + groupId).value;
        
        if (buttonsElement) {
            if (isAuthenticated) {
                if (participants.includes(userId) && (userId != leaderId)) {
                    // Пользователь уже в группе и не лидер
                    buttonsElement.innerHTML = '<button class="btn btn-danger" onclick="removeUserFromGroup(' + groupId + ')">Выйти из группы</button>';
                } else if (userId != leaderId) {
                    // Пользователь не в группе и не лидер
                    buttonsElement.innerHTML = '<button class="btn btn-success" onclick="addUserInGroup(' + groupId + ')">Присоединиться к походу</button>';
                } else {
                    // Пользователь — лидер группы
                    buttonsElement.innerHTML = '<h6 style="color:green; margin-bottom: 1rem;">Вы - создатель этой группы</h6>' +
                                               '<button class="btn btn-danger" onclick="deleteGroup(' + groupId + ')">Удалить группу</button>';
                }
            } else {
                // Пользователь не авторизован
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
        var newParticipant = document.createElement('span');
        newParticipant.className = 'participant-badge';
        newParticipant.textContent = userName;
        newParticipant.id = userId;
        participantsDiv.appendChild(newParticipant);
    }
    };
    xhr.send(groupDataJSON);
}

function removeUserFromGroup(groupId) {
    if (!isAuthenticated) {
        alert("Для выхода из группы необходимо авторизоваться.");
        return;
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
        document.getElementById('buttons_' + groupId).innerHTML = '<button class="btn btn-success" onclick="addUserInGroup(' + groupId + ')">Присоединиться к походу</button>';
        var participantsDiv = document.getElementById('all_participants_' + groupId);
        var participantToRemove = participantsDiv.querySelector('[id="' + userId + '"]');
        if (participantToRemove) {
            participantsDiv.removeChild(participantToRemove);
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
