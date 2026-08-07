let weatherData = null;
let locationData = null;

$(document).ready(function () {
  if ("geolocation" in navigator) {
    getUserLocation();
  } else {
    showErrorMessage("Your browser does not support geolocation.");
  }
});

// Get user's current position
function getUserLocation() {
  $("#loader").fadeIn();
  navigator.geolocation.getCurrentPosition(
    async function (position) {
      try {
        await Promise.all([
          reverseGeocode(position.coords.latitude, position.coords.longitude),
          fetchWeather(position.coords.latitude, position.coords.longitude),
        ]);
        renderData(weatherData, locationData);
      } catch (error) {
        console.error("Error loading weather data:", error);
        showErrorMessage("Unable to load weather data. Please try again.");
      }
    },
    function (error) {
      console.error("Geolocation error:", error);
      // Fallback to a default city (New York) if geolocation is denied
      fetchFallbackLocation();
    },
    { timeout: 10000 },
  );
}

// Reverse geocode to get city and country name using Photon
async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
  );
  if (!response.ok) throw new Error("Failed to reverse geocode");
  const data = await response.json();
  const props =
    data.features && data.features[0] ? data.features[0].properties : {};
  // Map Photon response to match our expected format
  locationData = {
    city: props.city || props.name || "Unknown",
    countryName: props.country || "",
  };
  return locationData;
}

// Fetch weather data from Open-Meteo API
async function fetchWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=7`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch weather data");
  return (weatherData = await response.json());
}

// Fallback if geolocation is denied - use a default city
async function fetchFallbackLocation() {
  try {
    const defaultLocation = await reverseGeocode(40.7128, -74.006); // New York
    await fetchWeather(40.7128, -74.006);
    renderData(weatherData, defaultLocation);
  } catch (error) {
    console.error("Fallback failed:", error);
    showErrorMessage("Unable to load weather data. Please try again.");
  }
}

// Show error message to user
function showErrorMessage(message) {
  $("#loader").hide();
  $(".main")
    .html(
      `
    <div class="container">
      <div class="card weather-card">
        <div class="card-body text-center py-5">
          <i class="fas fa-exclamation-triangle warning-icon mb-3"></i>
          <h4 class="mb-3">Something went wrong</h4>
          <p class="text-muted" style="color: rgba(255,255,255,0.7);">${message}</p>
          <button id="retryBtn" class="mt-2">
            <i class="fas fa-redo-alt"></i> Try Again
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .fadeIn();
  $("#retryBtn").click(function () {
    location.reload();
  });
}
