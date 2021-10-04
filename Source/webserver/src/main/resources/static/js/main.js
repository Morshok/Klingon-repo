$("button#filter_toggle").click(function () {
    $("div#filters").toggleClass("closed");
    $("button#filter_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});

$("button#weather-data-toggle").click(function()
{
    $("div#weather-data").toggleClass("closed");
    $("button#weather-data-toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});

$("button#menu_toggle").click(function () {
    $("nav ul").toggleClass("visible");
    $("nav button#menu_toggle .fa").toggleClass("fa-bars fa-times");
});

$(window, "location-dropdown-button").click(function() {
    $("#location-dropdown-menu").toggleClass("show");
});

window.leafletMap = L.map('map', {zoomControl: false}).setView([57.690072772287735, 11.974254546462964], 16)
    .addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }))
    .addControl(L.control.zoom( { position: 'bottomright' } ));

const seRelTime = new RelativeTime({locale: "sv"})
const bicycleStationGroup = L.layerGroup();
const pumpStationGroup = L.layerGroup();
const bicycleIcon = L.icon({
    iconUrl: '/images/cykelstation.png',
    iconSize:     [32, 32],
});

function loadMarker() {
    let bicycleTemplate = function (station) {
        let timeDiff = seRelTime.from(Date.parse(station.lastUpdated));
        return `
            <div data-stationId="${station.id}" clasS="station-popups bicycle">
                <div class="title"><b>${station.address}</b></div>
                <hr>
                <div class="content">
                    <p>Styr & Ställ</p>
                    <p>Tillgängliga cyklar: <b>${station.availableBikes}</b></p>
                    <p>Updaterades: ${timeDiff}</p>
                </div>
                <div class="footer">
                </div>
            <div>
        `
    }
    let pumpTemplate = function (station) {
        return `
            <div data-stationId="${station.id}" class="station-popups pump">
                <div class="title"><b>${station.address}</b></div>
                <hr>
                <div class="content">
                    <p>Pumpstation</p>
                    <p>${station.comment}</p>
                </div>
                <div class="footer">
                    <button>Start here</button>
                    <button>End here</button>
                </div>
            <div>
        `
    }

    let callApi = function (apiPath, markerTemplate, layerGroup, markerIcon = null) {
        if (!window.leafletMap.hasLayer(layerGroup)) {
            layerGroup.addTo(window.leafletMap);

            $.ajax(apiPath, {
                contentType: "application/json",
                dataType: "json",
                complete: function (response) {
                    if (response.status === 200) {
                        let data = response.responseJSON;
                        data.forEach(function (station) {
                            L.marker([station.latitude, station.longitude], markerIcon ? { icon: markerIcon} : {})
                                .bindPopup(function () {
                                    return markerTemplate(station)
                                })
                                .addTo(layerGroup);
                        });
                    }
                },
            })
        }
    }

    if ($("#bicycles").prop("checked")) {
        callApi("/api/bicycleStations", bicycleTemplate, bicycleStationGroup, bicycleIcon)
    }else{
        bicycleStationGroup.clearLayers().remove();
    }

    if ($("#pumps").prop("checked")) {
        callApi("/api/pumpStations", pumpTemplate, pumpStationGroup)
    }else{
        pumpStationGroup.clearLayers().remove();
    }
}
loadMarker();

var index = 1;
var repeater;
function loadWeatherData(f_index)
{
    if(f_index === undefined)
    {
        f_index = 1;
    }
    
    $.ajax("/api/weatherData",
    {
        contentType: "application/json",
        dataType: "json",
        complete: function(response)                
        {
                if(response.status === 200)
                {
                    let data = response.responseJSON;

                    $('#location').html('Plats: ' + data[f_index].location);
                    $('#description').html('Beskrivning: ' + data[f_index].weatherDescription);
                    $('#temperature').html('Temperatur: ' + data[f_index].temperature + '&deg;C');
                    $('#windSpeed').html('Vindhastighet: ' + data[f_index].windSpeed + 'm/s&sup2;');
                    $('#windDegree').html('Vindriktning: ' + data[f_index].windDegree + '&deg;');
                    $('#cloudsPercentage').html('Moln: ' + data[f_index].cloudPercentage + '%');
                }
        }
    })

    repeater = setTimeout(loadWeatherData, 60000);
}
$(document).ready(loadWeatherData(this.index));

function changeWeatherDataIndex(obj)
{
    this.index = obj.id;
    clearTimeout(repeater);
    loadWeatherData(index);
}

$("#pumps, #bicycles").change(function(){
    loadMarker();
});

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

$("button#navigation_button").click(function (e){
    addRoute(57.74, 11.94, 57.6792, 11.949);
});

window.leafletMap = L.map('map', { zoomControl: false}).setView([57.690072772287735, 11.974254546462964], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(window.leafletMap);

L.control.zoom({
    position:'bottomright'
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
function addRoute(startLatitude, startLongitude, endLatitude, endLongitude){
    if(window.routeControl != null){
        removeRoute();
    }

    window.routeControl = L.Routing.control({
        router: router,
        defaultErrorHandler: false,
        waypoints: [
            L.latLng(startLatitude, startLongitude),
            L.latLng(endLatitude, endLongitude)
        ]
    }).on('routingerror', function(e){
        onErrorHandler(e);
    }).addTo(window.leafletMap);
}

function removeRoute(){
    if(window.routeControl != null){
        window.leafletMap.removeControl(window.routeControl);
        window.routeControl = null;
    }
}

function onErrorHandler(event){
    console.log(event);
}
