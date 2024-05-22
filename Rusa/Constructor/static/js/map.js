ymaps.ready(['AnimatedLine']).then(init);

function init(ymaps) {
    var LITTLE_RESTRICT_AREA = [
        [55.492003, 35.400976], 
        [56.009654, 36.830914]
    ];
    var LITTLE_ZOOM_RANGE = [9.5, 15];

    var myMap = new ymaps.Map('map', {
        center: [55.703697, 36.192678], // координаты центра карты
        zoom: 9.5, // уровень масштабирования
        controls: ['zoomControl'],
        behaviors: ['drag'],
        maxZoom: 15,
        animationTime: 4000,
    }, {
        restrictMapArea: LITTLE_RESTRICT_AREA
    });
    myMap.options.set('minZoom', LITTLE_ZOOM_RANGE[0]);
    myMap.options.set('maxZoom', LITTLE_ZOOM_RANGE[1]);

    putRusaIcon(myMap);
    loadAllRoutes(myMap);
}

function loadAllRoutes(myMap) {
var xhr = new XMLHttpRequest();
xhr.open("GET", "/get_routes/", true);
xhr.onload = function () {
var data = JSON.parse(this.responseText);
var routesContainer = document.getElementById('routesContainer');
var routes = JSON.parse(data);
var updates = [];
for (var i = 0; i < routes.length; i++) {
    var routeButton = document.createElement('button');
    routeButton.textContent = routes[i].fields.name;
    var currentRoute = routes[i]; // создаем локальную копию текущего маршрута
    // Проверяем, равна ли длина NULL
    // if (routes[i].fields.length == null) {
    //     console.log(routes[i].fields.name + ' ' + routes[i].pk.toFixed());
    //     // Вычисляем длину маршрута
    //     var length = 0;
    //     var coordinates = JSON.parse(routes[i].fields.coordinates);
    //     for (var j = 0; j < coordinates.length - 1; j++) {
    //         length += ymaps.coordSystem.geo.getDistance(coordinates[j], coordinates[j + 1]);
    //     }

    //     var lineData = {
    //         id: routes[i].pk,
    //         length: length
    //     };
    //     updates.push(lineData);
    // }
    (function(route) {
        routeButton.addEventListener('click', function () {
            getRoute(myMap, route.fields.coordinates);
        });
    })(routes[i]);
    routesContainer.appendChild(routeButton);
}
// var updatesJSON = JSON.stringify(updates, null, 2);
// var updateXhr = new XMLHttpRequest();
// updateXhr.open("POST", "/update_route_lengths/", true);
// updateXhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
// updateXhr.send(updatesJSON);
};
xhr.send();
}


function updateLength() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_routes/", true);
    xhr.onload = function () {
    var data = JSON.parse(this.responseText);
    var routesContainer = document.getElementById('routesContainer');
    var routes = JSON.parse(data);
    for (var i = 0; i < routes.length; i++) {
        var routeButton = document.createElement('button');
        routeButton.textContent = routes[i].fields.name;
        var currentRoute = routes[i]; // создаем локальную копию текущего маршрута
        // Проверяем, равна ли длина NULL
        if (routes[i].fields.length == null) {
            console.log(routes[i].fields.name + routes[i].pk.toFixed(2));
            // Вычисляем длину маршрута
            var length = 0;
            var coordinates = JSON.parse(routes[i].fields.coordinates);
            for (var j = 0; j < coordinates.length - 1; j++) {
                length += ymaps.coordSystem.geo.getDistance(coordinates[j], coordinates[j + 1]);
            }

            var lineData = {
                id: routes[i].pk,
                length: length.toFixed(2)
            };
            var lineCoordinatesJSON = JSON.stringify(lineData, null, 2);
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/update_route_length/", true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            xhr.send(lineCoordinatesJSON);
        }
        (function(route) {
            routeButton.addEventListener('click', function () {
                getRoute(myMap, route.fields.coordinates);
            });
        })(routes[i]);
        routesContainer.appendChild(routeButton);

    }
    };
    xhr.send();
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


function getRoute(myMap, coordinates) {
    deleteLineObjects(myMap);
    var lineCoordinates = JSON.parse(coordinates);
    var myPolyline = new ymaps.AnimatedLine(lineCoordinates, {}, {
        strokeColor: "#0000FF", // цвет линии
        strokeWidth: 4, // ширина линии
        strokeOpacity: 0.5, // прозрачность линии
        animationTime: 4000
    });
    myMap.geoObjects.add(myPolyline);
    myMap.setCenter(lineCoordinates[0], 10);
    myPolyline.animate()
}

function deleteLineObjects(myMap) {
    for (var i = myMap.geoObjects.getLength() - 1; i >= 0; i--) {
        var geoObject = myMap.geoObjects.get(i);
        if (geoObject instanceof ymaps.Polyline) {
            myMap.geoObjects.remove(geoObject);
        }
    }
}
