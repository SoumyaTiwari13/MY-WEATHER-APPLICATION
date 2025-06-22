const API_KEY = "91f67327519ffd996d0a9a6fab88ece6"

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorBox = document.getElementById("error");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");
const weatherBox = document.getElementById("weatherBox");
const forecastBox = document.getElementById("forecastBox");
const recentContainer = document.getElementById("recentContainer");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name.");
  getWeather(city);
  saveToRecent(city);
});

function getWeather(city) {
  errorBox.classList.add("hidden");

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);
      cityName.textContent = data.name;
      temperature.textContent = `${data.main.temp} °C`;
      condition.textContent = data.weather[0].description;
      weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      weatherBox.classList.remove("hidden");

      getForecast(data.coord.lat, data.coord.lon);
    })
    .catch(err => showError(err.message));
}

function getForecast(lat, lon) {
  forecastBox.innerHTML = "";
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const daily = {};
      data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date]) daily[date] = item;
      });

      Object.keys(daily).slice(0, 5).forEach(date => {
        const item = daily[date];
        const card = document.createElement("div");
        card.className = "bg-white p-3 rounded shadow text-center";
        card.innerHTML = `
          <p class="font-semibold">${new Date(date).toDateString()}</p>
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="mx-auto" />
          <p>${item.main.temp} °C</p>
          <p>Humidity: ${item.main.humidity}%</p>
          <p>Wind: ${item.wind.speed} m/s</p>
        `;
        forecastBox.appendChild(card);
      });
    });
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
  weatherBox.classList.add("hidden");
  forecastBox.innerHTML = "";
}

function saveToRecent(city) {
  let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!recent.includes(city)) {
    recent.unshift(city);
    if (recent.length > 5) recent.pop();
    localStorage.setItem("recentCities", JSON.stringify(recent));
  }
  renderRecent();
}

function renderRecent() {
  const recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (recent.length === 0) {
    recentContainer.innerHTML = "";
    return;
  }
  recentContainer.innerHTML = "<label class='block mb-1 font-semibold'>Recent Searches:</label>";
  const select = document.createElement("select");
  select.className = "w-full p-2 bg-gray-100 rounded";
  select.innerHTML = "<option value=''>-- Select City --</option>";
  recent.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    select.appendChild(opt);
  });
  select.addEventListener("change", (e) => {
    if (e.target.value) getWeather(e.target.value);
  });
  recentContainer.appendChild(select);
}

window.addEventListener("load", renderRecent);
