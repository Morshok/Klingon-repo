const bicycleIcon = L.icon({
    iconUrl: '/images/bicycleStation.png',
    iconSize: [40, 40],
});
const pumpIcon = L.icon({
    iconUrl: '/images/orangePump.png',
    iconSize: [30, 30],
});
const locationIcon = L.icon({
    iconUrl: '/images/locationDirection.png',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
});
const locationIconStanding = L.icon({
    iconUrl: '/images/locationStanding.png',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
});
const bicycleStandIcon = L.icon({
    iconUrl: '/images/parking.png',
    iconSize: [26, 26],
})
const noBikeIcon = L.icon({
    iconUrl: '/images/bicycleStationGray.png',
    iconSize: [32, 32],
});

$("button#weather-data-toggle").click(function () {
    $("div#weather-data").toggleClass("closed");
    $("button#weather-data-toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});

const seRelTime = new RelativeTime({locale: "sv"})
const bicycleStationGroup = L.layerGroup();
const pumpStationGroup = L.layerGroup();
const bicycleStandGroup = L.layerGroup();

const markerGroups = [
    {
        title: "Styr & Ställ",
        check: function () {
            return $("#bicycles").prop("checked");
        },
        apiPath: "/api/bicycleStations",
        template: function (bicycleStation, baseTemplate) {
            let timeDiff = seRelTime.from(Date.parse(bicycleStation.lastUpdated));
            return baseTemplate(bicycleStation.id, bicycleStation.address,
                `<p>${bicycleStation.company}</p>
                <p>Tillgängliga cyklar: <b>${bicycleStation.availableBikes}</b></p>
                <p>Uppdaterades: ${timeDiff}</p>`
            );
        },
        layer: bicycleStationGroup,
        icon: function (state) {
            if (state.availableBikes == 0) {
                return noBikeIcon;
            }
            return bicycleIcon;
        },
    }, 
    {
        title: "Pumpstationer",
        check: function () {
            return $("#pumps").prop("checked");
        },
        apiPath: "/api/pumpStations",
        template: function (pumpStation, baseTemplate) {
            return baseTemplate(pumpStation.id, pumpStation.address,
                `<p>Pumpstation</p>
                 <p>${pumpStation.comment}</p>`
            );
        },
        layer: pumpStationGroup,
        icon: pumpIcon,
    },
    {
        title: "Cykelställ",
        check: function () {
            return $("#parking").prop("checked");
        },
        apiPath: "/api/bicycleStands",
        template: function (station, baseTemplate) {
            return baseTemplate(station.id, station.address,
                `<p>Cykelställ</p>
                 <p>Antal platser: <b>${station.parkingSpaces}</b></p>`
            );
        },
        layer: bicycleStandGroup,
        icon: bicycleStandIcon,
    },
];



let allMarkers = {};
let userPosition = {
    marker: null,
    pos: null
}
let searchData = [];
let gpsEvenListenerId;

window.leafletMap = L.map('map', {zoomControl: false}).setView([57.706468214881355, 11.970101946662373], 13)
    .addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }))
    .addControl(L.control.zoom({position: 'bottomright'}));

function updateUserPosition(latitude, longitude) {
    userPosition.pos = {latitude: latitude, longitude: longitude};
    if (!userPosition.marker)
        userPosition.marker = L.marker([latitude, longitude], {icon: locationIcon})
            .bindPopup("Du är här")
            .addTo(window.leafletMap);
    else
        userPosition.marker.setLatLng([latitude, longitude]);
}

function checkZoom(){
    window.leafletMap.on('zoomend', function(){
        if(window.leafletMap.getZoom() < 14){
            window.leafletMap.removeLayer(bicycleStandGroup);
        }else{
            window.leafletMap.addLayer(bicycleStandGroup);
        }
    });
}
checkZoom();

