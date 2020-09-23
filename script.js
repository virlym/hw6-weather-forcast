var apiKey = "dada94c0136618837ce84cf6e665b103";
var searchHistory = [];
var city = "";

// initialize the page information
function init(){
    // get the stored search history
    searchHistory = getSavedHistory();
    // if there are no stored searches, set the current city to Seattle
    if(searchHistory.length  === 0){
        city = "Seattle";
    }
    // if there are searches
    else{
        var index = searchHistory.length - 1;
        // set the current city to the last searched city
        city = searchHistory[index];
        // remove it from the list, as it will populate later
        searchHistory.pop();
    }
    // run the search and populate the weather information
    populateWeather();
}

// check if the search history is greater than 10
function checkHistoryLength(){
    // if it is greater than 10, remove the oldest searches until there are only 10 left
    if(searchHistory.length > 10){
        for(var i = 10; i < searchHistory.length; i++){
            searchHistory.shift();
        }
    }
}

// get the stored search history from localStorage
function getSavedHistory(){
    if(JSON.parse(localStorage.getItem("history"))){
        if((JSON.parse(localStorage.getItem("history")).length !== 0)){
            return(JSON.parse(localStorage.getItem("history")));
        }
    }
    return ([]);
}

// store the current history into localStorage
function storeHistory(){
    // if there is no current history, no need to do anything
    if(searchHistory === []){
        return;
    }
    var storage = JSON.stringify(searchHistory);
    localStorage.setItem("history", storage);
}

// populate the page with the weather information
function populateWeather(){
    // ajax request for the current weather, swapping out any spaces in the city name with "+"
    $.ajax({
        url: `http://api.openweathermap.org/data/2.5/weather?q=${city.replace(/\s+/g,"+")}&units=imperial&appid=${apiKey}`,
        method: "GET"
    }).then(function(response){
        // if the request was successful, set the current weather to the returned information
        var currentWeather = response;
        // also set the latitude and longitude
        var lat = currentWeather.coord.lat;
        var long = currentWeather.coord.lon;
        // once the city has been verified, add it to the search history
        searchHistory.push(city);
        // check the history length to make sure we're under 11 cities
        checkHistoryLength();
        // update the searches on the left of the screen
        updateSearchHistory();
        // store the current searches in localStorage
        storeHistory();

        // make another ajax call to get the UV Index using the latitude and longitude from the first call
        $.ajax({
            url: `http://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${long}&appid=${apiKey}`,
            method: "GET"
        }).then(function(response){
            // populate the current weather section with the returned data
            var uv = response[0].value;
            $("#day0").children("h2").first().text(currentWeather.name);
            // set the current date in the 'mm/dd/yyy' format, removing any leading 0s
            $("#day0").children("h2").last().text(moment().format('l'));
            $("#day0").children("img").attr("src", `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`);
            $("#day0").children("img").attr("alt", `weather icon`);
            $("#currentTemp").text(`Temperature : ${currentWeather.main.temp} F`);
            $("#currentHumid").text(`Humidity : ${currentWeather.main.humidity}`);
            $("#currentWind").text(`Wind Speed : ${currentWeather.wind.speed}`);
            $("#currentUv").text(`${uv}`);
            $("#currentUv").attr("class", setUvClass(uv));
        });
    });

    // make a separate ajax call for the 5-day forecast
    $.ajax({
        url: `http://api.openweathermap.org/data/2.5/forecast?q=${city.replace(/\s+/g,"+")}&units=imperial&appid=${apiKey}`,
        method: "GET"
    }).then(function(response){
        var forecast = response.list;
        // the forecast returns information in 3-hour segments, so we set the first segment to be 21 hours from now
        var timeCount = 7;
        for(var i = 1; i < 6; i++){
            // populate the cards
            $(`#day${i}`).children("h5").text(moment().add(i, 'day').format('l'));
            $(`#day${i}`).children("img").attr("src", `http://openweathermap.org/img/wn/${forecast[timeCount].weather[0].icon}@2x.png`);
            $(`#day${i}`).children("img").attr("alt", `weather icon`);
            $(`#day${i}`).children("p").first().text(`Temp : ${forecast[timeCount].main.temp} F`);
            $(`#day${i}`).children("p").last().text(`Humidity : ${forecast[timeCount].main.humidity}`);
            // increase the segment to 24-hours later
            timeCount += 8;
            // just a catch in case something bubbles over
            if(timeCount > 40){
                timeCount = 40;
            }
        }
    });

}

// set the UV Index class so the background is color-coded
function setUvClass(index){
 //UV index color-coded for favorable, moderate, or severe
    if(index <= 2){
        // sets the background to green
        return ("uv-favorable");
    }
    if((index > 2) && (index < 6)){
        // sets the background to yellow
        return ("uv-moderate");
    }
    if((index >= 6) && (index < 8)){
        // sets the background to orange
        return ("uv-high");
    }
    if((index >= 8) && (index < 11)){
        // sets the background to red
        return ("uv-very-high");
    }
    if(index >= 11){
        // sets the background to purple
        return ("uv-severe");
    }
}

// search event for the text field
function searchClicked(event){
    // it is a form, so prevent the page from refreshing
    event.preventDefault();
    // create a new city from the user input, trimming empty space
    var newCity = $("#cityToSearch").val().trim();
    // set the current city to the one from the user
    city = newCity;
    // clear the input field
    $("input:text").val("");
    // populate the weather information
    populateWeather();
    // if the city was a valid entry, it will be added to the history in the population

}

// search event for the history
function searchText(event){
    var index = 0;
    // gets the name of the clicked city
    var newCity = event.path[0].childNodes[0].data
    // gets the index of the clicked city in the history array
    for(var i = 0; i < searchHistory.length; i++){
        if(event.path[1].childNodes[i].outerText === newCity){
            index = i;
        }
    }
    // moves all later entries back in the history and adds the selected one to the end
    for(var i = index; i < searchHistory.length-1; i++){
        var tempCity = searchHistory[i];
        searchHistory[i] = searchHistory[i+1];
        searchHistory[i+1] = tempCity;
    }
    // remove the selected city, it will be added in the population
    searchHistory.pop();
    // set the current city to the selected one
    city = newCity;
    // clear the input field for good measure
    $("input:text").val("");
    // populate the weather information
    populateWeather();

}

// update the search history on the left of the screen
function updateSearchHistory(){
    // clear the current displayed history
    $("#searchHistory").empty();
    // add each city in the stored history
    for(var i = 0; i < searchHistory.length; i++){
        var newDiv = $("<div>");
        newDiv.attr("class", "searchedCities");
        newDiv.text(searchHistory[i]);
        $("#searchHistory").append(newDiv);
    }
}

// create an event listener for the text field
$("#searchCity").on("click", function() { searchClicked(event); });
// create an event listener for the search history
$(document).on("click", ".searchedCities", function() { searchText(event); });

// initialize the page
init();