$("button#filter_toggle").click(function (e) {
    $("div#filters").toggleClass("closed");
    $("button#filter_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});

$("button#menu_toggle").click(function (e) {
    $("nav ul").toggleClass("visible");
    $("nav button#menu_toggle .fa").toggleClass("fa-bars fa-times");
});

$("#geolocator").click(function () {
    if (!('geolocation' in navigator)) {
        alert("Your computer does not have the ability to use GeoLocation");
    }

    if (!window.isSecureContext) {
        alert("This feature cannot be used in a non-secure mode.");
        return;
    }

    navigator.geolocation.getCurrentPosition(function (pos) {
    	// pos.coords.latitude, pos.coords.longitude
		// Call marker & panto here.
    }, function () {
        alert("Sorry, failed to retrieve data");
    }, {
        timeout: 1000,
        maximumAge: 0,
        enableHighAccuracy: true,
    });
});

$(document).ready(function () {
    // Could be in css only but unsure how much header/footer height is going to change.
    let totalPX = $("header").outerHeight() + $("footer").outerHeight();
    $("#map").css({minHeight: `calc(100vh - ${totalPX}px)`});
    // Initialize map here
});
