var centerCoordinates = [55.703697, 36.192678];
ymaps.ready(['AnimatedLine']).then(init);
function init(ymaps) {
    var LITTLE_RESTRICT_AREA = [
        [55.492003, 35.400976], 
        [56.009654, 36.830914]
    ];
    var LITTLE_ZOOM_RANGE = [9.5, 20];
    var myMap = new ymaps.Map('map', {
        center: [55.703697, 36.192678], // координаты центра карты
        zoom: 9.5, // уровень масштабирования
        controls: ['zoomControl'],
        behaviors: ['drag', 'scrollZoom'],
        // maxZoom: 15,
    }, {
        restrictMapArea: LITTLE_RESTRICT_AREA
    });
    myMap.options.set('minZoom', LITTLE_ZOOM_RANGE[0]);
    myMap.options.set('maxZoom', LITTLE_ZOOM_RANGE[1]);

    putRusaIcon(myMap);
    getRoute(myMap);
    // loadAllRoutes(myMap);
}

function putRusaIcon(myMap) {
    var myPlacemark = new ymaps.Placemark(
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


function getRoute(myMap) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_routes/", true);
    xhr.onload = function () {
        var data = JSON.parse(this.responseText);
        var routes = JSON.parse(data);
        console.log(routes);
        for (var i = 0; i < routes.length; i++) {
            if (routes[i].pk == routeId) {
                putRoute(myMap, routes[i].fields.coordinates    );
            }
        };
    };
    xhr.send();
}

function putPlaceMark(myMap, coords, text, iconPath) {
    var placemark = new ymaps.Placemark(coords, {
        balloonContentHeader: text,
    }, {
        preset: 'islands#redCircleIcon'
    });
    if (iconPath) {
        placemark.options.set('iconLayout', 'default#image');
        placemark.options.set('iconImageHref', iconPath);
        placemark.options.set('iconImageSize', [30, 42]);
        placemark.options.set('iconImageOffset', [-8, -40]);
    }
    myMap.geoObjects.add(placemark);
    
}

function deleteLineObjects(myMap) {
    for (var i = myMap.geoObjects.getLength() - 1; i >= 0; i--) {
        var geoObject = myMap.geoObjects.get(i);
        if (geoObject instanceof ymaps.Polyline) {
            myMap.geoObjects.remove(geoObject);
        }
    }
}

function putRoute(myMap, coordinates) {
    deleteLineObjects(myMap);
    var placemarks = [];
        myMap.geoObjects.each(function (geoObject) {
            if (geoObject instanceof ymaps.Placemark && geoObject.geometry.getCoordinates() != centerCoordinates[0] + "," + centerCoordinates[1]) {
                placemarks.push(geoObject);
            }
        });
        placemarks.forEach(function (placemark) {
            myMap.geoObjects.remove(placemark);
        });
        var lineCoordinates = JSON.parse(coordinates);

        var myPolyline = new ymaps.AnimatedLine(lineCoordinates, {}, {
            strokeColor: "#0000FF", // цвет линии
            strokeWidth: 4, // ширина линии
            strokeOpacity: 0.5, // прозрачность линии
            animationTime: 2000
        });
        myMap.geoObjects.add(myPolyline);
        myMap.setCenter(lineCoordinates[0], 12);
        putPlaceMark(myMap, lineCoordinates[0], "Начало маршрута", "");
        myPolyline.animate()
            .then(function() {
                return putPlaceMark(myMap, lineCoordinates[lineCoordinates.length - 1], "Конец маршрута", customFinishImage);
            });
}
