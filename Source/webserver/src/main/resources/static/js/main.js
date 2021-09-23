$("button#filter_toggle").click(function () {
    $("div#filters").toggleClass("closed");
    $("button#filter_toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});


$("button#menu_toggle").click(function () {
    $("nav ul").toggleClass("visible");
    $("nav button#menu_toggle .fa").toggleClass("fa-bars fa-times");
});

window.leafletMap = L.map('map', {zoomControl: false}).setView([57.690072772287735, 11.974254546462964], 16)
    .addLayer(L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=7Y1QmhU25CpvrabZ6trI', {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    }))
    .addControl(L.control.zoom({
        position: 'bottomright'
    }));

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