import { locationKey, imageKey, weatherKey, geoCodingKey } from '../../api-keys';

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


async function getLocation() {
  const url = `https://ipinfo.io/json?token=${locationKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function getCountryName(location) {
  const coordinates = location.split(',');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${coordinates[0]}+${coordinates[1]}&language=be&key=${geoCodingKey}`;
  return fetch(url)
    .then((response) => response.json())
}

async function getCurrentWeather(location) {
  const coordinates = location.split(',');
  const url = `https://api.weatherbit.io/v2.0/current?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=be&units=M&key=${weatherKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function getThreeDaysWeather(location) {
  const coordinates = location.split(',');
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
  return {threeDaysTemp, threeDaysWeekdays};
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
    
    const {threeDaysTemp, threeDaysWeekdays} = filterThreeDaysWeather(dataThree);
    
    renderWeatherInfo(dataCurr, threeDaysTemp);
    // console.log(data[0].temp, data[0].wind_spd, data[0].weather.description, data[0].app_temp, data[0].rh);

  } catch (err) {
    console.log(err);
  }
}

init();
// getImage();


// function getTimeFromPageLoad() {
//     getTime();
//     setInterval(getTime, 1000);
// }
// getTimeFromPageLoad()


