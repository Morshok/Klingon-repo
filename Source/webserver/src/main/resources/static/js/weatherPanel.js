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
                    $("select#cities-dropdown").trigger("change");
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

$(document).ready(function () {
    loadWeatherData();
});

$("select#cities-dropdown").change(function (){
    let city = $("select#cities-dropdown option:selected").text();
    let zone;
    weatherObject.forEach(function (data){
        if(city === data.location){
            zone = data.zone;
        }
    });

    weatherObject.forEach(function (data){
        let dropdown = document.getElementById("location-dropdown");
        for(let i = 0; i < dropdown.options.length; i++){
            if(dropdown.options[i].text === data.location){
                if(data.zone === zone){
                    if(dropdown.options[i].text === city){
                        dropdown.options[i].selected = "selected";
                    }
                    dropdown.options[i].style.display = "block";
                }else{
                    dropdown.options[i].style.display = "none";
                }
                break;
            }
        }
   });
});

$("select#location-dropdown").change(function () {
    let city = $("select#location-dropdown option:selected").text();
    weatherObject.forEach(function (data){
        if(city === data.location){
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
    })

});

$("button#weather-data-toggle").click(function () {
    $("div#weather-data").toggleClass("closed");
    $("button#weather-data-toggle i.fa").toggleClass("fa-angle-down fa-angle-up");
});