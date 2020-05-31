import {
  locationKey, imageKey, weatherKey, geoCodingKey, mapKey, translationKey,
} from '../../api-keys';
import {
  defineSeason, getTimeInUserLocation, getDateInUserLocation, definepartOfDay,
  defineTimeInSearchPlace, defineDateInSearchPlace,
}
  from './help-define-time';
import iconsMap from './iconsMap';
import translationBe from './translation-be.json';
import translationRu from './translation-ru.json';
import translationEn from './translation-en.json';
import recognition from './speech-recognition';
import { utterance, handleSpeechSynth } from './speechSynthesis';

const tempCurr = document.querySelector('.weather-today__temp');
const tempFeelsLike = document.querySelector('.weather-today-feels');

let time; let mapObj; let marker; let
  season;

localStorage.setItem('lang', localStorage.getItem('lang') || 'en');
localStorage.setItem('tempType', localStorage.getItem('tempType') || 'M');

function isEnglish(value) {
  const engNum = /[a-z]/i;
  return engNum.test(value);
}

function showLoading() {
  document.querySelector('.search__btn').classList.add('hidden');
  document.querySelector('#search__loader').classList.add('search__loader--active');
}

function hideLoading() {
  document.querySelector('#search__loader').classList.remove('search__loader--active');
  document.querySelector('.search__btn').classList.remove('hidden');
}

function toggleActiveClass(selector) {
  if (!document.querySelector(selector).classList.contains('active')) {
    document.querySelectorAll('.btn--lang').forEach((btn) => {
      btn.classList.remove('active');
    });
    document.querySelector(selector).classList.add('active');
  }
}

function addActiveClassToLang() {
  const lang = localStorage.getItem('lang');
  if (lang === 'be') {
    document.querySelector('.be').classList.add('active');
  } else if (lang === 'ru') {
    document.querySelector('.ru').classList.add('active');
  } else {
    document.querySelector('.en').classList.add('active');
  }
}

function addActiveClassToTemp() {
  const tempType = localStorage.getItem('tempType');
  if (tempType === 'M') {
    document.querySelector('.btn--cels').classList.add('active');
  } else {
    document.querySelector('.btn--fahr').classList.add('active');
  }
}

function adjustCoordinates(location) {
  let coordinates;
  if (typeof location === 'string') {
    coordinates = location.split(',');
  } else if (Array.isArray(location)) {
    coordinates = location;
  } else {
    coordinates = Object.values(location);
  }
  return coordinates;
}

function convertToCels(deg) {
  return Math.round((parseInt(deg, 10) - 32) / 1.8);
}

function convertToFahr(deg) {
  return Math.round(parseInt(deg, 10) * 1.8 + 32);
}

function findDigitInString(str) {
  const regexp = /\d+/g;
  const match = str.match(regexp);
  return match;
}

document.querySelector('.btn--info').addEventListener('click', () => {
  document.querySelector('.modal').classList.remove('none');
});

document.querySelector('.modal__close-button').addEventListener('click', () => {
  document.querySelector('.modal').classList.add('none');
});

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

  if (document.querySelector('.btn--cels').classList.contains('active')) {
    document.querySelector('.btn--cels').classList.remove('active');
    document.querySelector('.btn--fahr').classList.add('active');
  }

  if (localStorage.getItem('tempType') === 'M') {
    tempCurr.textContent = `${convertToFahr(tempCurr.textContent)}°`;
    const digit = findDigitInString(tempFeelsLike.textContent);
    tempFeelsLike.textContent = `${translationObj.feel} ${convertToFahr(digit)}°`;
    document.querySelectorAll('.forecast__temp').forEach((day, idx) => {
      day.textContent = `${convertToFahr(day.textContent)}°`;
    });
    localStorage.setItem('tempType', 'I');
  }
});

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

  if (document.querySelector('.btn--fahr').classList.contains('active')) {
    document.querySelector('.btn--fahr').classList.remove('active');
    document.querySelector('.btn--cels').classList.add('active');
  }

  if (localStorage.getItem('tempType') === 'I') {
    tempCurr.textContent = `${convertToCels(tempCurr.textContent)}°`;
    const digit = findDigitInString(tempFeelsLike.textContent);
    tempFeelsLike.textContent = `${translationObj.feel} ${convertToCels(digit)}°`;
    document.querySelectorAll('.forecast__temp').forEach((day, idx) => {
      day.textContent = `${convertToCels(day.textContent)}°`;
    });
    localStorage.setItem('tempType', 'M');
  }
});

