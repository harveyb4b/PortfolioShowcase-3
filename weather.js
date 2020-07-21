$(document).ready(function () {
  // Set global variables
  var city = "";

  var cityStorage = JSON.parse(localStorage.getItem("cityStorage"));
  if (cityStorage === null) {
    cityStorage = [];
  } else {
    searchHistory();
    callAPI(cityStorage[cityStorage.length - 1]);
  }

  function outputDate(x) {
    // Function to retrieve date + amount of days in future
    var targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + x);
    var month = targetDate.getMonth() + 1;
    var day = targetDate.getDate();
    var year = targetDate.getFullYear();
    return month + "/" + day + "/" + year;
  }

  function callAPI(x) {
    // Call weather API using my API Key
    city = x;
    var apiKey = "fbd8829c258104f450803523a10d525d";

    var query =
      "https://api.openweathermap.org/data/2.5/forecast/?units=imperial&cnt=6&q=" +
      city +
      "&appid=" +
      apiKey;

    console.log(query);
    $.ajax({
      url: query,
      method: "GET",
    }).then(function (response) {
      $("#city").text(city);
      // Empty current forecast output
      $("#forecast-output").empty();
      for (var i = 0; i < response.list.length; i++) {
        if (i === 0) {
          // Set current date using outputDate function
          $("#date").text(outputDate(i));

          // Output current weather
          $("#temperature").text(parseInt(response.list[i].main.temp));
          $("#humidity").text(response.list[i].main.humidity);
          $("#wind-speed").text(response.list[i].wind.speed);

          // Get weather icon
          var weatherimg =
            "https://openweathermap.org/img/wn/" +
            response.list[i].weather[0].icon +
            "@2x.png";
          $("#weather-icon").attr("src", weatherimg);

          // switching API for UV
          var uvQuery =
            "https://api.openweathermap.org/data/2.5/uvi?appid=" +
            apiKey +
            "&lat=" +
            response.city.coord.lat +
            "&lon=" +
            response.city.coord.lon;
          getUV(uvQuery);
        } else {
          // Output date, temperature and humidity to future weather
          var newDiv = $("<div>").addClass("forecast");

          // Date
          var dateObj = $("<div>").text(outputDate(i));
          newDiv.append(dateObj);

          // Image
          var weatherIcon = $("<img>").attr(
            "src",
            "https://openweathermap.org/img/wn/" +
              response.list[i].weather[0].icon +
              "@2x.png"
          );
          newDiv.append(weatherIcon);

          // Temperature
          var temp = $("<div>").text(
            "Temp: " + parseInt(response.list[i].main.temp)
          );
          newDiv.append(temp);

          // Humidity
          var humidity = $("<div>").text(
            "Humidity: " + response.list[i].main.humidity
          );
          newDiv.append(humidity);

          $("#forecast-output").append(newDiv);
        }
      }
    });
  }

  function getUV(x) {
    $.ajax({
      url: x,
      method: "GET",
    }).then(function (response) {
      var uv = response.value;
      console.log(uv);
      var bgColor = "";
      if (uv < 3) {
        bgColor = "#52CAFF";
      } else if (uv > 3 && uv < 5) {
        bgColor = "#2EFF63";
      } else if (uv > 5 && uv < 8) {
        bgColor = "#FF7400";
      } else if (uv > 8 && uv < 10) {
        bgColor = "#FF0000";
      } else {
        bgColor = "#FF00F3";
      }
      $("#uv-index").css("background-color", bgColor);
      $("#uv-index").text(uv);
    });
  }

  function setStorage() {
    localStorage.setItem("cityStorage", JSON.stringify(cityStorage));
  }

  function searchHistory() {
    $("#city-output").empty();
    if (cityStorage.length > 3) {
      cityStorage.shift();
    }
    for (var i = 0; i < cityStorage.length; i++) {
      var cityDiv = $("<div>");
      cityDiv.text(cityStorage[i]);
      cityDiv.addClass("city-list");
      if (i === cityStorage.length - 1) {
        cityDiv.addClass("bold-font");
      }
      $("#city-output").prepend(cityDiv);
    }
  }

  $(document).on("click", ".city-list", function () {
    $(".city-list").removeClass("bold-font");
    $(this).addClass("bold-font");
    callAPI($(this).html());
  });

  $("#search-button").on("click", function () {
    city = $("#search-box").val();
    cityStorage.push(city);
    setStorage();
    searchHistory();
    callAPI(city);
  });

  $("#clear-search").on("click", function (e) {
    localStorage.clear();
    location.reload();
  });
});
