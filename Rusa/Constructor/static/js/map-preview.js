var centerCoordinates = [55.703697, 36.192678];
ymaps.ready(['AnimatedLine']).then(init);
function init(ymaps) {
    for (var i = 0; i < routeIdList.length; i++) {
        var myMap = new ymaps.Map('map-preview-' + routeIdList[i], {
            center: [55.703697, 36.192678],
            zoom: 9.5,
            controls: [],
            behaviors: []
            // type: 'yandex#satellite'
        });
        // console.log('map-preview-' + routeIdList[i]);
        getRoute(myMap, routeIdList[i]);
        myMap.events.add('click', function (e) {
            e.preventDefault();
        });
        myMap.events.add('dblclick', function (e) {
            e.preventDefault();
        });
        myMap.events.add('contextmenu', function (e) {
            e.preventDefault();
        });
    }
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


function getRoute(myMap, id) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_routes/", true);
    xhr.onload = function () {
        var data = JSON.parse(this.responseText);
        var routes = JSON.parse(data);
        // console.log(routes);
        for (var i = 0; i < routes.length; i++) {
            if (routes[i].pk == id) {
                putRoute(myMap, routes[i].fields.coordinates, routes[i].fields.notes);
                if(routes[i].pk == 12) console.log("here", routes[i].fields.coordinates)
            }
        };
    };
    xhr.send();
}

function putPlaceMark(myMap, coords, text, iconPath, preset) {
    var presets_dict = {
        "startEnd": "islands#redCircleIcon",
        "simpleMark": "islands#icon"
    }
    var placemark = new ymaps.Placemark(coords, {
        balloonContentHeader: text,
    }, {
        preset: presets_dict[preset],
        hasBalloon: false,
        hasHint: false
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

function putRoute(myMap, coordinates, notes) {
    var notes_modified_list = JSON.parse(notes.replace(/'/g, '"'));
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
            strokeColor: "#FF0000",
            strokeWidth: 4,
            strokeOpacity: 0.5,
            animationTime: 2000
        });
        myMap.geoObjects.add(myPolyline);
        myMap.setBounds(myPolyline.geometry.getBounds(), {
            checkZoomRange: true
        });
        myMap.container.fitToViewport();
        putPlaceMark(myMap, lineCoordinates[0], "Начало маршрута", "", "startEnd");
        for (var i = 0; i < notes_modified_list.length; i++) {
            putPlaceMark(myMap, notes_modified_list[i][0], notes_modified_list[i][1], "", "simpleMark");
        }
        putPlaceMark(myMap, lineCoordinates[lineCoordinates.length - 1], "Конец маршрута", customFinishImage, "simpleMark");
        myMap.geoObjects.add(polyline);

}
