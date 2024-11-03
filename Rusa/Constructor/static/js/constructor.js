ymaps.ready(init);

function init() {
    var centerCoordinates = [55.703697, 36.192678];
    var addingPlacemark = false;
    var notes = [];
    var cursorPlacemark;
    var myMap = new ymaps.Map('constructor', {
        center: centerCoordinates, // координаты центра карты
        zoom: 9.5, // уровень масштабирования
        controls: ['zoomControl'],
        behaviors: ['drag', 'scrollZoom'],
        type: 'yandex#map',
    }, {
        yandexMapDisablePoiInteractivity: true,
    }
    );
    
    var myPlacemark;  
    var lineCoordinates = [];
    var length = 0;

    putRusaIcon(myMap, myPlacemark);

    var myPolyline = new ymaps.Polyline([], {}, {
        strokeColor: "#0000FF",
        strokeWidth: 4,
        strokeOpacity: 0.5,
        strokeStyle: "dash"
    });
    myMap.geoObjects.add(myPolyline);

    myMap.events.add('click', function (e) {
        console.log(lineCoordinates);
        if (addingPlacemark) return;
        var coords = e.get('coords');
        length = 0;
        lineCoordinates.push(coords);
        for (var i = 0; i < lineCoordinates.length - 1; i++) {
            length += ymaps.coordSystem.geo.getDistance(lineCoordinates[i], lineCoordinates[i + 1]);
        }
        length != [] ? (document.getElementById('coordinates').innerText = "Длина маршрута: " + length.toFixed(2) + " м") : (document.getElementById('coordinates').innerText = "");
        myPolyline.geometry.setCoordinates(lineCoordinates);
        if (lineCoordinates.length == 1) {
            putFirstPlaceMark(myMap, coords);
        }
    });

    document.getElementById('deleteButton').addEventListener('click', function () {
        lineCoordinates = [];
        length = 0;
        notes = [];
        document.getElementById('coordinates').innerText = "";
        myPolyline.geometry.setCoordinates(lineCoordinates);
        deleteAllPlacemarks(myMap, centerCoordinates);
    });
    
    document.getElementById('backButton').addEventListener('click', function () {
        if (lineCoordinates.length == 1) {
        deleteCurrentPlacemark(myMap, lineCoordinates[0]);
        lineCoordinates.pop();
        length = 0;
        } else {
            lineCoordinates.pop();
            length = 0;
            for (var i = 0; i < lineCoordinates.length - 1; i++) {
                length += ymaps.coordSystem.geo.getDistance(lineCoordinates[i], lineCoordinates[i + 1]);
            }
            length != 0 ? (document.getElementById('coordinates').innerText = "Длина маршрута: " + length.toFixed(2) + " м") : (document.getElementById('coordinates').innerText = "");
            myPolyline.geometry.setCoordinates(lineCoordinates);
        }
    });
    
    document.getElementById('saveLineButton').addEventListener('click', function () {
        // console.log(notes);
        saveData(myMap, myPolyline, lineCoordinates, notes, length);
    });
    document.getElementById('addPlacemarkButton').addEventListener('click', function () {
        addingPlacemark = true;
        myMap.events.add('click', onMapClick);
        myMap.events.add('mousemove', onMapMouseMove);
    });

    // function onMapClick(e) {
    //     removeCursorPlacemark();
    //     var coords = e.get('coords');
    //     var comment = prompt('Введите комментарий для метки:');
    //     var myNote = [coords, comment];
    //     if (comment !== null && comment.trim() !== "") {
    //         var placemark = new ymaps.Placemark(coords, {
    //             balloonContent: '<input type="text" id="balloonInput" placeholder="Введите комментарий">'
    //         }, {
    //             preset: 'islands#icon',
    //             iconColor: '#0095b6'
    //         });
    //         notes.push(myNote);
    //         myMap.geoObjects.add(placemark);
    //         myMap.events.remove('click', onMapClick);
    //         myMap.events.remove('mousemove', onMapMouseMove);
    //         addingPlacemark = false;
    //     }
    // }

    function onMapClick(e) {
        var coords = e.get('coords');
        var placemark = new ymaps.Placemark(coords, {
            balloonContent: '<input type="text" id="balloonInput" placeholder="Введите комментарий">'
        }, {
            preset: 'islands#icon',
            iconColor: '#0095b6'
        });
    
        placemark.events.add('balloonopen', function () {
            removeCursorPlacemark();
            addingPlacemark = false;
            var balloonContent = document.getElementById('balloonInput');
            balloonContent.focus();
            balloonContent.addEventListener('change', function () {
                var comment = balloonContent.value;
                if (comment.trim() !== "") {
                    placemark.properties.set('balloonContent', comment);
                    notes.push([coords, comment]);
                    myMap.geoObjects.add(placemark);
                    myMap.events.remove('click', onMapClick);
                    myMap.events.remove('mousemove', onMapMouseMove);
                }
            });
        });
        myMap.geoObjects.add(placemark);
        placemark.balloon.open();
    }
    function onMapMouseMove(e) {
        if (!addingPlacemark) return;
        var coords = e.get('coords');
        if (!cursorPlacemark) {
            cursorPlacemark = new ymaps.Placemark(coords, {}, {
                preset: 'islands#icon',
                iconColor: '#ff0000',
                iconOffset: [-10, -10]
            });
            myMap.geoObjects.add(cursorPlacemark);
        } else {
            cursorPlacemark.geometry.setCoordinates(coords);
        }
    }
    

    function removeCursorPlacemark() {
        if (cursorPlacemark) {
            myMap.geoObjects.remove(cursorPlacemark);
            cursorPlacemark = null;
        }
    }
}

