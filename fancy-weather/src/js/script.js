import { locationKey, imageKey, weatherKey, geoCodingKey, mapKey } from '../../api-keys';

const tempCurr = document.querySelector('.weather__temp-today');
const tempThreeDays = document.querySelectorAll('.forecast__temp');

class State {
  constructor(lang, tempType) {
    this.lang = lang;
    this.tempType = tempType;
  }
}
let state = new State('en', 'M')

document.querySelector('.btn--fahr').addEventListener('click', () => {
  state.tempType = 'I';
  // local storage
  tempCurr.textContent = tempCurr.textContent * 1.8 + 32;
})

document.querySelector('.btn--cels').addEventListener('click', () => {
  state.tempType = 'M';
  // local storage
  tempCurr.textContent = tempCurr.textContent - 32 / 1.8;
})

async function getLocation() {
  const url = `https://ipinfo.io/json?token=${locationKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function getCoordinates(query) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${geoCodingKey}`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => data.results[0].geometry);
}

// form search
document.querySelector('.search').addEventListener('submit', (e) => {
  e.preventDefault();
  const keyWord = document.querySelector('.search__input').value;
  displayNewWeatherInfo(keyWord);

});

// initialize the map
mapboxgl.accessToken = mapKey;
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-74.5, 40],
  zoom: 9
});

function showMapSearch(location) {
  const coordinates = typeof location === 'string' ? location.split(',') : Object.values(location);
  map.flyTo({
    center: [coordinates[1], coordinates[0]],
    essential: true
  });

  // let marker = document.createElement('div');
  // marker.className = 'marker'
  new mapboxgl.Marker()
    .setLngLat([coordinates[1], coordinates[0]])
    .addTo(map);

    console.log(map)
}

async function displayNewWeatherInfo(keyWord) {
  try {
    const loc = await getCoordinates(keyWord);
    showMapSearch(loc);
    const { results } = await getCountryName(loc);
    // console.log(results[0].components.country);
    const dataCurr = await getCurrentWeather(loc);
    const dataThree = await getThreeDaysWeather(loc);

    const { threeDaysTemp, threeDaysWeekdays } = filterThreeDaysWeather(dataThree);

    // console.log(`Temp: ${dataCurr.data[0].temp}°, wind: ${dataCurr.data[0].wind_spd} m/s, ${dataCurr.data[0].weather.description}, feels like ${dataCurr.data[0].app_temp}, humidity: ${dataCurr.data[0].rh}%`);

  } catch (err) {
    console.log(err);
  }
}

async function getCountryName(location) {
  const coordinates = typeof location === 'string' ? location.split(',') : Object.values(location);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${coordinates[0]}+${coordinates[1]}&language=en&key=${geoCodingKey}`;
  return fetch(url)
    .then((response) => response.json())
}

async function getCurrentWeather(location) {
  const coordinates = typeof location === 'string' ? location.split(',') : Object.values(location);
  const url = `https://api.weatherbit.io/v2.0/current?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=en&units=M&key=${weatherKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function getThreeDaysWeather(location) {
  const coordinates = typeof location === 'string' ? location.split(',') : Object.values(location);
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=be&units=M&key=${weatherKey}`;
  return fetch(url)
    .then((response) => response.json());
}

function filterThreeDaysWeather(data) {
  const threeDaysTemp = [];
  const threeDaysWeekdays = [];
  data.data.forEach((day, idx) => {
    if (idx !== 0 && idx <= 3) {
      threeDaysTemp.push(day.temp);
      threeDaysWeekdays.push(new Date(day.valid_date).toLocaleDateString('en', { weekday: 'long' }));
    }
  });
  return { threeDaysTemp, threeDaysWeekdays };
}

// function renderWeatherInfo(dataCurr, threeDaysTemp) {

// }

function getImage() {
  const url = 'https://api.unsplash.com/photos/random?orientation=landscape'
    + `&per_page=1&query=nature&client_id=${imageKey}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => document.body.style.backgroundImage = `url(${data.urls.regular})`);
}

function getTimeNow() {
  const date = new Date();
  const timeNow = date.toLocaleTimeString();
  document.querySelector('#time').innerHTML = timeNow;
}

function getDay() {
  const options = { weekday: 'short', month: 'long', day: 'numeric' };
  const day = new Date().toLocaleDateString('en-us', options);
  document.querySelector('#day').innerHTML = day;
}

window.addEventListener('DOMContentLoaded', () => {
  getDay();
  getTimeNow();
});

setInterval(getTimeNow, 1000);

async function init() {
  try {
    const { loc, city } = await getLocation();
    const { results } = await getCountryName(loc);
    // console.log(results[0].components.country);
    const dataCurr = await getCurrentWeather(loc);
    const dataThree = await getThreeDaysWeather(loc);

    const { threeDaysTemp, threeDaysWeekdays } = filterThreeDaysWeather(dataThree);

    // renderWeatherInfo(dataCurr, threeDaysTemp);
    // console.log(`Temp: ${dataCurr.data[0].temp}°, wind: ${dataCurr.data[0].wind_spd} m/s, ${dataCurr.data[0].weather.description}, feels like ${dataCurr.data[0].app_temp}, humidity: ${dataCurr.data[0].rh}%`);

  } catch (err) {
    console.log(err);
  }
}






// init();
// getImage();


// function getTimeFromPageLoad() {
//     getTime();
//     setInterval(getTime, 1000);
// }
// getTimeFromPageLoad()


