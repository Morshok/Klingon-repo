const seRelTime = new RelativeTime({locale: "sv"})
const bicycleStationGroup = L.layerGroup();
const pumpStationGroup = L.layerGroup();
const bicycleIcon = L.icon({
    iconUrl: '/images/cykelstation.png',
    iconSize: [40, 40],
});
const pumpIcon = L.icon({
    iconUrl: '/images/pump.png',
    iconSize: [40, 40],
});
const locationIcon = L.icon({
    iconUrl: '/images/locationRed.png',
    iconSize: [25, 40],
});
let allMarkers = {};
let userPosition = {
    marker: null,
    pos: null
}
let searchData = [];
let gpsEvenListenerId;

window.leafletMap = L.map('map', {zoomControl: false}).setView([57.690072772287735, 11.974254546462964], 16)
    .addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }))
    .addControl(L.control.zoom({
        position: 'bottomright'
    }));

function updateUserPosition(latitude, longitude) {
    userPosition.pos = {latitude: latitude, longitude: longitude};
    if (!userPosition.marker)
        userPosition.marker = L.marker([latitude, longitude], {icon: locationIcon})
            .bindPopup("Du är här")
            .addTo(window.leafletMap);
    else
        userPosition.marker.setLatLng([latitude, longitude]);
}

function loadMarker() {
    let bicycleTemplate = function (bicycleStation) {
        let timeDiff = seRelTime.from(Date.parse(bicycleStation.lastUpdated));
        return `
            <div data-station-id="${bicycleStation.id}" class="station-popups bicycle">
                <div class="title"><b>${bicycleStation.address}</b></div>
                <hr>
                <div class="content">
                    <p>Styr & Ställ</p>
                    <p>Tillgängliga cyklar: <b>${bicycleStation.availableBikes}</b></p>
                    <p>Uppdaterades: ${timeDiff}</p>
                </div>
                <div class="footer">
                    <button class="navigation-routing-point" data-type="startPoint">Börja här</button>
                    <button class="navigation-routing-point" data-type="endPoint">Sluta här</button>
                </div>
            <div>
        `
    }
    let pumpTemplate = function (pumpStation) {
        return `
            <div data-station-id="${pumpStation.id}" class="station-popups pump">
                <div class="title"><b>${pumpStation.address}</b></div>
                <hr>
                <div class="content">
                    <p>Pumpstation</p>
                    <p>${pumpStation.comment}</p>
                </div>
                <div class="footer">
                    <button class="navigation-routing-point" data-type="startPoint">Börja här</button>
                    <button class="navigation-routing-point" data-type="endPoint">Sluta här</button>
                </div>
            <div>
        `
    }

    let buildMarkerGroup = function (apiPath, markerTemplate, layerGroup, markerIcon = null, fnDataCheck = null) {
        if (!window.leafletMap.hasLayer(layerGroup)) {
            // Do not add the group to the map if a route is active
            if(!gpsEvenListenerId)
                layerGroup.addTo(window.leafletMap);

            $.ajax(apiPath, {
                contentType: "application/json",
                dataType: "json",
                complete: function (response) {
                    if (response.status === 200) {
                        let data = response.responseJSON;
                        data.forEach(function (station) {
                            if (!fnDataCheck || fnDataCheck(station)) {
                                let marker = L.marker([station.latitude, station.longitude], markerIcon ? {icon: markerIcon} : {})
                                    .bindPopup(function () {
                                        return markerTemplate(station)
                                    })
                                    .addTo(layerGroup);

                                if (!allMarkers[apiPath]) allMarkers[apiPath] = [];
                                allMarkers[apiPath].push({marker: marker, data: station});
                                updateSearchResults();
                            }
                        });
                    }
                },
            })
        }
    }

    let changedData = false;
    if ($("#bicycles").prop("checked")) {
        buildMarkerGroup("/api/bicycleStations", bicycleTemplate, bicycleStationGroup, bicycleIcon, function (station) {
            return station.availableBikes > 0;
        });
    } else {
        bicycleStationGroup.clearLayers().remove();
        allMarkers["/api/bicycleStations"] = [];
        changedData = true;
    }

    if ($("#pumps").prop("checked")) {
        buildMarkerGroup("/api/pumpStations", pumpTemplate, pumpStationGroup, pumpIcon)
    } else {
        pumpStationGroup.clearLayers().remove();
        allMarkers["/api/pumpStations"] = [];
        changedData = true;
    }
    if (changedData) {
        updateSearchResults()
    }
}

loadMarker();

$("#pumps, #bicycles").change(function () {
    loadMarker();
});

