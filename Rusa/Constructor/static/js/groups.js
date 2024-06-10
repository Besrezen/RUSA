document.addEventListener('DOMContentLoaded', function() {
        
    document.querySelectorAll('[id^="participants_"]').forEach(function(element) {
        var groupId = element.id.split('_')[1];
        // console.log(element.value);
        var participants = element.value;
        participants = participants.replace(/'/g, '"');
        participants = JSON.parse(participants);
        var buttonsElement = document.getElementById('buttons_' + groupId);
        var leaderId = document.getElementById('group_leader_id_' + groupId).value;
        // console.log(leaderId);
        if (buttonsElement){
            if (participants.includes(userId) && (userId != leaderId)) {
                document.getElementById('buttons_' + groupId).innerHTML = '<button style="margin-top: 60px;" class="btn btn-danger" onclick="removeUserFromGroup(' + groupId + ')">Выйти из группы</button>';
            } else if (userId != leaderId){
                document.getElementById('buttons_' + groupId).innerHTML = '<button style="margin-top: 60px;" class="btn btn-success" onclick="addUserInGroup(' + groupId + ')">Присоединиться к походу</button>';
            } else {
                document.getElementById('buttons_' + groupId).innerHTML = '<br><h6 style="color:green; margin-top: 10px;">Вы - создатель этой группы</h6>' +
                '<button class="btn btn-danger">Удалить группу</button>';
            }
        }
    });
});

function createGroup() {
    var participants = [];
    participants.push(userId);
    var routeId = document.getElementById('route_id').value;
    // console.log(userId);
    // console.log(participants);
    // console.log(document.getElementById('groupName').value);
    var name = document.getElementById('groupName').value;
    var groupData = {
        name: name,
        leader_id: userId,
        participants: participants
    }
    var groupDataJSON = JSON.stringify(groupData, null, 2);
    // console.log(groupDataJSON);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/save_group_data/" + routeId + "/", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(groupDataJSON);
}

function addUserInGroup(groupId) {
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
        // Обновите DOM здесь
        document.getElementById('buttons_' + groupId).innerHTML = '<button style="margin-top: 60px;" class="btn btn-danger" onclick="removeUserFromGroup(' + groupId + ')">Выйти из группы</button>';
        // Добавьте имя пользователя в div "participants"
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
        // Обновите DOM здесь
        document.getElementById('buttons_' + groupId).innerHTML = '<button style="margin-top: 60px;"  class="btn btn-success" onclick="addUserInGroup(' + groupId + ')">Присоединиться к походу</button>';
        // Добавьте имя пользователя в div "participants"
        var participantsDiv = document.getElementById('all_participants_' + groupId);
        var participantToRemove = participantsDiv.querySelector('[id^="' + userId + '"]');
        // console.log(participantToRemove);
        if (participantToRemove) {
            participantsDiv.removeChild(participantToRemove);
        }
    }
    };
    xhr.send(groupDataJSON);
}