$("button#filter_toggle").click(function (e) {
    $("div#filters").toggleClass("closed");
    $("button#filter_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});

$("button#menu_toggle").click(function (e) {
    $("nav ul").toggleClass("visible");
    $("nav button#menu_toggle .fa").toggleClass("fa-bars fa-times");
});

$("#geolocator").click(function (e) {
    if (!('geolocation' in navigator)) {
        alert("Your computer does not have the ability to use GeoLocation");
    }

    if (!window.isSecureContext) {
        alert("This feature cannot be used in a non-secure mode.");
        return;
    }

	e.currentTarget.setAttribute("disabled","1");
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
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=7Y1QmhU25CpvrabZ6trI', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
}).addTo(window.leafletMap);

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