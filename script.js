// API Key Variables
const apiKey = "94dafb286a52dfaa6cc3cfd764f180ed";
let precipitation = document.querySelector("#prec");
let humidity = document.querySelector("#hum");
let wind = document.querySelector("#wind");
let weatherIcon = document.querySelector(".weather-icon");
let temperature = document.querySelector(".temp-text");
let weatherDescription = document.querySelector(".weather-desc");

const dayText = document.querySelector(".main-text");
const dateText = document.querySelector(".date-text");
const locationText = document.querySelector(".location-text");
const errorMessage = document.querySelector("#error-message");
const spinner = document.querySelector("#spinner");

// Search input + button
const inputField = document.querySelector(".input-field");
const getWeatherBtn = document.querySelector(".get-weather-btn");

//
// ✅ Spinner handling
//
function showSpinner() {
  spinner.style.display = "block";
}
function hideSpinner() {
  spinner.style.display = "none";
}

//
// ✅ Error handling
//
function showError(type) {
  hideSpinner(); // always hide spinner when error happens
  let msg = "";

  switch (type) {
    case "cityNotFound":
      msg = "❌ City not found. Please try again!";
      break;
    case "emptyInput":
      msg = "⚠️ Please enter a city name.";
      break;
    case "geoDenied":
      msg = "📍 Location access denied. Showing London by default.";
      break;
    case "fetchError":
      msg = "⚠️ Unable to load weather data. Try again later.";
      break;
    default:
      msg = "⚠️ Something went wrong. Please try again.";
  }

  errorMessage.textContent = msg;
  errorMessage.style.display = "block";
}

function hideError() {
  errorMessage.textContent = "";
  errorMessage.style.display = "none";
}

//
// ✅ Render weather data
//
function renderWeather(data) {
  hideError();
  hideSpinner();

  const precipitationValue = data.rain?.["1h"] || data.snow?.["1h"] || 0;
  const humidityValue = data.main.humidity;
  const windValue = (data.wind.speed * 3.6).toFixed(1); // m/s → km/h
  const weatherDescValue = data.weather[0].description;
  const temperatureValue = Math.round(data.main.temp);
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  precipitation.textContent =
    precipitationValue > 0 ? `${precipitationValue} mm` : "No rain";
  humidity.textContent = `${humidityValue}%`;
  wind.textContent = `${windValue} km/h`;
  weatherDescription.textContent = `${weatherDescValue}`;
  temperature.textContent = `${temperatureValue} °C`;
  weatherIcon.setAttribute("src", iconUrl);

  // Update location name
  locationText.innerHTML = `<img class="loc-icon" src="./images/location.png" alt="Location Icon" /> ${data.name}, ${data.sys.country}`;
}

//
// ✅ Fetch weather by city name
//
function fetchWeatherByCity(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  showSpinner();
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error("cityNotFound");
      return response.json();
    })
    .then((data) => {
      renderWeather(data);
      inputField.value = ""; // clear input
    })
    .catch((error) => showError(error.message))
    .finally(() => hideSpinner());
}

//
// ✅ Fetch weather by coordinates
//
function fetchWeatherByCoords(lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  showSpinner();
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error("fetchError");
      return response.json();
    })
    .then((data) => renderWeather(data))
    .catch((error) => showError(error.message))
    .finally(() => hideSpinner());
}

//
// ✅ Handle search button click
//
getWeatherBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const city = inputField.value.trim();
  if (city) {
    fetchWeatherByCity(city);
  } else {
    showError("emptyInput");
  }
});

//
// ✅ On page load: use geolocation
//
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      showError("geoDenied");
      fetchWeatherByCity("London");
    }
  );
} else {
  showError("geoDenied");
  fetchWeatherByCity("London");
}

//
// ✅ Display date and day
//
const now = new Date();
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const day = days[now.getDay()];
const date = now.getDate();
const month = months[now.getMonth()];
const year = now.getFullYear();

dayText.innerHTML = day;
dateText.innerHTML = `${date} ${month} ${year}`;
