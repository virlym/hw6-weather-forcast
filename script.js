/*
    search text field
    search button

    ajax call on weather api
    given city
    get date, time, temp, humidity, wind speed, uv index, weather icon
    city name : response.name
    temp : response.main.temp (convert from K), imperial mod = &units=imperial
    humidity : response.main.humidity
    wind speed : response.wind.speed
    uv index : nested inside previous call to get lat + long
    weather icon : response.weather[x].icon

    `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}
    3-hour segments`

    lat : response.coord.lat
    long : response.coord.lon

    `http://http://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${long}&appid=${apiKey}`
    
    
    parse date/times for 5-day
    convert time/temp

    populate cards

    clear cards

    store search history

    upon refresh, load last searched

    UV index color-coded for favorable, moderate, or severe
*/

function init(){

    $("#day0").children("h2").first().text("Covington");
    $("#day0").children("h2").last().text("(9/21)");
    $("#day0").children("img").attr("src", `http://openweathermap.org/img/wn/02n@2x.png`);

    $("#day1").children("p").first().text("testing");
    $("#day1").children("p").last().text("text2");
    for(var i = 1; i < 6; i++){
        $(`#day${i}`).children("img").attr("src", `http://openweathermap.org/img/wn/02n@2x.png`);
        $(`#day${i}`).children("h5").text(`9/2${i}`);
    }
}

init();