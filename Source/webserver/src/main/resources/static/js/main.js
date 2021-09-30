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
const bicycleStandGroup = L.layerGroup();

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
const bicycleStandIcon = L.icon({
    iconUrl: '/images/parking.png',
    iconSize:   [26, 26],
})
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

        let bicycleStandTemplate = function (station) {
            return `
                <div data-stationId="${station.id}" class="station-popups bicycle stand">
                    <div class="title"><b>${station.address}</b></div>
                    <hr>
                    <div class="content">
                        <p>Cykelställ</p>
                        <p>Antal platser: <b>${station.parkingSpaces}</b></p>
                    </div>
                    <div class="footer">
                        <button>Start here </button>
                        <button> End Here </button>
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
                        if (type == 3) {
                            data.forEach(function (bicycleStand) {
                                L.marker([bicycleStand.latitude, bicycleStand.longitude], markerIcon ? {icon: markerIcon} : {})
                                    .bindPopup(function () {
                                        return markerTemplate(bicycleStand)
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
        window.leafletMap.on('zoomend', function() {

            if (window.leafletMap.getZoom() < 16){
                    bicycleStandGroup.clearLayers().remove();
            }
            else {
                    callApi("/api/bicycleStands", bicycleStandTemplate, bicycleStandGroup, bicycleStandIcon, 3)
                }
        });
    }else{
        bicycleStationGroup.clearLayers().remove();
        bicycleStandGroup.clearLayers().remove();
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
        "elevation": "true",
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
    }).on('routesfound', function(e){
        onRouteFound(e);
    }).on('routingstart', function(e){
        onRoutingStarted(e);
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

function onRouteFound(event){
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

    $("button#route_info_toggle").on("click", function(e){
        $("div#route_info").toggleClass("closed");
        $("button#route_info_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
    });

    $("i#co2_info_toggle").on("click", function(e){
        let dialogContent = {
            "title": "Beräkning av CO<sub>2</sub>",
            "text": "Sparade CO<sub>2</sub> utsläppen beräknas som distansen i km gånger 120g CO<sub>2</sub>/km. Beräkning tar inte hänsyn till cyklistens CO<sub>2</sub> utsläpp. 120g CO<sub>2</sub>/km siffran är baserade på data från Trafikverket för genomsnittlig CO<sub>2</sub>/km utsläpp för bilar drivna av fossila bränslen under 2019. 2020 datan användes inte på grund av drastisk ändrad användning av bilar under pandemin.<br><br>Se länk till datan på Om sidan."
        }

        showDialog(dialogContent);
    });
}

function onRoutingStarted(event){
    $("main div#route_info").remove();
}

function formatTimeFromSeconds(totSeconds, template){
    let hours = Math.floor(totSeconds / 60 / 60);
    let minutes = Math.ceil((totSeconds / 60) % 60);

    if(template === undefined){
        template = "";

        if(hours > 0){
            template += hours + " h ";
        }

        template += minutes + " m";
    }else{
         template.replace("%h", hours);
         template.replace("%m", minutes);
    }

    return template;
}

function formatDistanceFromMeters(totMeters, template){
    let kilometers = Math.floor(totMeters / 1000);
    let meters = Math.floor(totMeters % 1000);

    if(template === undefined){
        template = "";

        if(kilometers > 0){
            template += kilometers + " km ";
        }

        template += meters + " m";
    }else{
        template = template.replace("%km", kilometers);
        template = template.replace("%m", meters);
    }

    return template;
}

function calculateEmissions(distance){
    return (Math.round((distance / 1000) * 120)) + " g";
}

function showDialog(dialogContent){
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
    dialogContentElement.find(".dialog_close_button").each(function(index, element){
        $(element).on("click", function(event){
            $("div.dialog").remove();
        });
    });

    $("body").append(dialogContentElement);
}