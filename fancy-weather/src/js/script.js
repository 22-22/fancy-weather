import { locationKey, imageKey, weatherKey, geoCodingKey, mapKey } from '../../api-keys';
import iconsMap from './iconsMap';
import translationBe from './translation-be.json';
import translationRu from './translation-ru.json';
import translationEn from './translation-en.json';
import recognition from './speech-recognition';

const tempCurr = document.querySelector('.weather-today__temp');
const tempFeelsLike = document.querySelector('.weather-today-feels');

let time;

localStorage.setItem('lang', localStorage.getItem('lang') || 'en');
localStorage.setItem('tempType', localStorage.getItem('tempType') || 'M');

function convertToCels(deg) {
  return Math.round((parseInt(deg, 10) - 32) / 1.8);
}

function convertToFahr(deg) {
  return Math.round(parseInt(deg, 10) * 1.8 + 32);
}

function findNumber(str) {
  let regexp = /\d+/g;
  let match = str.match(regexp);
  return match;
}

document.querySelector('.btn--fahr').addEventListener('click', () => {
  const lang = localStorage.getItem('lang');
  
  let translationObj;
  if (lang === 'be') {
    translationObj = translationBe;
  } else if (lang === 'ru') {
    translationObj = translationRu;
  } else {
    translationObj = translationEn;
  }

  document.querySelector('.btn--fahr').style.background = "rgba(174, 181, 185, 0.5)";
  document.querySelector('.btn--cels').style.background = "rgba(76, 82, 85, 0.4)";
  if (localStorage.getItem('tempType') === 'M') {
    tempCurr.textContent = `${convertToFahr(tempCurr.textContent)}°`;
    const num = findNumber(tempFeelsLike.textContent);
    tempFeelsLike.textContent = `${translationObj.feel} ${convertToFahr(num)}°`;
    document.querySelectorAll('.forecast__temp').forEach((day, idx) => {
      day.textContent = `${convertToFahr(day.textContent)}°`;
    });
    localStorage.setItem('tempType', 'I');
  }
})

document.querySelector('.btn--cels').addEventListener('click', () => {
  
  const lang = localStorage.getItem('lang');
  
  let translationObj;
  if (lang === 'be') {
    translationObj = translationBe;
  } else if (lang === 'ru') {
    translationObj = translationRu;
  } else {
    translationObj = translationEn;
  }

  document.querySelector('.btn--fahr').style.background = "rgba(76, 82, 85, 0.4)";
  document.querySelector('.btn--cels').style.background = "rgba(174, 181, 185, 0.5)";
  if (localStorage.getItem('tempType') === 'I') {
    tempCurr.textContent = `${convertToCels(tempCurr.textContent)}°`;
    const num = findNumber(tempFeelsLike.textContent);
    tempFeelsLike.textContent = `${translationObj.feel} ${convertToCels(num)}°`;
    document.querySelectorAll('.forecast__temp').forEach((day, idx) => {
      day.textContent = `${convertToCels(day.textContent)}°`;
    });
    localStorage.setItem('tempType', 'M');
  }
})

async function getUserLocation() {
  const url = `https://ipinfo.io/json?token=${locationKey}`;
  return fetch(url)
    .then((response) => response.json())
}

async function getSearchLocation(query) {
  const lang = localStorage.getItem('lang');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&language=${lang}&key=${geoCodingKey}`;
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
  new mapboxgl.Marker()
    .setLngLat([coordinates[1], coordinates[0]])
    .addTo(map);
}

// function showMapSearch(location) {
//   const coordinates = renderLocation(location);
//   map.flyTo({
//     center: [coordinates[1], coordinates[0]],
//     essential: true
//   });
//   map.setCenter([coordinates[1], coordinates[0]]);

//   let marker = document.createElement('div');
//   marker.className = 'marker'
//   new mapboxgl.Marker()
//     .setLngLat([coordinates[1], coordinates[0]])
//     .addTo(map);

// }


async function getCountryName(location) {
  const coordinates = renderLocation(location);
  const lang = localStorage.getItem('lang');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${coordinates[0]}+${coordinates[1]}&language=${lang}&key=${geoCodingKey}`;
  return fetch(url)
    .then((response) => response.json())
}