async function getUserLocation() {
  const url = `https://ipinfo.io/json?token=${locationKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function getSearchLocation(query) {
  const lang = localStorage.getItem('lang');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&language=${lang}&key=${geoCodingKey}`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const { geometry, components } = data.results[0];
      const city = `${components.city || components.town || components.village || components.county || components.state || ''}`;
      const { country } = components;
      return { city, country, geometry };
    });
}

function addMarker(location) {
  const coordinates = adjustCoordinates(location);
  marker = new mapboxgl.Marker()
    .setLngLat([coordinates[1], coordinates[0]])
    .addTo(mapObj);
  return marker;
}

// initialize the map
function initMap(location) {
  mapboxgl.accessToken = mapKey;
  const coordinates = adjustCoordinates(location);
  mapObj = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [coordinates[1], coordinates[0]],
    zoom: 9,
  });
  return mapObj;
}

function showMapSearch(location) {
  const coordinates = adjustCoordinates(location);
  mapObj.flyTo({
    center: [coordinates[1], coordinates[0]],
    essential: true,
  });
}

async function fetchTranslation(query, lang) {
  const urlTranslation = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${translationKey}&text=${query}&lang=${lang}`;
  return fetch(urlTranslation)
    .then((response) => response.json())
    .then((translation) => translation.text);
}

async function checkIfTranslationNeeded(word) {
  const lang = localStorage.getItem('lang');
  let wordChecked;
  if (lang === 'en' && isEnglish(word)) {
    wordChecked = word;
  } else {
    wordChecked = await fetchTranslation(word, lang);
  }
  return wordChecked;
}

async function getLocationName(location) {
  const coordinates = adjustCoordinates(location);
  const lang = localStorage.getItem('lang');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${coordinates[0]}+${coordinates[1]}&language=${lang}&key=${geoCodingKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function getCurrentWeather(location) {
  const coordinates = adjustCoordinates(location);
  const unit = localStorage.getItem('tempType');
  const lang = localStorage.getItem('lang');
  const url = `https://api.weatherbit.io/v2.0/current?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=${lang}&units=${unit}&key=${weatherKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function getThreeDaysWeather(location) {
  const coordinates = adjustCoordinates(location);
  const unit = localStorage.getItem('tempType');
  const lang = localStorage.getItem('lang');
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=${lang}&units=${unit}&key=${weatherKey}`;
  return fetch(url)
    .then((response) => response.json());
}

function filterWeatherThreeDays(data) {
  const lang = localStorage.getItem('lang');
  const threeDaysTemp = [];
  const threeWeekdays = {};
  const threeDaysIcons = [];
  data.data.forEach((day, idx) => {
    if (idx !== 0 && idx <= 3) {
      threeDaysTemp.push(day.temp);
      const weekdayNumber = new Date(day.valid_date).getDay();
      const weekdayName = new Date(day.valid_date).toLocaleDateString(lang, { weekday: 'long' });
      threeWeekdays[`idx${weekdayNumber}`] = weekdayName;
      threeDaysIcons.push(day.weather.icon);
    }
  });
  return { threeDaysTemp, threeWeekdays, threeDaysIcons };
}

function splitCoordinates(coordinates) {
  const degreesMinutes = coordinates.map((coord) => {
    coord = Math.round((+coord + Number.EPSILON) * 100) / 100;
    return coord.toString().split('.');
  });
  return degreesMinutes;
}

function translateWithDictionaryObj(translationObj) {
  const wordsToTranslate = document.querySelectorAll('[data-i18n]');
  wordsToTranslate.forEach((word) => {
    if (word.textContent.includes(':')) {
      const wordArray = word.textContent.split(':');
      word.textContent = `${translationObj[word.dataset.i18n]} ${wordArray[1]}`;
    } else {
      let result = translationObj;
      const pathes = word.dataset.i18n.split('.');
      pathes.forEach((path) => {
        result = result[path];
      });
      word.textContent = result;
    }
  });
  document.querySelector('.search__input').placeholder = translationObj.placeholder;
}

async function translateWithAPI() {
  const lang = localStorage.getItem('lang');
  const city = document.querySelector('.location').textContent.split(',')[0];
  const country = document.querySelector('.location').textContent.split(',')[1];
  const cityTranslated = await fetchTranslation(city, lang);
  const countryTranslated = await fetchTranslation(country, lang);
  const placeName = `${cityTranslated}, ${countryTranslated}`;
  document.querySelector('.location').textContent = placeName;
}

document.querySelector('.ru').addEventListener('click', () => {
  localStorage.setItem('lang', 'ru');
  translateWithDictionaryObj(translationRu);
  translateWithAPI();
  const selector = '.ru';
  toggleActiveClass(selector);
});

document.querySelector('.en').addEventListener('click', () => {
  localStorage.setItem('lang', 'en');
  translateWithDictionaryObj(translationEn);
  translateWithAPI();
  const selector = '.en';
  toggleActiveClass(selector);
});

document.querySelector('.be').addEventListener('click', () => {
  localStorage.setItem('lang', 'be');
  translateWithDictionaryObj(translationBe);
  translateWithAPI();
  const selector = '.be';
  toggleActiveClass(selector);
});

function renderWeatherInfo(cityChecked, country, dataWeatherCur, weatherThreeDays, loc, image) {
  const placeName = `${cityChecked}, ${country}`;
  const { threeDaysTemp, threeWeekdays, threeDaysIcons } = filterWeatherThreeDays(weatherThreeDays);
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
  const coordinates = adjustCoordinates(loc);
  const degreesMinutes = splitCoordinates(coordinates);
  document.querySelector('.search__input').placeholder = translationObj.placeholder;
  document.querySelector('.search__btn').textContent = translationObj.search;
  document.querySelector('.lat').textContent = `${translationObj.lat} ${degreesMinutes[0][0]}°${degreesMinutes[0][1] || '00'}'`;
  document.querySelector('.lng').textContent = `${translationObj.lng} ${degreesMinutes[1][0]}°${degreesMinutes[1][1] || '00'}'`;
  document.querySelector('.location').textContent = placeName;
  tempCurr.textContent = `${Math.round(dataWeatherCur.data[0].temp)}°`;
  document.querySelector('.weather-today-descript').textContent = dataWeatherCur.data[0].weather.description;
  document.querySelector('.weather-today-descript').setAttribute('data-i18n', `weather.${dataWeatherCur.data[0].weather.code}`);
  tempFeelsLike.textContent = `${translationObj.feel} ${Math.round(dataWeatherCur.data[0].app_temp)}°`;
  document.querySelector('.weather-today-wind').textContent = `${translationObj.wind} ${Math.round(dataWeatherCur.data[0].wind_spd)} `;
  document.querySelector('.weather-today-humid').textContent = `${translationObj.humidity} ${dataWeatherCur.data[0].rh}%`;
  document.querySelector('.meters-sec').textContent = translationObj.ms;
  document.querySelectorAll('.forecast__day').forEach((day, idx) => {
    const key = Object.keys(threeWeekdays)[idx];
    day.textContent = translationObj.day[key];
    day.setAttribute('data-i18n', `day.${key}`);
  });
  document.querySelectorAll('.forecast__temp').forEach((temp, idx) => {
    temp.textContent = `${Math.round(threeDaysTemp[idx])}°`;
  });
  document.querySelector('#weather-icon-today').style.backgroundImage = `url('${iconsMap[dataWeatherCur.data[0].weather.icon]}')`;
  document.querySelector('#forecast-icon-1').style.backgroundImage = `url('${iconsMap[threeDaysIcons[0]]}')`;
  document.querySelector('#forecast-icon-2').style.backgroundImage = `url('${iconsMap[threeDaysIcons[1]]}')`;
  document.querySelector('#forecast-icon-3').style.backgroundImage = `url('${iconsMap[threeDaysIcons[2]]}')`;
  addActiveClassToLang();
  addActiveClassToTemp();
}