function deleteCurrentPlacemark(myMap, coordinates) {
    myMap.geoObjects.each(function (geoObject) {
        if (geoObject instanceof ymaps.Placemark && geoObject.geometry.getCoordinates() == coordinates[0] + "," + coordinates[1]) {
            myMap.geoObjects.remove(geoObject);
        }
    });
}

function deleteAllPlacemarks(myMap, centerCoordinates) {
    var placemarks = [];
        myMap.geoObjects.each(function (geoObject) {
            // console.log(centerCoordinates[0] + "    " + centerCoordinates[1]);
            if (geoObject instanceof ymaps.Placemark && geoObject.geometry.getCoordinates() != centerCoordinates[0] + "," + centerCoordinates[1]) {
                // console.log(geoObject.geometry.getCoordinates() + "\n");
                // console.log(centerCoordinates[0] + "," + centerCoordinates[1]);
                placemarks.push(geoObject);
            }
        });
        placemarks.forEach(function (placemark) {
            myMap.geoObjects.remove(placemark);
        });
}

function putFirstPlaceMark(myMap, coords) {
    var placemark = new ymaps.Placemark(coords, {
        balloonContentHeader: "Начало маршрута",
    }, {
        preset: 'islands#redCircleIcon'
    });
    myMap.geoObjects.add(placemark);
}

function putRusaIcon(myMap, myPlacemark) {
    myPlacemark = new ymaps.Placemark(
        [55.703697, 36.192678],
        {
            balloonContent: 'Руза'
        },
        {
            iconLayout: 'default#image',
            iconImageHref: customIconImage,
            iconImageSize: [30, 30] // Размеры изображения
        }
    );

    myMap.geoObjects.add(myPlacemark);
}

function saveData(myMap, myPolyline, lineCoordinates, notes, length) {
    var lineName = document.getElementById('lineName').value;
    var description = document.getElementById('descriptionInput').value;
    var lineDifficulty = document.getElementById('lineDifficulty').value;
    var seasons = Array.from(document.querySelectorAll('input[name="season"]:checked')).map(function(el) { return el.value; });
    var previewPhoto = document.getElementById('previewPhoto').files[0];

    if (!lineName || !lineDifficulty || seasons.length === 0) {
        alert("Пожалуйста, заполните все обязательные поля.");
        return;
    }
    if (lineCoordinates.length < 2) {
        alert("Нельзя сохранить маршрут, состоящий менее, чем из 2 точек.");
        return;
    }
    if (lineCoordinates.length > 50) {
        alert("Нельзя сохранить маршрут, состоящий более, чем из 50 точек.");
        return;
    }
    if (length >= 100000) {
        alert("Нельзя сохранить маршрут длиной более, чем 100 км.");
        return;
    }
    if (description.length > 330) {
        alert("Описание не может превышать 330 символов.");
        return;
    }

    var formData = new FormData();
    formData.append('userId', userId);
    formData.append('name', lineName);
    formData.append('description', description);
    formData.append('coordinates', JSON.stringify(lineCoordinates));
    formData.append('seasons', JSON.stringify(seasons));
    formData.append('difficulty', lineDifficulty);
    formData.append('length', length.toFixed(2));
    formData.append('notes', JSON.stringify(notes));
    formData.append('previewPhoto', previewPhoto);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/save_coordinates/", true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            var routeId = response.routeId;
            window.location.href = "/route/" + routeId;
        } else {
            alert("Ошибка при сохранении маршрута. Попробуйте еще раз.");
        }
    };

    xhr.onerror = function () {
        alert("Произошла ошибка сети. Пожалуйста, проверьте подключение.");
    };

    xhr.send(formData);

    lineCoordinates.splice(0, lineCoordinates.length);
    length = 0;
    myPolyline.geometry.setCoordinates(lineCoordinates);
    document.getElementById('coordinates').innerText = "";
    deleteAllPlacemarks(myMap, centerCoordinates);
}