async function getCurrentWeather(location) {
  const coordinates = renderLocation(location);
  const unit = localStorage.getItem('tempType');
  const lang = localStorage.getItem('lang');
  const url = `https://api.weatherbit.io/v2.0/current?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=${lang}&units=${unit}&key=${weatherKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function getThreeDaysWeather(location) {
  const coordinates = renderLocation(location);
  const unit = localStorage.getItem('tempType');
  const lang = localStorage.getItem('lang');
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=${lang}&units=${unit}&key=${weatherKey}`;
  return fetch(url)
    .then((response) => response.json());
}

function filterWeatherThreeDays(data) {
  const lang = localStorage.getItem('lang');
  const threeDaysTemp = [];
  const threeDaysWeekdays = {};
  const threeDaysIcons = [];
  data.data.forEach((day, idx) => {
    if (idx !== 0 && idx <= 3) {
      threeDaysTemp.push(day.temp);
      let weekdayNumber = new Date(day.valid_date).getDay()
      let weekdayName = new Date(day.valid_date).toLocaleDateString(lang, { weekday: 'long' });
      threeDaysWeekdays[`idx${weekdayNumber}`] = weekdayName;
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

function makeTranslation(translationObject) {
  const wordsToTranslate = document.querySelectorAll('[data-i18n]');
  wordsToTranslate.forEach((word) => {
    if (word.textContent.includes(':')) {
      let wordArray = word.textContent.split(':');
      word.textContent = `${translationObject[word.dataset.i18n]} ${wordArray[1]}`;
    } else {
      let result = translationObject;
      const pathes = word.dataset.i18n.split('.');
      pathes.forEach((path) => {
        result = result[path];
      });
      word.textContent = result;
    }
  })
  document.querySelector('.search__input').placeholder = translationObject.placeholder;
}

document.querySelector('#ru').addEventListener('click', function() {
  makeTranslation(translationRu);
  localStorage.setItem('lang', 'ru');
  // document.querySelector('.lang-active').textContent = 'Ru';
})

document.querySelector('#en').addEventListener('click', function() {
  makeTranslation(translationEn);
  localStorage.setItem('lang', 'en');
 // document.querySelector('.lang-active').textContent = 'En';
})
document.querySelector('#be').addEventListener('click', function() {
  makeTranslation(translationBe);
  localStorage.setItem('lang', 'be');
  // document.querySelector('.lang-active').textContent = 'Be';
})

function renderWeatherInfo(placeName, dataWeatherCurrent, threeDaysTemp, threeDaysWeekdays, threeDaysIcons, location, image) {

  const lang = localStorage.getItem('lang');
  let translationObj;
  if (lang === 'be') {
    translationObj = translationBe;
  } else if (lang === 'ru') {
    translationObj = translationRu;
  } else {
    translationObj = translationEn;
  }

  document.body.style.backgroundImage = `linear-gradient(rgba(8, 15, 26, 0.6) 0%, rgba(17, 17, 46, 0.5) 100%), url(${image})`;

  const coordinates = renderLocation(location);
  const degreesMinutes = splitCoordinates(coordinates);

  document.querySelector('.search__input').placeholder = translationObj.placeholder;

  document.querySelector('.lat').textContent = `${translationObj.lat}: ${degreesMinutes[0][0]}°${degreesMinutes[0][1]}'`;
  document.querySelector('.lng').textContent = `${translationObj.lng}: ${degreesMinutes[1][0]}°${degreesMinutes[1][1]}'`;

  document.querySelector('.location').textContent = placeName;
  tempCurr.textContent = `${Math.round(dataWeatherCurrent.data[0].temp)}°`;
  document.querySelector('.weather-today-descript').textContent = dataWeatherCurrent.data[0].weather.description;
  document.querySelector('.weather-today-descript').setAttribute('data-i18n', `weather.${dataWeatherCurrent.data[0].weather.code}`);
  tempFeelsLike.textContent = `${translationObj.feel} ${Math.round(dataWeatherCurrent.data[0].app_temp)}°`;
  document.querySelector('.weather-today-wind').textContent = `${translationObj.wind} ${Math.round(dataWeatherCurrent.data[0].wind_spd)} `;
  document.querySelector('.weather-today-humid').textContent = `${translationObj.humidity} ${dataWeatherCurrent.data[0].rh}%`;
  document.querySelector('.meters-sec').textContent = translationObj.ms;

  document.querySelectorAll('.forecast__day').forEach((day, idx) => {
    let key = Object.keys(threeDaysWeekdays)[idx];
    day.textContent = threeDaysWeekdays[key];
    day.setAttribute('data-i18n', `day.${key}`);
  });

  document.querySelectorAll('.forecast__temp').forEach((temp, idx) => {
    temp.textContent = `${Math.round(threeDaysTemp[idx])}°`;
  });

  document.querySelector('#weather-icon-today').style.backgroundImage = `url('${iconsMap[dataWeatherCurrent.data[0].weather.icon]}')`;

  document.querySelector('#forecast-icon-1').style.backgroundImage = `url('${iconsMap[threeDaysIcons[0]]}')`;
  document.querySelector('#forecast-icon-2').style.backgroundImage = `url('${iconsMap[threeDaysIcons[1]]}')`;
  document.querySelector('#forecast-icon-3').style.backgroundImage = `url('${iconsMap[threeDaysIcons[2]]}')`;
}

async function getImage(season, partOfDay) {
  console.log(season, partOfDay);
  const url = 'https://api.unsplash.com/photos/random?orientation=landscape'
    + `&per_page=1&query={${season}, ${partOfDay}}}&client_id=${imageKey}`;
  return fetch(url)
    .then((response) => response.json());
}

function getTime() {
  const date = new Date();
  const timeNow = date.toLocaleTimeString();
  document.querySelector('#time').innerHTML = timeNow;
  return timeNow;
}

function getDate() {
  const lang = localStorage.getItem('lang');
  
  const weekdayShort = new Date().toLocaleDateString(lang, { weekday: 'short' });
  const month = new Date().toLocaleDateString(lang, { month: 'long' });
  const dateNow = new Date().toLocaleDateString(lang, { day: 'numeric' });
  document.querySelector('#weekdayShort').innerHTML = weekdayShort;
  document.querySelector('#date').innerHTML = dateNow;
  document.querySelector('#month').innerHTML = month;

  let monthNumber = new Date().getMonth();
  document.querySelector('#month').setAttribute('data-i18n', `month.idx${monthNumber}`);

  const weekdayShortNumber = new Date().getDay();
  document.querySelector('#weekdayShort').setAttribute('data-i18n', `dayShort.idx${weekdayShortNumber}`);

  // return dateNow;
}

window.addEventListener('DOMContentLoaded', () => {
  getDate();
  getTime();
  time = setInterval(getTime, 1000);
  init();
});

function defineSeason() {
  const seasonIdx = Math.floor((new Date().getMonth() / 12 * 4)) % 4;
  const seasons = ['winter', 'spring', 'summer', 'autumn'];
  return seasons[seasonIdx];
}

function definepartOfDay(hrs) {
  const partOfDay = (hrs > 8 && hrs < 20) ? 'day' : 'night';
  return partOfDay;
}

async function init() {
  try {
    const { loc, city } = await getUserLocation();
    // initMap(loc);

    const hrs = new Date().getHours();
    const partOfDay = definepartOfDay(hrs);

    // const { urls: { regular } } = await getImage(season, partOfDay);

    const { results: [{ components: { country } }] } = await getCountryName(loc);
    const dataWeatherCurrent = await getCurrentWeather(loc);
    const dataWeatherThreeDays = await getThreeDaysWeather(loc);
    const { threeDaysTemp, threeDaysWeekdays, threeDaysIcons } = filterWeatherThreeDays(dataWeatherThreeDays);

    const placeName = `${city}, ${country}`;
    // renderWeatherInfo(placeName, dataWeatherCurrent, threeDaysTemp, threeDaysWeekdays, threeDaysIcons, loc, regular);
    renderWeatherInfo(placeName, dataWeatherCurrent, threeDaysTemp, threeDaysWeekdays, threeDaysIcons, loc);
  } catch (err) {
    console.log(err);
  }
}

function defineLocalTime(timezone) {
  const lang = localStorage.getItem('lang');
  
  let date = new Date();
  let localTime24 = date.toLocaleTimeString(lang, { timeZone: timezone, hour12: false });
  let regexp = new RegExp('^24');
  if (regexp.test(localTime24)) {
    let localTimeFixed24 = localTime24.split(':');
    localTimeFixed24[0] = '00';
    document.querySelector('#time').innerHTML = localTimeFixed24.join(':');
  } else {
    document.querySelector('#time').innerHTML = localTime24;
  }
  return localTime24;
}

function defineLocalDate(timezone) {
  const lang = localStorage.getItem('lang');

  const weekdayShort = new Date().toLocaleDateString(lang, { weekday: 'short', timeZone: timezone });
  const month = new Date().toLocaleDateString(lang, { month: 'long', timeZone: timezone });
  const dateNow = new Date().toLocaleDateString(lang, { day: 'numeric', timeZone: timezone });
  document.querySelector('#weekdayShort').innerHTML = weekdayShort;
  document.querySelector('#date').innerHTML = dateNow;
  document.querySelector('#month').innerHTML = month;

  const monthNumber = new Date().toLocaleDateString(lang, { month: 'numeric', timeZone: timezone });
  document.querySelector('#month').setAttribute('data-i18n', `month.idx${monthNumber - 1}`);

  const weekdayShortNumber = new Date().toLocaleDateString(lang, { day: 'numeric', timeZone: timezone });
  document.querySelector('#weekdayShort').setAttribute('data-i18n', `dayShort.idx${weekdayShortNumber - 1}`);

  // return localDate;
}

const season = defineSeason();

async function displayNewWeatherInfo(keyWord) {
  try {
    const { geometry, components } = await getSearchLocation(keyWord);
    const placeName = `${components.city || components.town || components.village || components.state || ''}, ${components.country}`
    initMap(geometry);

    const dataWeatherCurrent = await getCurrentWeather(geometry);
    let timezone = dataWeatherCurrent.data[0].timezone;

    let timeLocal = defineLocalTime(timezone);
    defineLocalDate(timezone);
    clearInterval(time);
    time = setInterval(defineLocalTime, 1000, timezone);

    const hrs = timeLocal.slice(0, 2);
    const partOfDay = definepartOfDay(hrs);

    const { urls: { regular } } = await getImage(season, partOfDay);

    const dataWeatherThreeDays = await getThreeDaysWeather(geometry);
    const { threeDaysTemp, threeDaysWeekdays, threeDaysIcons } = filterWeatherThreeDays(dataWeatherThreeDays);
    renderWeatherInfo(placeName, dataWeatherCurrent, threeDaysTemp, threeDaysWeekdays, threeDaysIcons, geometry, regular);
  } catch (err) {
    console.log(err);
  }
}

async function changeImage() {
  const hrs = document.querySelector('#time').textContent.slice(0, 2);
  const partOfDay = definepartOfDay(hrs);
  const { urls: { regular } } = await getImage(season, partOfDay);
  document.body.style.backgroundImage = `linear-gradient(rgba(8, 15, 26, 0.6) 0%, rgba(17, 17, 46, 0.5) 100%), url(${regular})`;
}

document.querySelector('.btn--image').addEventListener('click', changeImage)

// TO-DO

// renderToDOM +
// Icons +
// save lang & temp type +/-
// фоновое изображение генерируется с учётом поры года и времени суток указанного в поле поиска населённого пункта +

// отображение часов в часовом поясе +
// внешний вид (классы) +

// уведомления об ошибках (плюс посмотреть PR)
// promise all
// loader
// перевод +.-

// если на бел, при поиске и зарузке надо подтягивать дни недели
// переводить название города

export default displayNewWeatherInfo;
