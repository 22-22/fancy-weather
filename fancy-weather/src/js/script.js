import { locationKey, imageKey, weatherKey, geoCodingKey, mapKey } from '../../api-keys';
import iconsMap from './iconsMap';

const tempCurr = document.querySelector('.weather__temp-today');
const tempFeelsLike = document.querySelector('.weather-today-feels');

class State {
  constructor(lang, tempType) {
    this.lang = lang;
    this.tempType = tempType;
  }
}
let state = new State('en', localStorage.getItem('tempType') || 'M');

function convertToCels(deg) {
  return Math.round((parseInt(deg, 10) - 32) / 1.8);
}

function convertToFahr(deg) {
  return Math.round(parseInt(deg, 10) * 1.8 + 32);
}

document.querySelector('.btn--fahr').addEventListener('click', () => {
  if (state.tempType === 'M') {
    tempCurr.textContent = `${convertToFahr(tempCurr.textContent)}°`;
    tempFeelsLike.textContent = `${convertToFahr(tempFeelsLike.textContent)}°`;
    document.querySelectorAll('.forecast__temp').forEach((day, idx) => {
      day.textContent = `${convertToFahr(day.textContent)}°`;
    });
    state.tempType = 'I';
    localStorage.setItem('tempType', 'I');
  }
})

document.querySelector('.btn--cels').addEventListener('click', () => {
  if (state.tempType === 'I') {
    tempCurr.textContent = `${convertToCels(tempCurr.textContent)}°`;
    tempFeelsLike.textContent = `${convertToCels(tempFeelsLike.textContent)}°`;
    document.querySelectorAll('.forecast__temp').forEach((day, idx) => {
      day.textContent = `${convertToCels(day.textContent)}°`;
    });
    state.tempType = 'M';
    localStorage.setItem('tempType', 'M');
  }
})

async function getUserLocation() {
  const url = `https://ipinfo.io/json?token=${locationKey}`;
  return fetch(url)
    .then((response) => response.json())
}

async function getSearchLocation(query) {
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&language=en&key=${geoCodingKey}`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => data.results[0]);
}

// form search
document.querySelector('.search').addEventListener('submit', (e) => {
  e.preventDefault();
  const keyWord = document.querySelector('.search__input').value;
  displayNewWeatherInfo(keyWord);
});

// initialize the map
function initMap(location) {
  mapboxgl.accessToken = mapKey;
  const coordinates = renderLocation(location);
  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [coordinates[1], coordinates[0]],
    zoom: 9
  });
}

function showMapSearch(location) {
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

async function getCountryName(location) {
  const coordinates = renderLocation(location);
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${coordinates[0]}+${coordinates[1]}&language=en&key=${geoCodingKey}`;
  return fetch(url)
    .then((response) => response.json())
}

async function getCurrentWeather(location) {
  const coordinates = renderLocation(location);
  const unit = localStorage.getItem('tempType') === 'I' ? 'I' : 'M';
  const url = `https://api.weatherbit.io/v2.0/current?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=en&units=${unit}&key=${weatherKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function getThreeDaysWeather(location) {
  const coordinates = renderLocation(location);
  const unit = localStorage.getItem('tempType') === 'I' ? 'I' : 'M';
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=be&units=${unit}&key=${weatherKey}`;
  return fetch(url)
    .then((response) => response.json());
}

function filterWeatherThreeDays(data) {
  const threeDaysTemp = [];
  const threeDaysWeekdays = [];
  const threeDaysIcons = [];
  data.data.forEach((day, idx) => {
    if (idx !== 0 && idx <= 3) {
      threeDaysTemp.push(day.temp);
      threeDaysWeekdays.push(new Date(day.valid_date).toLocaleDateString('en', { weekday: 'long' }));
      threeDaysIcons.push(day.weather.icon);
    }
  });
  return { threeDaysTemp, threeDaysWeekdays, threeDaysIcons };
}

function renderLocation(location) {
  const coordinates = typeof location === 'string' ? location.split(',') : Object.values(location);
  return coordinates;
}

function splitCoordinates(coordinates) {
  const degreesMinutes = coordinates.map((coord) => {
    coord = Math.round((+coord + Number.EPSILON) * 100) / 100;
    return coord.toString().split('.');
  })

  return degreesMinutes;
}