async function getImage(partOfDay) {
  console.log(season, partOfDay);
  const url = 'https://api.unsplash.com/photos/random?orientation=landscape'
    + `&per_page=1&query={${season}, ${partOfDay}}}&client_id=${imageKey}`;
  return fetch(url)
    .then((response) => response.json());
}

async function init() {
  try {
    const hrs = new Date().getHours();
    const partOfDay = definepartOfDay(hrs);
    const lang = localStorage.getItem('lang');
    const { loc, city } = await getUserLocation();
    const { results: [{ components: { country } }] } = await getLocationName(loc);
    const { urls: { regular } } = await getImage(partOfDay);
    const dataWeatherCur = await getCurrentWeather(loc);
    const dataWeatherThreeDays = await getThreeDaysWeather(loc);
    const cityChecked = await checkIfTranslationNeeded(city);
    return {
      cityChecked, country, regular, loc, dataWeatherCur, dataWeatherThreeDays,
    };
  } catch (err) {
    console.log(err.message);
  }
}

async function displayNewWeatherInfo(city, country, coord) {
  try {
    const lang = localStorage.getItem('lang');
    const cityChecked = await checkIfTranslationNeeded(city);
    showMapSearch(coord);
    marker = addMarker(coord);
    const dataWeatherCur = await getCurrentWeather(coord);
    const { timezone } = dataWeatherCur.data[0];
    const timeLocal = defineTimeInSearchPlace(timezone);
    const hrs = timeLocal.slice(0, 2);
    const partOfDay = definepartOfDay(hrs);
    const { urls: { regular } } = await getImage(partOfDay);
    const dataWeatherThreeDays = await getThreeDaysWeather(coord);
    const imgElement = document.createElement('img');
    imgElement.src = regular;
    imgElement.addEventListener('load', () => {
      renderWeatherInfo(cityChecked, country, dataWeatherCur, dataWeatherThreeDays, coord, regular);
      defineDateInSearchPlace(timezone);
      clearInterval(time);
      time = setInterval(defineTimeInSearchPlace, 1000, timezone);
      hideLoading();
    });
  } catch (err) {
    console.log(err.message);
  }
}