function loadMarker() {
    let baseTemplate = function (id, title, content) {
        return `
            <div data-station-id="${id}" class="station-popups">
                <div class="title"><b>${title}</b></div>
                <hr>
                <div class="content">
                    ${content}
                </div>
                <div class="footer">
                    <button class="navigation-routing-point" data-type="startPoint">Börja här</button>
                    <button class="navigation-routing-point" data-type="endPoint">Sluta här</button>
                </div>
            <div>
        `
    }

    let buildMarkerGroup = function (markerGroup) {
        // Do not add the group to the map if a route is active
        if (!gpsEvenListenerId)
            markerGroup.layer.addTo(window.leafletMap);

        $.ajax(markerGroup.apiPath, {
            contentType: "application/json",
            dataType: "json",
            data: {city: $("#cities-dropdown").val() },
            complete: function (response) {
                if (response.status === 200) {
                    let data = response.responseJSON;
                    data.forEach(function (station) {
                        let icon = typeof markerGroup.icon === "function" ?
                            markerGroup.icon(station) : markerGroup.icon;

                        let marker = L.marker([station.latitude, station.longitude], icon ? {icon: icon} : {})
                            .bindPopup(function () {
                                return markerGroup.template(station, baseTemplate)
                            })
                            .addTo(markerGroup.layer);

                        station.groupTitle = markerGroup.title;
                        if (!allMarkers[markerGroup.apiPath]) allMarkers[markerGroup.apiPath] = [];
                        allMarkers[markerGroup.apiPath].push({marker: marker, data: station});
                    });
                    updateSearchResults();
                }

            },
        })
    }
    let calledApi = false, changedData = false;
    markerGroups.forEach(function (item) {
        if (item.check()) {
            if (!window.leafletMap.hasLayer(item.layer)) {
                calledApi = true;
                buildMarkerGroup(item);
            }

        } else {
            item.layer.clearLayers().remove();
            allMarkers[item.apiPath] = [];
            changedData = true
        }
    });


    if (calledApi !== changedData && !calledApi) {
        updateSearchResults()
    }
    if(window.leafletMap.getZoom() < 14){
        window.leafletMap.removeLayer(bicycleStandGroup);
    }
}

/** A function that disables,removes and unchecks
 * the markers depending on the city.
 *
 * @param currentCity - the city value i.e 2 is Malmö and 3 is Lund
 */
function checkboxHandler(currentCity) {
    //if statements that disables the markers and unchecks them depending on the city
    if (currentCity == 'Malmö') {
        document.getElementById('pumps').disabled = false;
        document.getElementById('parking').disabled = true;
        document.getElementById('parking').checked = false;
        document.getElementById('parking').style.color = "red";


    } else if (currentCity == 'Lund' || currentCity == 'Stockholm') {
        document.getElementById('parking').disabled = true;
        document.getElementById('parking').checked = false;
        document.getElementById('pumps').disabled = true;
        document.getElementById('pumps').checked = false;



    } else {
        document.getElementById('parking').disabled = false;
        document.getElementById('pumps').disabled = false;

    }
    //clears previous markers
    markerGroups.forEach(function (group) {
        group.layer.clearLayers().remove();
    });
    //sets out the new markers on the map
    loadMarker();
}

/**
 * a function that changes the city view and implements the checkbox functions
 */
function changeCity() {
    const city = document.getElementById("cities-dropdown").value;
    if (city == 'Malmö') {
        window.leafletMap.setView([55.59349148990642, 13.006630817073233], 13);
        checkboxHandler('Malmö');  //when a new city is choosen, the checkboxes should be unchecked
    } else if (city == 'Lund') {
        window.leafletMap.setView([55.708232229334506, 13.189239734535668], 14);
       checkboxHandler('Lund');
    } else if (city == 'Stockholm') {
        window.leafletMap.setView([59.3295521252874, 18.06861306062469], 13);
        checkboxHandler('Stockholm');
    } else {
        window.leafletMap.setView([57.706468214881355, 11.970101946662373], 13); //sets the view to Gothenburg
        checkboxHandler('Göteborg');
    }
}


let weatherApiRepeater;
let weatherObject = [];

function loadWeatherData(early) {
    clearTimeout(weatherApiRepeater);
    $.ajax("/api/weatherData",
        {
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                weatherObject = data;
                if ($("#weather-data").hasClass("loading")) {
                    let selectElement = $("select#location-dropdown");
                    weatherObject.forEach(function (item) {
                        let option = new Option(item.location, item.id, false, false);
                        selectElement.append(option);
                    })
                    selectElement.trigger("change");
                }
            },
            complete: function () {
                if (weatherObject.length > 0) {
                    $("#weather-data").removeClass("loading");
                } else if (!early) {
                    // if the weather object fails then re-schedule for earlier retrieval once
                    clearTimeout(weatherApiRepeater);
                    weatherApiRepeater = setTimeout(function () {
                        loadWeatherData(true)
                    }, 10 * 1000)
                }
            }
        })
    weatherApiRepeater = setTimeout(loadWeatherData, 60 * 1000);
}

$("select#location-dropdown").change(function () {
    let index = $("select#location-dropdown").val();
    console.log(weatherObject);
    if (index && weatherObject.length > index && weatherObject[index]) {
        let data = weatherObject[index];
        $("#weather-data > .content").html(`
            <img src="${data.iconUrl}"  crossorigin="anonymous" referrerpolicy="no-referrer">
            <p>Plats: ${data.location}</p>
            <p>Beskrivning: ${data.weatherDescription}</p>
            <p>Temperatur: ${data.temperature}&deg;C</p>
            <p>Vindhastighet: ${data.windSpeed}m/s&sup2;</p>
            <p>Vindriktning: ${data.windDegree}&deg;</p>
            <p>Moln: ${data.cloudPercentage}%</p>
        `);
    }
});

