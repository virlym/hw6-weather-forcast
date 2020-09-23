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

var apiKey = "dada94c0136618837ce84cf6e665b103";
var searchHistory = [];
var city = "";
var addToList = true;

function init(){
    searchHistory = getSavedHistory();
    if(searchHistory.length  === 0){
        city = "Seattle";
    }
    else{
        var index = searchHistory.length - 1;
        city = searchHistory[index];
        searchHistory.pop();
    }
    populateWeather();
}

function clearHistory(){
    localStorage.clear();
    searchHistory = [];
}

function getSavedHistory(){
    if(JSON.parse(localStorage.getItem("history"))){
        if((JSON.parse(localStorage.getItem("history")).length !== 0)){
            return(JSON.parse(localStorage.getItem("history")));
        }
    }
    return ([]);
}

function storeHistory(){
    if(searchHistory === []){
        return;
    }
    var storage = JSON.stringify(searchHistory);
    localStorage.setItem("history", storage);
}

function populateWeather(){
    $.ajax({
        url: `http://api.openweathermap.org/data/2.5/weather?q=${city.replace(/\s+/g,"+")}&units=imperial&appid=${apiKey}`,
        method: "GET"
    }).then(function(response){
        var currentWeather = response;
        var lat = currentWeather.coord.lat;
        var long = currentWeather.coord.lon;
        searchHistory.push(city);
        updateSearchHistory();
        storeHistory();

        $.ajax({
            url: `http://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${long}&appid=${apiKey}`,
            method: "GET"
        }).then(function(response){
            var uv = response[0].value;
            $("#day0").children("h2").first().text(currentWeather.name);
            $("#day0").children("h2").last().text(moment().format('l'));
            $("#day0").children("img").attr("src", `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`);
            $("#currentTemp").text(`Temperature : ${currentWeather.main.temp} F`);
            $("#currentHumid").text(`Humidity : ${currentWeather.main.humidity}`);
            $("#currentWind").text(`Wind Speed : ${currentWeather.wind.speed}`);
            $("#currentUv").text(`${uv}`);
            $("#currentUv").attr("class", setUvClass(uv));
        });
    });

    $.ajax({
        url: `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`,
        method: "GET"
    }).then(function(response){
        var forecast = response.list;
        var dayCount = 7;
        for(var i = 1; i < 6; i++){
            $(`#day${i}`).children("h5").text(moment().add(i, 'day').format('l'));
            $(`#day${i}`).children("img").attr("src", `http://openweathermap.org/img/wn/${forecast[dayCount].weather[0].icon}@2x.png`);
            $(`#day${i}`).children("p").first().text(`Temp : ${forecast[dayCount].main.temp} F`);
            $(`#day${i}`).children("p").last().text(`Humidity : ${forecast[dayCount].main.humidity}`);
            dayCount += 8;
            if(dayCount > 40){
                dayCount = 40;
            }
        }
    });

}

function setUvClass(index){
 //UV index color-coded for favorable, moderate, or severe
    if(index <= 2){
        return ("uv-favorable");
    }
    if((index > 2) && (index < 6)){
        return ("uv-moderate");
    }
    if((index >= 6) && (index < 8)){
        return ("uv-high");
    }
    if((index >= 8) && (index < 11)){
        return ("uv-very-high");
    }
    if(index >= 11){
        return ("uv-severe");
    }
}

function searchClicked(event){
    event.preventDefault();
    var newCity = $("#cityToSearch").val().trim();
    city = newCity;
    $("input:text").val("");
    populateWeather();

}

function searchText(event){
    console.log(event);
    var index = 0;
    var newCity = event.path[0].childNodes[0].data
    for(var i = 0; i < searchHistory.length; i++){
        if(event.path[1].childNodes[i].outerText === newCity){
            index = i;
        }
    }
    for(var i = index; i < searchHistory.length-1; i++){
        var tempCity = searchHistory[i];
        searchHistory[i] = searchHistory[i+1];
        searchHistory[i+1] = tempCity;
    }
    searchHistory.pop();
    city = newCity;
    $("input:text").val("");
    populateWeather();

}

function updateSearchHistory(){
    $("#searchHistory").empty();
    for(var i = 0; i < searchHistory.length; i++){
        var newDiv = $("<div>");
        newDiv.attr("class", "searchedCities");
        newDiv.text(searchHistory[i]);
        $("#searchHistory").append(newDiv);
    }
}

$("#searchCity").on("click", function() { searchClicked(event); });
$(document).on("click", ".searchedCities", function() { searchText(event); });

init();