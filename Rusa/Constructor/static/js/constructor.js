ymaps.ready(init);

function init() {
    var LITTLE_RESTRICT_AREA = [
        [55.492003, 35.400976], 
        [56.009654, 36.830914]
    ];
    var LITTLE_ZOOM_RANGE = [9.5, 20];
    var centerCoordinates = [55.703697, 36.192678];
    var addingPlacemark = false;
    var notes;

    var myMap = new ymaps.Map('constructor', {
        center: centerCoordinates, // координаты центра карты
        zoom: 9.5, // уровень масштабирования
        controls: ['zoomControl'],
        behaviors: ['drag', 'scrollZoom'],
        type: 'yandex#map',
    }, {
        yandexMapDisablePoiInteractivity: true,
    }, {
        restrictMapArea: LITTLE_RESTRICT_AREA,
    });
    myMap.options.set('minZoom', LITTLE_ZOOM_RANGE[0]);
    myMap.options.set('maxZoom', LITTLE_ZOOM_RANGE[1]);
    
    
    var myPlacemark;  
    var lineCoordinates = [];
    var length = 0;

    putRusaIcon(myMap, myPlacemark);

    var myPolyline = new ymaps.Polyline([], {}, {
        strokeColor: "#0000FF", // цвет линии
        strokeWidth: 4, // ширина линии
        strokeOpacity: 0.5, // прозрачность линии
        strokeStyle: "dash"
    });
    myMap.geoObjects.add(myPolyline);

    myMap.events.add('click', function (e) {
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
        lineCoordinates.pop();
        length = 0;
        for (var i = 0; i < lineCoordinates.length - 1; i++) {
            length += ymaps.coordSystem.geo.getDistance(lineCoordinates[i], lineCoordinates[i + 1]);
        }
        length != 0 ? (document.getElementById('coordinates').innerText = "Длина маршрута: " + length.toFixed(2) + " м") : (document.getElementById('coordinates').innerText = "");
        console.log(length != 0);
        // document.getElementById('coordinates').innerText = "Длина маршрута: " + length.toFixed(2) + " м";
        myPolyline.geometry.setCoordinates(lineCoordinates);
    });
    
    document.getElementById('saveLineButton').addEventListener('click', function () {
        console.log(notes);
        saveData(myPolyline, lineCoordinates, notes);
    });
    document.getElementById('addPlacemarkButton').addEventListener('click', function () {
        addingPlacemark = true;
        myMap.events.add('click', onMapClick);
        alert('Кликните на карте, чтобы добавить метку');
    });

    function onMapClick(e) {
        var coords = e.get('coords');
        var comment = prompt('Введите комментарий для метки:');

        if (comment !== null && comment.trim() !== "") {
            var placemark = new ymaps.Placemark(coords, {
                balloonContent: comment
            }, {
                preset: 'islands#icon',
                iconColor: '#0095b6'
            });
            notes.push(comment);
            myMap.geoObjects.add(placemark);
            myMap.events.remove('click', onMapClick);
            addingPlacemark = false;
        }
    }
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

function saveData(myPolyline, lineCoordinates, notes) {
    var lineName = document.getElementById('lineName').value;
        var lineDifficulty = document.getElementById('lineDifficulty').value;
        var seasons = Array.from(document.querySelectorAll('input[name="season"]:checked')).map(function(el) { return el.value; });
        var lineData = {
            name: lineName,
            coordinates: lineCoordinates,
            seasons: seasons,
            difficulty: lineDifficulty,
            length: length.toFixed(2),
            notes: notes
        };
        var lineCoordinatesJSON = JSON.stringify(lineData, null, 2);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/save_coordinates/", true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(lineCoordinatesJSON);
        lineCoordinates = [];
        length = 0;  
        myPolyline.geometry.setCoordinates(lineCoordinates);
        deleteAllPlacemarks(myMap, centerCoordinates);
}