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
    loadAllRoutes(myMap);
}

function loadAllRoutes(myMap) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_routes/", true);
    xhr.onload = function () {
    var data = JSON.parse(this.responseText);
    var routesContainer = document.getElementById('routesContainer');
    var routes = JSON.parse(data);
    for (var i = 0; i < routes.length; i++) {
        var routeButton = document.createElement('button');
        routeButton.textContent = routes[i].fields.name;
        (function(route) {
            routeButton.addEventListener('click', function () {
                getRoute(myMap, route.fields.coordinates, route.fields.difficulty, route.fields.length, route.fields.name, route.fields.notes, route.fields.seasons, route.pk);
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

function loadRouteData() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_routes/", true);
    xhr.onload = function () {
    var data = JSON.parse(this.responseText);
    // var routesContainer = document.getElementById('routesContainer');
    var routes = JSON.parse(data);
    console.log(routes);
    };
    xhr.send();
}


function getRoute(myMap, coordinates, difficulty, length, name, notes, seasons, id) {
    var existingRectangle = document.getElementById("rectangleDiv");
    if (existingRectangle) {
        existingRectangle.parentNode.removeChild(existingRectangle);
    }
    deleteLineObjects(myMap);
    //deleteAllPlacemarks
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
        animationTime: 500
    });
    myMap.geoObjects.add(myPolyline);
    myMap.setCenter(lineCoordinates[0], 12);
    putPlaceMark(myMap, lineCoordinates[0], "Начало маршрута");
    myPolyline.animate()
        .then(function() {
            return putPlaceMark(myMap, lineCoordinates[lineCoordinates.length - 1], "Конец маршрута");
        })
        .then(function() {
            var rectangle = document.createElement("div");
            rectangle.id = "rectangleDiv";
            rectangle.style.position = "absolute";
            rectangle.style.top = "0";
            rectangle.style.left = "0";
            rectangle.style.width = "100vh";
            rectangle.style.height = "50px"; // Высота прямоугольника - 100px
            rectangle.style.backgroundColor = "black";
            rectangle.style.zIndex = 1;
            rectangle.style.display = "flex";
            rectangle.style.flexDirection = "row";
            rectangle.style.opacity = 0.5;
            rectangle.style.marginLeft = "15vh";
            rectangle.style.marginTop = 0;
            rectangle.style.justifyContent = "center";
            rectangle.style.alignItems = "center";
            var labels = ["Сложность", "Длина", "Название", "Сезон"];
            var data = [difficulty, length, name, seasons];
            labels.forEach(function(label, index) {
                var text = document.createElement("p");
                text.textContent = label + ":\n" + data[index];
                text.style.color = "#fff";
                text.style.marginLeft = "20px";
                text.style.marginTop = "20px";
                rectangle.appendChild(text);
                index += 1;
            });
            var container = document.getElementById("map"); // Замените "yourDivId" на id вашего div
            container.insertBefore(rectangle, container.firstChild);
            console.log("ID road: ->" + id + "|||");
            loadRouteData();
        });
        // .then(function() {
        //     var placemarkNotes = JSON.parse(notes);
        //     placemarkNotes.forEach(function(note, index) {
        //         putPlaceMark(myMap, note);

        //     });
        // });
}

function putPlaceMark(myMap, coords, text) {
    var placemark = new ymaps.Placemark(coords, {
        balloonContentHeader: text,
    }, {
        preset: 'islands#redCircleIcon'
    });
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