recognition.addEventListener('result', async (e) => {
  const recognizedWord = e.results[0][0].transcript;
  document.querySelector('.search__input').value = recognizedWord;
  if (recognizedWord === 'погода') {
    handleSpeechSynth();
  } else if (recognizedWord === 'громче') {
    utterance.volume += 0.5;
  } else if (recognizedWord === 'тише') {
    utterance.volume -= 0.5;
  } else {
    marker.remove();
    showLoading();
    const result = await getSearchLocation(recognizedWord);
    displayNewWeatherInfo(result.city, result.country, result.geometry);
  }
});

async function changeImage() {
  const hrs = document.querySelector('#time').textContent.slice(0, 2);
  const partOfDay = definepartOfDay(hrs);
  const { urls: { regular } } = await getImage(partOfDay);
  document.body.style.backgroundImage = `linear-gradient(rgba(8, 15, 26, 0.6) 0%, rgba(17, 17, 46, 0.5) 100%), url(${regular})`;
}

document.querySelector('.btn--image').addEventListener('click', changeImage);

function searchRandomLocationWeather() {
  mapObj.on('click', async (evt) => {
    const arrCoordinates = Object.values(evt.lngLat).reverse();
    const { results: [{ components: { country, city } }] } = await getLocationName(arrCoordinates);
    marker.remove();
    showLoading();
    displayNewWeatherInfo(city, country, arrCoordinates);
  });
}

// form search
document.querySelector('.search').addEventListener('submit', async (e) => {
  e.preventDefault();
  const keyWord = document.querySelector('.search__input').value;
  if (!keyWord) {
    return;
  }
  marker.remove();
  showLoading();
  const result = await getSearchLocation(keyWord);
  const { city, country, geometry } = result;
  displayNewWeatherInfo(city, country, geometry);
});

window.addEventListener('DOMContentLoaded', () => {
  season = defineSeason();
  init().then((result) => {
    const imgElement = document.createElement('img');
    imgElement.src = result.regular;
    imgElement.addEventListener('load', () => {
      document.body.classList.remove('loading');
      document.querySelector('.header').classList.remove('hidden');
      const {
        cityChecked, country, regular, loc, dataWeatherCur, dataWeatherThreeDays,
      } = result;
      renderWeatherInfo(cityChecked, country, dataWeatherCur, dataWeatherThreeDays, loc, regular);
      getDateInUserLocation();
      getTimeInUserLocation();
      time = setInterval(getTimeInUserLocation, 1000);
      mapObj = initMap(result.loc);
      marker = addMarker(result.loc);
      searchRandomLocationWeather();
    });
  });
});

// TO-DO

// уведомления об ошибках (плюс посмотреть PR) !
// модули
// тесты
// editorsconfig
