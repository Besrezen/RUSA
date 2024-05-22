ymaps.ready(init);

function init() {
    var LITTLE_RESTRICT_AREA = [
        [55.492003, 35.400976], 
        [56.009654, 36.830914]
    ];
    var centerCoordinates = [55.703697, 36.192678];
    var notes;

    var myMap = new ymaps.Map('constructor', {
        center: centerCoordinates, // координаты центра карты
        zoom: 9.5, // уровень масштабирования
        controls: ['zoomControl'],
        behaviors: ['drag'],
        maxZoom: 15,
    }, {
        restrictMapArea: LITTLE_RESTRICT_AREA
    });  
    var myPlacemark;  
    var lineCoordinates = [];
    var length = 0;

    putRusaIcon(myMap, myPlacemark);

    var myPolyline = new ymaps.Polyline([], {}, {
        strokeColor: "#0000FF", // цвет линии
        strokeWidth: 4, // ширина линии
        strokeOpacity: 0.5 // прозрачность линии
    });
    myMap.geoObjects.add(myPolyline);

    myMap.events.add('click', function (e) {
        var coords = e.get('coords');
        length = 0;
        lineCoordinates.push(coords);
        for (var i = 0; i < lineCoordinates.length - 1; i++) {
            length += ymaps.coordSystem.geo.getDistance(lineCoordinates[i], lineCoordinates[i + 1]);
        }
        document.getElementById('coordinates').innerText = "Длина маршрута: " + length.toFixed(2) + " м";
        myPolyline.geometry.setCoordinates(lineCoordinates);
        putPlaceMark(myPolyline, myMap, coords);
        myPolyline.editor.startEditing();
    });

    document.getElementById('deleteButton').addEventListener('click', function () {
        lineCoordinates = [];
        length = 0;
        document.getElementById('coordinates').innerText = "Длина маршрута: " + length.toFixed(2) + " м";
        myPolyline.geometry.setCoordinates(lineCoordinates);
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
    });
    
    document.getElementById('backButton').addEventListener('click', function () {
        lineCoordinates.pop();
        length = 0;
        for (var i = 0; i < lineCoordinates.length - 1; i++) {
            length += ymaps.coordSystem.geo.getDistance(lineCoordinates[i], lineCoordinates[i + 1]);
        }
        document.getElementById('coordinates').innerText = "Длина маршрута: " + length.toFixed(2) + " м";
        myPolyline.geometry.setCoordinates(lineCoordinates);
    });
    
    document.getElementById('saveLineButton').addEventListener('click', function () {
        saveLine(myPolyline, lineCoordinates);
    });
}


function putPlaceMark(myPolyline, myMap, coords) {
    var placemark = new ymaps.Placemark(coords, {
        balloonContentHeader: "Комментарий к точке",
        balloonContentBody: "<textarea id='comment' rows='4' cols='50'></textarea><br><button id='saveComment'>Сохранить комментарий</button>",
        balloonContentFooter: "Координаты: " + coords
    }, {
        preset: 'islands#blueCircleIcon'
    });
    myMap.geoObjects.add(placemark);
    
    // // Добавляем обработчик события dragend
    // placemark.events.add('dragend', function () {
        //     var newCoords = placemark.geometry.getCoordinates();
        //     // Обновляем координаты в массиве lineCoordinates
        //     var index = lineCoordinates.findIndex(function (coord) {
            //         return coord[0] === coords[0] && coord[1] === coords[1];
            //     });
            //     if (index !== -1) {
                //         lineCoordinates[index] = newCoords;
                //     }
                //     // Обновляем координаты линии
                //     myPolyline.geometry.setCoordinates(lineCoordinates);
                //     // Обновляем длину маршрута
                //     length = 0;
                //     for (var i = 0; i < lineCoordinates.length - 1; i++) {
                    //         length += ymaps.coordSystem.geo.getDistance(lineCoordinates[i], lineCoordinates[i + 1]);
                    //     }
                    //     document.getElementById('coordinates').innerText = "Длина маршрута: " + length.toFixed(2) + " м";
                    // });
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

function saveLine(myPolyline, lineCoordinates) {
    var lineName = document.getElementById('lineName').value;
        var lineDifficulty = document.getElementById('lineDifficulty').value;
        var seasons = Array.from(document.querySelectorAll('input[name="season"]:checked')).map(function(el) { return el.value; });
        var lineData = {
            name: lineName,
            coordinates: lineCoordinates,
            seasons: seasons,
            difficulty: lineDifficulty,
            length: length.toFixed(2)
        };
        var lineCoordinatesJSON = JSON.stringify(lineData, null, 2);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/save_coordinates/", true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(lineCoordinatesJSON);
        lineCoordinates = [];
        length = 0;  
        myPolyline.geometry.setCoordinates(lineCoordinates);
}