function renderWeatherInfo(city, country, dataWeatherCurrent, threeDaysTemp, threeDaysWeekdays, threeDaysIcons, location) {
  const coordinates = renderLocation(location);
  const degreesMinutes = splitCoordinates(coordinates);

  document.querySelector('.lat').textContent = `Latitude: ${degreesMinutes[0][0]}°${degreesMinutes[0][1]}'`;
  document.querySelector('.lng').textContent = `Longtitude: ${degreesMinutes[1][0]}°${degreesMinutes[1][1]}'`;

  document.querySelector('.location').textContent = `${city}, ${country}`;
  tempCurr.textContent = `${Math.round(dataWeatherCurrent.data[0].temp)}°`;
  document.querySelector('.weather-today-descript').textContent = dataWeatherCurrent.data[0].weather.description;
  tempFeelsLike.textContent = `${Math.round(dataWeatherCurrent.data[0].app_temp)}°`;
  document.querySelector('.weather-today-wind').textContent = ` WIND: ${Math.round(dataWeatherCurrent.data[0].wind_spd)} m/s`;
  document.querySelector('.weather-today-humid').textContent = `HUMIDITY: ${dataWeatherCurrent.data[0].rh}%`;

  document.querySelectorAll('.forecast__day').forEach((day, idx) => {
    day.textContent = threeDaysWeekdays[idx];
  });

  document.querySelectorAll('.forecast__temp').forEach((temp, idx) => {
    temp.textContent = `${Math.round(threeDaysTemp[idx])}°`;
  });

  document.querySelector('#weather-icon-today').style.backgroundImage = `url('${iconsMap[dataWeatherCurrent.data[0].weather.icon]}')`;

  document.querySelector('#forecast-icon-1').style.backgroundImage = `url('${iconsMap[threeDaysIcons[0]]}')`;
  document.querySelector('#forecast-icon-2').style.backgroundImage = `url('${iconsMap[threeDaysIcons[1]]}')`;
  document.querySelector('#forecast-icon-3').style.backgroundImage = `url('${iconsMap[threeDaysIcons[2]]}')`;

}

function getImage(season, partOfDay) {
  const url = 'https://api.unsplash.com/photos/random?orientation=landscape'
    + `&per_page=1&query={${season}, ${partOfDay}}}&client_id=${imageKey}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => document.body.style.backgroundImage = `url(${data.urls.regular})`);
}

function getTime() {
  const date = new Date();
  const timeNow = date.toLocaleTimeString();
  document.querySelector('#time').innerHTML = timeNow;
}

function getDate() {
  const options = { weekday: 'short', month: 'long', day: 'numeric' };
  const date = new Date().toLocaleDateString('en-us', options);
  document.querySelector('#day').innerHTML = date;
}

// window.addEventListener('DOMContentLoaded', () => {
//   getDate();
//   getTime();
// });
// setInterval(getTime, 1000);

function defineSeason() {
  const seasonIdx = Math.floor((new Date().getMonth() / 12 * 4)) % 4;
  const seasons = ['winter', 'spring', 'summer', 'autumn'];
  return seasons[seasonIdx];
}

function definepartOfDay() {
  const hrs = new Date().getHours();
  const partOfDay = (hrs > 8 && hrs < 20) ? 'day' : 'night';
  return partOfDay;
}

async function init() {
  try {
    const { loc, city } = await getUserLocation();
    // initMap(loc);

    getDate();
    getTime();
    setInterval(getTime, 1000);

    const season = defineSeason();
    const partOfDay = definepartOfDay();
   
// getImage(season, partOfDay);

    const { results: [{ components: { country } }] } = await getCountryName(loc);
    const dataWeatherCurrent = await getCurrentWeather(loc);
    const dataWeatherThreeDays = await getThreeDaysWeather(loc);
    const { threeDaysTemp, threeDaysWeekdays, threeDaysIcons } = filterWeatherThreeDays(dataWeatherThreeDays);

    renderWeatherInfo(city, country, dataWeatherCurrent, threeDaysTemp, threeDaysWeekdays, threeDaysIcons, loc);
  } catch (err) {
    console.log(err);
  }
}

init();

async function displayNewWeatherInfo(keyWord) {
  try {
    const { geometry, components: { city, country } } = await getSearchLocation(keyWord);
    // showMapSearch(geometry);
    const dataWeatherCurrent = await getCurrentWeather(geometry);
    const dataWeatherThreeDays = await getThreeDaysWeather(geometry);
    const { threeDaysTemp, threeDaysWeekdays, threeDaysIcons } = filterWeatherThreeDays(dataWeatherThreeDays);
    renderWeatherInfo(city, country, dataWeatherCurrent, threeDaysTemp, threeDaysWeekdays, threeDaysIcons, geometry);
  } catch (err) {
    console.log(err);
  }
}



// TO-DO

// renderToDOM +
// Icons +
// save lang & temp type +/-
// фоновое изображение генерируется с учётом поры года и времени суток указанного в поле поиска населённого пункта +

// отображение часов в часовом поясе
// внешний вид (классы)
