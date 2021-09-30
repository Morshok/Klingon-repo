$("button#filter_toggle").click(function () {
    $("div#filters").toggleClass("closed");
    $("button#filter_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});


$("button#menu_toggle").click(function () {
    $("nav ul").toggleClass("visible");
    $("nav button#menu_toggle .fa").toggleClass("fa-bars fa-times");
});
window.leafletMap = L.map('map', {zoomControl: false}).setView([57.690072772287735, 11.974254546462964], 16)
    .addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }))
    .addControl(L.control.zoom({
        position: 'bottomright'
    }));

const seRelTime = new RelativeTime({locale: "sv"})
const bicycleStationGroup = L.layerGroup();
const pumpStationGroup = L.layerGroup();
let locationMarker = {};

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
const noBikeIcon = L.icon({
    iconUrl: '/images/noBike.png',
    iconSize: [40, 40],
});

function loadMarker() {
    let bicycleTemplate = function (bicycleStation) {
        let timeDiff = seRelTime.from(Date.parse(bicycleStation.lastUpdated));
        return `
            <div data-stationId="${bicycleStation.id}" class="station-popups bicycle">
                <div class="title"><b>${bicycleStation.address}</b></div>
                <hr>
                <div class="content">
                    <p>Styr & Ställ</p>
                    <p>Tillgängliga cyklar: <b>${bicycleStation.availableBikes}</b></p>
                    <p>Uppdaterades: ${timeDiff}</p>
                </div>
                <div class="footer">
                </div>
            <div>
        `
    }
    let pumpTemplate = function (pumpStation) {
        return `
            <div data-stationId="${pumpStation.id}" class="station-popups pump">
                <div class="title"><b>${pumpStation.address}</b></div>
                <hr>
                <div class="content">
                    <p>Pumpstation</p>
                    <p>${pumpStation.comment}</p>
                </div>
                <div class="footer">
                    <button>Start here</button>
                    <button>End here</button>
                </div>
            <div>
        `
    }

    let callApi = function (apiPath, markerTemplate, layerGroup, markerIcon = null, type) {
        if (!window.leafletMap.hasLayer(layerGroup)) {
            layerGroup.addTo(window.leafletMap);

            $.ajax(apiPath, {
                contentType: "application/json",
                dataType: "json",
                complete: function (response) {
                    if (response.status === 200) {
                        let data = response.responseJSON;
                        if (type == 1) {
                            data.forEach(function (bicycleStation) {
                                if (bicycleStation.availableBikes  == 0) {
                                    L.marker([bicycleStation.latitude, bicycleStation.longitude], markerIcon ? {icon: noBikeIcon} : {})
                                        .bindPopup(function () {
                                            return markerTemplate(bicycleStation)
                                        })
                                        .addTo(layerGroup);
                                }else{
                                    L.marker([bicycleStation.latitude, bicycleStation.longitude], markerIcon ? {icon: markerIcon} : {})
                                        .bindPopup(function () {
                                            return markerTemplate(bicycleStation)
                                        })
                                        .addTo(layerGroup);
                                }
                            });
                        }
                        if (type == 2) {
                            data.forEach(function (pumpStation) {
                                L.marker([pumpStation.latitude, pumpStation.longitude], markerIcon ? {icon: markerIcon} : {})
                                    .bindPopup(function () {
                                        return markerTemplate(pumpStation)
                                    })
                                    .addTo(layerGroup);
                            });
                        }

                    }
                },
            })
        }
    }

    if ($("#bicycles").prop("checked")) {
        callApi("/api/bicycleStations", bicycleTemplate, bicycleStationGroup, bicycleIcon, 1)
    } else {
        bicycleStationGroup.clearLayers().remove();
    }

    if ($("#pumps").prop("checked")) {
        callApi("/api/pumpStations", pumpTemplate, pumpStationGroup, pumpIcon, 2)
    } else {
        pumpStationGroup.clearLayers().remove();
    }
}

loadMarker();

$("#pumps, #bicycles").change(function () {
    loadMarker();
});


let markerIsPlaced = false;
$("#geolocator").click(function (e) {
    if (!('geolocation' in navigator)) {
        alert("Your computer does not have the ability to use GeoLocation");
    }

    if (!window.isSecureContext) {
        alert("This feature cannot be used in a non-secure mode.");
        return;
    }

    e.currentTarget.setAttribute("disabled", "1");
    navigator.geolocation.getCurrentPosition(function (pos) {
        // pos.coords.latitude, pos.coords.longitude
        window.leafletMap.setView([pos.coords.latitude, pos.coords.longitude], 15);

        if (markerIsPlaced == false) {
            locationMarker = L.marker([pos.coords.latitude, pos.coords.longitude], {icon: locationIcon}).addTo(window.leafletMap);
            markerIsPlaced=true;
        } else {
            locationMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
        }


        e.currentTarget.removeAttribute("disabled")
    }, function () {
        alert("Sorry, failed to retrieve your location");
        e.currentTarget.removeAttribute("disabled")
    }, {
        timeout: 1000,
        maximumAge: 0,
        enableHighAccuracy: true,
    });
});

$("button#navigation_button").click(function (e) {
    addRoute(57.74, 11.94, 57.6792, 11.949);
});


window.leafletMap = L.map('map', {zoomControl: false}).setView([57.690072772287735, 11.974254546462964], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(window.leafletMap);

L.control.zoom({
    position: 'bottomright'

}).addTo(window.leafletMap);

var marker = L.marker([57.690072772287735, 11.974254546462964]).addTo(window.leafletMap);
marker.bindPopup("<b>Chalmers Johanneberg</b><br>Campus").openPopup();

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
        "maneuvers": "true",
        "preference": "recommended",
    }
});

window.routeControl = null;

function addRoute(startLatitude, startLongitude, endLatitude, endLongitude) {
    if (window.routeControl != null) {
        removeRoute();
    }

    window.routeControl = L.Routing.control({
        router: router,
        defaultErrorHandler: false,
        waypoints: [
            L.latLng(startLatitude, startLongitude),
            L.latLng(endLatitude, endLongitude)
        ]
    }).on('routingerror', function (e) {
        onErrorHandler(e);
    }).addTo(window.leafletMap);
}

function removeRoute() {
    if (window.routeControl != null) {
        window.leafletMap.removeControl(window.routeControl);
        window.routeControl = null;
    }
}

function onErrorHandler(event) {
    console.log(event);
}
