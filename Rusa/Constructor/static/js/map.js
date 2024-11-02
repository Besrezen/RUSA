var centerCoordinates = [55.703697, 36.192678];
ymaps.ready(['AnimatedLine']).then(init);
function init(ymaps) {
    var myMap = new ymaps.Map('map', {
        center: [55.703697, 36.192678],
        zoom: 9.5,
        controls: ['zoomControl'],
        behaviors: ['drag', 'scrollZoom'],
    }
    );

    putRusaIcon(myMap);
    loadAllRoutes(myMap);
}

function loadAllRoutes(myMap) {
    var clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: ymaps.templateLayoutFactory.createClass(
            '<div style="max-height: 200px; overflow-y: auto;">' +  // Ограничение высоты и прокрутка
                '{% for geoObject in properties.geoObjects %}' +
                    '<a href="/route/{{ geoObject.properties.routeId }}">{{ geoObject.properties.routeName }}</a><br>' +
                '{% endfor %}' +
            '</div>'
        ),
    });
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/get_routes/", true);
    xhr.onload = function () {
        var data = JSON.parse(this.responseText);
        var routes = JSON.parse(data);
        for (var i = 0; i < routes.length; i++) {
            if (routes[i].fields.coordinates != "[]") {
                var startCoordinates = JSON.parse(routes[i].fields.coordinates)[0];
                var placemark = new ymaps.Placemark(startCoordinates, {
                    routeId: routes[i].pk,
                    routeName: routes[i].fields.name
                });
                clusterer.add(placemark);
            }
        }
        myMap.geoObjects.add(clusterer);
        myMap.setBounds(myMap.geoObjects.getBounds(), { checkZoomRange: true, zoomMargin: 20 });
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


function getRoute(myMap, coordinates, difficulty, length, name, notes, seasons, id) {
    console.log(notes);
    console.log(typeof(notes));
    var notes_modified_list = JSON.parse(notes.replace(/'/g, '"'));
    console.log(notes_modified_list);
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
        animationTime: 2000
    });
    myMap.geoObjects.add(myPolyline);
    // myMap.setCenter(lineCoordinates[0], 12);
    myMap.setBounds(myPolyline.geometry.getBounds(), {
        checkZoomRange: true
    });
    putPlaceMark(myMap, lineCoordinates[0], "Начало маршрута", "startEnd");
    myPolyline.animate()
        .then(function() {
            for (var i = 0; i < notes_modified_list.length; i++) {
                putPlaceMark(myMap, notes_modified_list[i][0], notes_modified_list[i][1], "simpleMark");
                console.log(notes_modified_list[i]);
            }
            putPlaceMark(myMap, lineCoordinates[lineCoordinates.length - 1], "Конец маршрута", "startEnd");
        })
        .then(function() {
            var rectangle = document.createElement("div");
            rectangle.id = "rectangleDiv";
            rectangle.style.position = "absolute";
            rectangle.style.top = "0";
            rectangle.style.left = "0";
            rectangle.style.width = "100vh";
            rectangle.style.height = "50px";
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
            var container = document.getElementById("map");
            container.insertBefore(rectangle, container.firstChild);
            console.log("ID road: -> " + id);
        })
        .then(function() {
            var placemarkNotes = JSON.parse(notes);
            console.log(placemarkNotes);
            placemarkNotes.forEach(function(note) {
                console.log(note);
                putPlaceMark(myMap, note[0], note[1]);
            });
        });
}

function putPlaceMark(myMap, coords, text, preset) {
    var presets_dict = {
        "startEnd": "islands#redCircleIcon",
        "simpleMark": "islands#icon"
    }
    var placemark = new ymaps.Placemark(coords, {
        balloonContentHeader: text,
    }, {
        preset: presets_dict[preset]
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