$("button#filter_toggle").click(function () {
    $("div#filters").toggleClass("closed");
    $("button#filter_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});


$("button#menu_toggle").click(function () {
    $("nav ul").toggleClass("visible");
    $("nav button#menu_toggle .fa").toggleClass("fa-bars fa-times");
});

/**
 *
 * @param successFn Function is called if GPS succeeded
 * @param failFn Nullable.
 * @param args These arguments are passed to the success callback
 */
function getGeoLocation(successFn, failFn, ...args) {
    let hasSecondCallback = typeof failFn === "function";
    if (!('geolocation' in navigator)) {
        if (hasSecondCallback)
            failFn("Your computer does not have the ability to use GeoLocation");
        return;
    }

    if (!window.isSecureContext) {
        if (hasSecondCallback)
            failFn("This feature cannot be used in a non-secure mode.");
        return;
    }

    navigator.geolocation.getCurrentPosition(function (pos) {
        updateUserPosition(pos.coords.latitude, pos.coords.longitude);
        searchData.forEach(function (item) {
            item.distance = window.leafletMap.distance([item.latitude, item.longitude], [userPosition.pos.latitude, userPosition.pos.longitude]);
        });
        $(".navigation-select").children().each(function () {
            let item = findId(this.value, searchData);
            if (!item) return;
            this.dataset.distance = item.distance;
        })
        successFn.apply(null, [pos, ...args]);
    }, function (error) {
        if (hasSecondCallback)
            failFn(error.message);
    }, {
        timeout: 1000,
        maximumAge: 0,
        enableHighAccuracy: true,
    });
}

$("#geolocator").click(function (e) {
    e.currentTarget.setAttribute("disabled", "1");

    if (gpsEvenListenerId) {
        window.leafletMap.setView([userPosition.pos.latitude, userPosition.pos.longitude], 16);
        e.currentTarget.removeAttribute("disabled")
        return;
    }
    getGeoLocation(function (pos) {
            window.leafletMap.setView([pos.coords.latitude, pos.coords.longitude], 16);
            e.currentTarget.removeAttribute("disabled")
        },
        function () {
            e.currentTarget.removeAttribute("disabled")
        }
    )
});

$("button#navigation_button").click(function () {
    $("main .navigation > .main-panel").toggle();
});

$(".navigation-select").select2({
    width: "calc(100% - 10px)",
    templateResult: function (result) {
        let item = findId(result.id, searchData);
        if (!item) return result.text;

        let availableBikesStr = item.availableBikes ? `<p>Tillg. cyklar:&nbsp; <b>${item.availableBikes}</b></p>` : "";
        let distance = item.distance;
        let distanceStr = distance > 0 ? `<p>Avstånd:&nbsp; ${formatDistanceFromMeters(distance)}</p>` : "";

        return $(`
            <div class="select2-result-item">
                <label><b>${item.address}</b></label>
                <div class="panel">
                    ${availableBikesStr}
                    ${distanceStr}
                </div>
            </div>
        `);
    },
    sorter: function (data) {
        return data.sort(function (item, other) {
            return item.element.dataset.distance - other.element.dataset.distance;
        });
    }
});

$("main #map").on("click", ".navigation-routing-point", function () {
    let type = $(this).data("type");
    let stationId = $(this).parent().parent().data("station-id");
    if (type === "startPoint" && findId(stationId, searchData)) {
        $("#navigationStartpoint").val(stationId).trigger("change");
    } else if (type === "endPoint" && findId(stationId, searchData)) {
        $("#navigationEndpoint").val(stationId).trigger("change");
    } else {
        alert("Station could not be found");
    }
    window.leafletMap.closePopup();
})

function updateSearchResults() {
    let $navigationSelects = $(".navigation-select");
    $navigationSelects.prop("disabled", true);
    $navigationSelects.empty();
    searchData = [];

    $navigationSelects.append(new Option("Din plats", null, false, false));
    Object.keys(allMarkers).forEach(function (key) {
        allMarkers[key].forEach(function (station) {
            let data = station.data;
            data.__marker = station.marker;
            data.distance = userPosition.pos !== null ?
                window.leafletMap.distance([data.latitude, data.longitude], [userPosition.pos.latitude, userPosition.pos.longitude])
                : 0;
            let option = new Option(data.address, data.id, false, false);
            option.dataset.distance = data.distance;
            $navigationSelects.append(option);
            searchData.push(data);
        });
    });

    $navigationSelects.prop("disabled", false);
    $navigationSelects.trigger("change.select2");
}

$("#start_route").click(function () {
    let startValue = $("#navigationStartpoint").val();
    let endValue = $("#navigationEndpoint").val();

    removeRoute();
    if (startValue === "null" || endValue === "null") {
        getGeoLocation(startRoute, function (error) {
            console.log(error)
        }, startValue, endValue)
    } else {
        startRoute(null, startValue, endValue)
    }
});

$("#stop_route").click(function () {
    removeRoute();
});


function startRoute(gpsLocation, startValue, endValue) {
    let startPoint, endPoint;

    if (startValue === "null") {
        startPoint = {
            text: "Din plats",
            latitude: gpsLocation.coords.latitude,
            longitude: gpsLocation.coords.longitude
        };
    } else {
        let find = findId(startValue, searchData);
        if (!find) {
            alert("Startpunkten finns inte");
            return;
        }
        startPoint = {
            text: find.address,
            latitude: find.latitude,
            longitude: find.longitude
        }
    }

    if (endValue === "null") {
        endPoint = {
            text: "Din plats",
            latitude: gpsLocation.coords.latitude,
            longitude: gpsLocation.coords.longitude
        };
    } else {
        let find = findId(endValue, searchData);
        if (!find) {
            alert("Slutpunkten finns inte");
            return;
        }
        endPoint = {
            text: find.address,
            latitude: find.latitude,
            longitude: find.longitude
        }
    }

    let $mode = $("main .radio-wrapper input[name='transportationMode']:checked").val();
    addRoute(startPoint, endPoint, $mode);
}

const router = L.routing.openrouteservice("", {
    "timeout": 30 * 1000,
    "format": "json",
    "host": "./api/routing",
    "service": "directions",
    "api_version": "v2",
    "profile": "cycling-regular",
    "routingQueryParams": {
        "attributes": [
            "avgspeed",
            "percentage"
        ],
        "language": "en-us",
        "elevation": "true",
        "maneuvers": "true",
        "preference": "recommended",
    }
});

window.routeControl = null;

function addRoute(start, end, transportationMode) {
    router.options.profile = transportationMode;
    window.routeControl = L.Routing.control({
        router: router,
        defaultErrorHandler: false,
        waypoints: [
            L.latLng(start.latitude, start.longitude),
            L.latLng(end.latitude, end.longitude)
        ]
    }).on('routingerror', function (e) {
        onErrorHandler(e);
    }).on('routesfound', function (e) {
        onRouteFound(e);
    }).on('routingstart', function (e) {
        onRoutingStarted(e, start, end);
    }).addTo(window.leafletMap);
}

function removeRoute() {
    if (window.routeControl != null) {
        window.leafletMap.removeControl(window.routeControl);
        window.routeControl = null;
    }

    if (gpsEvenListenerId) {
        navigator.geolocation.clearWatch(gpsEvenListenerId);
    }

    if (!window.leafletMap.hasLayer(bicycleStationGroup))
        window.leafletMap.addLayer(bicycleStationGroup)

    if (!window.leafletMap.hasLayer(pumpStationGroup))
        window.leafletMap.addLayer(pumpStationGroup)

    $("main div#route_info").remove();
    $("main .navigation > .main-panel").removeClass("hasRoute");
}

function onErrorHandler(event) {
    console.log(event);
}

function onRouteFound(event) {
    let routeInfo = {
        "distance": formatDistanceFromMeters(event.routes[0].summary.totalDistance),
        "time": formatTimeFromSeconds(event.routes[0].summary.totalTime),
        "ascend": (event.routes[0].summary.totalAscend === undefined) ? "0 m" : event.routes[0].summary.totalAscend + " m",
        "descend": (event.routes[0].summary.totalDescend === undefined) ? "0 m" : event.routes[0].summary.totalDescend + " m",
        "savedEmission": calculateEmissions(event.routes[0].summary.totalDistance)
    }

    let routeInfoTemplate = function (routeInfo) {
        return `
            <div id="route_info">
                <div class="head">
                    <span>Route information</span>
                    <button id="route_info_toggle">
                        <i class="fa fa-angle-down"></i>
                    </button>
                </div>
                <div class="content">
                    <ul>
                        <li><span title="Avstånd"><i class="fa fa-route"></i>${routeInfo.distance}</span></li>
                        <li><span title="Tid"><i class="fa fa-stopwatch"></i>${routeInfo.time}</span></li>
                        <li><span title="Höjd ökning"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/></svg>${routeInfo.ascend}</span></li>
                        <li><span title="Höjd sänkning"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z"/></svg>${routeInfo.descend}</span></li>
                        <li><span title="Sparad CO2 mängd"><svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><rect fill="none" height="24" width="24"/><path d="M14,9h-3c-0.55,0-1,0.45-1,1v4c0,0.55,0.45,1,1,1h3c0.55,0,1-0.45,1-1v-4C15,9.45,14.55,9,14,9z M13.5,13.5h-2v-3h2V13.5z M8,13v1c0,0.55-0.45,1-1,1H4c-0.55,0-1-0.45-1-1v-4c0-0.55,0.45-1,1-1h3c0.55,0,1,0.45,1,1v1H6.5v-0.5h-2v3h2V13H8z M20.5,15.5h-2 v1h3V18H17v-2.5c0-0.55,0.45-1,1-1h2v-1h-3V12h3.5c0.55,0,1,0.45,1,1v1.5C21.5,15.05,21.05,15.5,20.5,15.5z"/></svg>${routeInfo.savedEmission}</span><i id="co2_info_toggle" class="info_icon fas fa-info-circle"></i></li>
                    </ul>
                </div>
            </div>
        `
    }

    let routeInfoElement = routeInfoTemplate(routeInfo);

    $("main").prepend(routeInfoElement);

    $("button#route_info_toggle").on("click", function () {
        $("div#route_info").toggleClass("closed");
        $("button#route_info_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
    });

    $("i#co2_info_toggle").on("click", function () {
        let dialogContent = {
            "title": "Beräkning av CO<sub>2</sub>",
            "text": "Sparade CO<sub>2</sub> utsläppen beräknas som distansen i km gånger 120g CO<sub>2</sub>/km. Beräkning tar inte hänsyn till cyklistens CO<sub>2</sub> utsläpp. 120g CO<sub>2</sub>/km siffran är baserade på data från Trafikverket för genomsnittlig CO<sub>2</sub>/km utsläpp för bilar drivna av fossila bränslen under 2019. 2020 datan användes inte på grund av drastisk ändrad användning av bilar under pandemin.<br><br>Se länk till datan på Om sidan."
        }

        showDialog(dialogContent);
    });
}

function onRoutingStarted(event, start, end) {
    if (!('geolocation' in navigator) || !window.isSecureContext) {
        console.log("Cannot use geolocation.");
        return;
    }

    window.leafletMap.removeLayer(bicycleStationGroup);
    window.leafletMap.removeLayer(pumpStationGroup);
    gpsEvenListenerId = navigator.geolocation.watchPosition(
        function (pos) {
            updateUserPosition(pos.coords.latitude, pos.coords.longitude);
        },
        function (error) {
            console.log(error);
        },
        options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 5000
        }
    );

    $("main .navigation > .main-panel").addClass("hasRoute");
    $("main .navigation > .main-panel #route-info-start").text(start.text)
    $("main .navigation > .main-panel #route-info-end").text(end.text)
}


function showDialog(dialogContent) {
    let dialogContentTemplate = function (dialogContent) {
        return `
            <div class="dialog">
                <div class="head">
                    <span>${dialogContent.title}</span>
                    <button class="dialog_close_button"><i class="fas fa-times"></i></button>
                </div>
                <div class="content">
                    ${dialogContent.text}
                </div>
                <div class="controls">
                    <button class="dialog_close_button">Okej</button>
                </div>
            </div>
        `
    }

    let dialogContentElement = $($.parseHTML(dialogContentTemplate(dialogContent)));
    dialogContentElement.find(".dialog_close_button").each(function (index, element) {
        $(element).on("click", function () {
            $("div.dialog").remove();
        });
    });

    $("body").append(dialogContentElement);
}

/** Helper functions **/
function formatTimeFromSeconds(totSeconds, template) {
    let hours = Math.floor(totSeconds / 60 / 60);
    let minutes = Math.ceil((totSeconds / 60) % 60);

    if (template === undefined) {
        template = "";

        if (hours > 0) {
            template += hours + " h ";
        }

        template += minutes + " min";
    } else {
        template.replace("%h", hours);
        template.replace("%min", minutes);
    }

    return template;
}

function formatDistanceFromMeters(totMeters, template) {
    let kilometers = Math.floor(totMeters / 1000);
    let meters = Math.floor(totMeters % 1000);

    if (template === undefined) {
        template = "";

        if (kilometers > 0) {
            template += kilometers + " km ";
        }

        template += meters + " m";
    } else {
        template = template.replace("%km", kilometers);
        template = template.replace("%m", meters);
    }

    return template;
}

function calculateEmissions(distance) {
    return (Math.round((distance / 1000) * 120)) + " g";
}

function findId(id, array) {
    return array.find(function (el) {
        return parseInt(id) === el.id
    })
}

/** Helper functions **/