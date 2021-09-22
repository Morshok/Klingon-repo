$("button#filter_toggle").click(function (e) {
    $("div#filters").toggleClass("closed");
    $("button#filter_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});
const bicycleStations = document.querySelector('#bicycles');
bicycleStations.addEventListener('change',function (e){
    alert("There are no bikes");

});
const pumpStations = document.querySelector('#pumps');
pumpStations.addEventListener('change',function (e){
    alert("There are no pumps");
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

window.leafletMap = L.map('map', { zoomControl: false}).setView([57.690072772287735, 11.974254546462964], 16);
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=7Y1QmhU25CpvrabZ6trI', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
}).addTo(window.leafletMap);
L.control.zoom({
	position:'bottomright'
}).addTo(window.leafletMap);
var marker = L.marker([57.690072772287735, 11.974254546462964]).addTo(window.leafletMap);
marker.bindPopup("<b>Chalmers Johanneberg</b><br>Campus").openPopup();

