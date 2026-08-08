// Map WMO weather codes to descriptions and Font Awesome icons
const weatherCodeMap = {
  0: { description: "Clear sky", icon: "fa-sun", color: "#fbc531" },
  1: { description: "Mainly clear", icon: "fa-sun", color: "#fbc531" },
  2: { description: "Partly cloudy", icon: "fa-cloud-sun", color: "#f5f6fa" },
  3: { description: "Overcast", icon: "fa-cloud", color: "#dcdde1" },
  45: { description: "Fog", icon: "fa-smog", color: "#a4b0be" },
  48: { description: "Depositing rime fog", icon: "fa-smog", color: "#a4b0be" },
  51: { description: "Light drizzle", icon: "fa-cloud-rain", color: "#70a1ff" },
  53: {
    description: "Moderate drizzle",
    icon: "fa-cloud-rain",
    color: "#70a1ff",
  },
  55: { description: "Dense drizzle", icon: "fa-cloud-rain", color: "#70a1ff" },
  56: {
    description: "Freezing drizzle",
    icon: "fa-cloud-rain",
    color: "#70a1ff",
  },
  57: {
    description: "Dense freezing drizzle",
    icon: "fa-cloud-rain",
    color: "#70a1ff",
  },
  61: {
    description: "Light rain",
    icon: "fa-cloud-showers-heavy",
    color: "#70a1ff",
  },
  63: {
    description: "Moderate rain",
    icon: "fa-cloud-showers-heavy",
    color: "#70a1ff",
  },
  65: {
    description: "Heavy rain",
    icon: "fa-cloud-showers-heavy",
    color: "#487eb0",
  },
  66: {
    description: "Freezing rain",
    icon: "fa-cloud-showers-heavy",
    color: "#487eb0",
  },
  67: {
    description: "Heavy freezing rain",
    icon: "fa-cloud-showers-heavy",
    color: "#487eb0",
  },
  71: { description: "Light snow", icon: "fa-snowflake", color: "#74b9ff" },
  73: { description: "Moderate snow", icon: "fa-snowflake", color: "#74b9ff" },
  75: { description: "Heavy snow", icon: "fa-snowflake", color: "#74b9ff" },
  77: { description: "Snow grains", icon: "fa-snowflake", color: "#74b9ff" },
  80: {
    description: "Light rain showers",
    icon: "fa-cloud-rain",
    color: "#70a1ff",
  },
  81: {
    description: "Moderate rain showers",
    icon: "fa-cloud-rain",
    color: "#70a1ff",
  },
  82: {
    description: "Violent rain showers",
    icon: "fa-cloud-showers-heavy",
    color: "#487eb0",
  },
  85: {
    description: "Light snow showers",
    icon: "fa-snowflake",
    color: "#74b9ff",
  },
  86: {
    description: "Heavy snow showers",
    icon: "fa-snowflake",
    color: "#74b9ff",
  },
  95: { description: "Thunderstorm", icon: "fa-bolt", color: "#f5cd79" },
  96: {
    description: "Thunderstorm with hail",
    icon: "fa-bolt",
    color: "#f5cd79",
  },
  99: {
    description: "Thunderstorm with heavy hail",
    icon: "fa-bolt",
    color: "#f5cd79",
  },
};

function renderData(weather, geocode) {
  const current = weather.current;
  const daily = weather.daily;
  const weatherCode = current.weather_code;
  const weatherInfo = weatherCodeMap[weatherCode] || {
    description: "Unknown",
    icon: "fa-cloud",
    color: "#dcdde1",
  };

  const city = geocode.city || geocode.locality || "Unknown City";
  const country = geocode.countryName || geocode.country || "";
  const location = country ? `${city}, ${country}` : city;

  // Hide loader and show the main content
  $("#loader").fadeOut(400, function () {
    $(".main").fadeIn();
  });

  // Location & date
  $("#location").text(location);
  $("#todaysDate").text(formatFullDate(current.time));

  // Current weather icon and description
  $("#weatherIcon").html(
    `<i class="fas ${weatherInfo.icon}" style="color: ${weatherInfo.color};"></i>`,
  );
  $("#weatherDesc").text(weatherInfo.description);

  // Temperature
  $("#temperature").text(`${Math.round(current.temperature_2m)}°`);
  $("#feelsLike").text(
    `Feels like ${Math.round(current.apparent_temperature)}°`,
  );

  // Weather stats
  $("#minTemp").html(
    `<i class="fas fa-thermometer-quarter"></i> ${Math.round(daily.temperature_2m_min[0])}°`,
  );
  $("#maxTemp").html(
    `<i class="fas fa-thermometer-three-quarters"></i> ${Math.round(daily.temperature_2m_max[0])}°`,
  );
  $("#humidity").html(
    `<i class="fas fa-tint"></i> ${current.relative_humidity_2m}%`,
  );
  $("#windSpeed").html(
    `<i class="fas fa-wind"></i> ${Math.round(current.wind_speed_10m)} km/h`,
  );

  // Sunrise/Sunset
  $("#sunrise").html(
    `<i class="fas fa-sun"></i> Sunrise: ${formatTime(daily.sunrise[0])}`,
  );
  $("#sunset").html(
    `<i class="fas fa-moon"></i> Sunset: ${formatTime(daily.sunset[0])}`,
  );

  // Render 7-day forecast
  renderForecast(daily);
}

function renderForecast(daily) {
  const tableBody = $("#tableBody");
  tableBody.empty();

  for (let i = 1; i < daily.time.length; i++) {
    const code = daily.weather_code[i];
    const info = weatherCodeMap[code] || {
      description: "Unknown",
      icon: "fa-cloud",
      color: "#dcdde1",
    };
    const date = new Date(daily.time[i]);
    const dayName = getWeekday(date);

    const row = `
      <tr>
        <td class="text-left align-middle weekday">${dayName}</td>
        <td class="text-center align-middle forecast-icon">
          <i class="fas ${info.icon}" style="color: ${info.color};"></i>
        </td>
        <td class="text-right align-middle temp-range">
          <span class="temp-min">${Math.round(daily.temperature_2m_min[i])}°</span>
          <span class="temp-max">${Math.round(daily.temperature_2m_max[i])}°</span>
        </td>
      </tr>
    `;
    tableBody.append(row);
  }
}

// Toggle forecast panel
$("#showMore").click(function () {
  $(".forecast-section").slideToggle(400);
  $("#showMore").hide();
  $("#showLess").show();
});

$("#showLess").click(function () {
  $(".forecast-section").slideToggle(400);
  $("#showLess").hide();
  $("#showMore").show();
});

function formatTime(timeString) {
  const date = new Date(timeString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

function formatFullDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getWeekday(date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}