$(document).ready(function () {
    loadWeatherData();
    loadMarker();
    let changed = false;
    $(window).on("resize", function (evt) {
        if (window.innerWidth > 440) {
            $(".column-wrapper.left").append($("#level-panel"));
        } else {
            $(".column-wrapper.right").append($("#level-panel"));
        }
    }).trigger("resize");
});

$("#pumps, #bicycles, #parking").change(function () {
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

    let positionWatch = navigator.geolocation.watchPosition(function(position){
        let userRotation = position.coords.heading;

        if(userRotation === null || isNaN(userRotation)){
            userPosition.marker = userPosition.marker.setIcon(locationIconStanding);
            userPosition.marker = userPosition.marker.setRotationAngle(0);
        }else{
            userPosition.marker = userPosition.marker.setIcon(locationIcon);
            userPosition.marker = userPosition.marker.setRotationAngle(Math.floor(userRotation));
        }
    }, function(e){}, {
        enableHighAccuracy: true,
    });
}

$("#geolocator").click(function (e) {
    e.currentTarget.setAttribute("disabled", "1");

    if (gpsEvenListenerId) {
        window.leafletMap.setView([userPosition.pos.latitude, userPosition.pos.longitude], 16);
        e.currentTarget.removeAttribute("disabled")
    } else {
        getGeoLocation(function (pos) {
                window.leafletMap.setView([pos.coords.latitude, pos.coords.longitude], 16);
                e.currentTarget.removeAttribute("disabled")
            },
            function () {
                e.currentTarget.removeAttribute("disabled")
            }
        )
    }
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
                <label><i>${item.groupTitle}</i> - <b>${item.address}</b></label>
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
    $("main .navigation > .main-panel").show();
    window.leafletMap.closePopup();
})


function updateSearchResults() {
    console.log("Called updateSearchResults, ", Date.now());
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

L.Routing.OpenRouteService.prototype.old_routeDone = L.Routing.OpenRouteService.prototype._routeDone;
L.Routing.OpenRouteService.prototype._routeDone = function(datas, inputWaypoints, callback, context){
    let routes = this.options.format === 'geojson' ? datas.features : datas.routes;
    let routeTime = [];

    routes.forEach(function(route, indx){
        routeTime[indx] = route.summary.duration;
    });

    L.Routing.OpenRouteService.prototype.old_routeDone.call(this, datas, inputWaypoints, function(unused, alts){
        alts.forEach(function(routeAlt, indx){
            routeAlt.summary.totalTime = routeTime[indx];
        });
        callback.call(context, null, alts);
    }, context);
}

const router = L.routing.openrouteservice("5b3ce3597851110001cf6248d29230ce91e840789e9e3b73cf909b78", {
    "timeout": 30 * 1000,
    "format": "json",
    "host": "https://api.openrouteservice.org",
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
waypoints = [];

function addRoute(start, end, transportationMode) {
    router.options.profile = transportationMode;
    window.routeControl = L.Routing.control({
        router: router,
        defaultErrorHandler: false,
        waypoints: [
            L.latLng(start.latitude, start.longitude),
            L.latLng(end.latitude, end.longitude)
        ],
        draggableWaypoints: false,
        addWaypoints: false,
        lineOptions: {
            styles: [{color: 'black', opacity: 0.15, weight: 9}, {color: 'white', opacity: 0.8, weight: 6}, {color: 'blue', opacity: 1, weight: 2}]
        }
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
        gpsEvenListenerId = null;
    }

    if (!window.leafletMap.hasLayer(bicycleStationGroup))
        window.leafletMap.addLayer(bicycleStationGroup)

    if (!window.leafletMap.hasLayer(pumpStationGroup))
        window.leafletMap.addLayer(pumpStationGroup)

    $("main img#mobileRouteInfo").remove();
    $("main div#route_info").hide();
    $("main .navigation > .main-panel").removeClass("hasRoute");
    
    hasGivenUserExperience = false;
    window.clearInterval(checkRouteFinishedRepeater);
}

function onErrorHandler(event) {
    let dialogContent = {
        "title": "Ett fel har uppstått.",
        "text": "Var snäll och prova igen.<br><br>Felmeddelande: " + event.error.message
    }

    showDialog(dialogContent);
    removeRoute();
}

function onRouteFound(event) {
    $("#route_distance").text(formatDistanceFromMeters(event.routes[0].summary.totalDistance));
    $("#route_time").text(formatTimeFromSeconds(event.routes[0].summary.totalTime));
    $("#route_ascend").text((event.routes[0].summary.totalAscend === undefined) ? "0 m" : event.routes[0].summary.totalAscend + " m");
    $("#route_descend").text((event.routes[0].summary.totalDescend === undefined) ? "0 m" : event.routes[0].summary.totalDescend + " m");
    $("#route_emission").text(calculateEmissions(event.routes[0].summary.totalDistance));

    let routeButton = `
        <img src="./images/routeInfoButton.png" id="mobileRouteInfo"alt="route info"
            onclick="toggleDropDowns('route_info', 'mobileRouteInfo')">
        `;

    $("div#mobile-buttons").append(routeButton);

    $("main div#route_info").show();
}

function onRoutingStarted(event, start, end) {
    console.log(event);
    markerGroups.forEach(function (group) {
        window.leafletMap.removeLayer(group.layer);
    });

    if (!('geolocation' in navigator) || !window.isSecureContext) {
        console.log("Cannot use geolocation.");
    } else {
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
    }
    
    $("main .navigation > .main-panel").addClass("hasRoute");
    $("main .navigation > .main-panel #route-info-start").text(start.text);
    $("main .navigation > .main-panel #route-info-end").text(end.text);

    checkRouteFinishedRepeater = window.setInterval(checkRouteFinished(end), 1000);
}

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


var checkRouteFinishedRepeater;
const distanceThreshold = 25;
var hasGivenUserExperience = false;
function checkRouteFinished(endPoint)
{
    if(!hasGivenUserExperience)
    {
        navigator.geolocation.getCurrentPosition(function(pos) {
            var userLatitude = pos.coords.latitude;
            var userLongitude = pos.coords.longitude;
            var endPointLatitude = endPoint.latitude;
            var endPointLongitude = endPoint.longitude;
        
            //Code from https://www.movable-type.co.uk/scripts/latlong.html
            const R = 6371e3; // metres
            const φ1 = lat1 * Math.PI/180; // φ, λ in radians
            const φ2 = lat2 * Math.PI/180;
            const Δφ = (lat2-lat1) * Math.PI/180;
            const Δλ = (lon2-lon1) * Math.PI/180;

            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            const distanceFromEndPoint = R * c; // in metres
        
            if(distanceFromEndPoint <= distanceThreshold)
            {
                var savedEmission = calculateEmissions(event.routes[0].summary.totalDistance);
                var experience = Math.round(savedEmission/10);
                window.onFinishedRoute(experience).then(function() {
                    window.updateUserData();
                });
            
                hasGivenUserExperience = true;
            }
        });   
    }
}

/** Helper functions **/
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

function setUserTitle(level)
{
    fetch("./json/user_titles.json")
        .then(response => response.json())
        .then(data => {

            var title = "";
            if(level >= 0 && level < 100)
            {
                var index;
                for(var i = 0; data.length; i++)
                {
                    var obj = data[i];

                    if(level >= obj.levelRange.lowerBound && level <= obj.levelRange.upperBound)
                    {
                        index = i;
                        break;
                    }
                }

                title = data[index].title;
            }
            else if(level >= 100)
            {
                title = data[data.length - 1].title;
            }
            else 
            {
                title = "Failed to load";     
            }

            $(".title").text(title); 
    });
}

function updateUserData()
{
    window.getUserLevel().then(function(userLevel) {
        setUserTitle(userLevel);  
        
        window.getUserExperience().then(function(userExperience) {
            var requiredExperienceToNextLevel = window.requiredExperienceToNextLevel(userLevel);
            var currentExperience = userExperience;
            
            $(".text").text("Exp: " + currentExperience + "/" + requiredExperienceToNextLevel);
            $(".user-level").text("Lv. " + userLevel);
            updateProgressBarWidth();
        });
    });
}

function updateProgressBarWidth()
{
    window.getUserLevel().then(function(userLevel) {
        window.getUserExperience().then(function(userExperience) {
            var requiredExperienceToNextLevel = window.requiredExperienceToNextLevel(userLevel);
            var currentExperience = userExperience;
            
            var progressBarWidth = document.querySelector('.user-progress').clientWidth; //$(".user-progress").clientWidth;
            $(".user-exp").width((currentExperience/requiredExperienceToNextLevel) * progressBarWidth);
        }); 
    });
}

$(document).ready(function() {
    window.insertUser().then(() => updateUserData());
});

$(window).resize(function() {
    updateProgressBarWidth();
});

function toggleDropDowns(div, button){
    $("img#" + button).toggleClass("change");
    $("div#" + div).toggleClass("hidden");
}

function updateUserDataDisplayMode(mediaQuery)
{
    if(mediaQuery.matches)
    {
        console.log("Hide regular level panel, show menu level panel");
    }
    else 
    {
        console.log("Show regular level panel, hide menu level panel");
    }
}

var mediaQuery = window.matchMedia("(max-width: 600px)");
updateUserDataDisplayMode(mediaQuery);
mediaQuery.addListener(updateUserDataDisplayMode);
/** Helper functions **/