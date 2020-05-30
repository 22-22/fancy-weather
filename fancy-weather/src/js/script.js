import {
  locationKey, imageKey, weatherKey, geoCodingKey, mapKey, translationKey,
} from '../../api-keys';
import iconsMap from './iconsMap';
import translationBe from './translation-be.json';
import translationRu from './translation-ru.json';
import translationEn from './translation-en.json';
import recognition from './speech-recognition';
import utterance from './speechSynthesis';

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

function defineSeason() {
  const seasonIdx = Math.floor(((new Date().getMonth() / 12) * 4)) % 4;
  const seasons = ['winter', 'spring', 'summer', 'autumn'];
  return seasons[seasonIdx];
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

  document.querySelector('.btn--fahr').style.background = 'rgba(174, 181, 185, 0.5)';
  document.querySelector('.btn--cels').style.background = 'rgba(76, 82, 85, 0.4)';
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

  document.querySelector('.btn--fahr').style.background = 'rgba(76, 82, 85, 0.4)';
  document.querySelector('.btn--cels').style.background = 'rgba(174, 181, 185, 0.5)';
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
  const threeDaysWeekdays = {};
  const threeDaysIcons = [];
  data.data.forEach((day, idx) => {
    if (idx !== 0 && idx <= 3) {
      threeDaysTemp.push(day.temp);
      const weekdayNumber = new Date(day.valid_date).getDay();
      const weekdayName = new Date(day.valid_date).toLocaleDateString(lang, { weekday: 'long' });
      threeDaysWeekdays[`idx${weekdayNumber}`] = weekdayName;
      threeDaysIcons.push(day.weather.icon);
    }
  });
  return { threeDaysTemp, threeDaysWeekdays, threeDaysIcons };
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

document.querySelector('#ru').addEventListener('click', () => {
  localStorage.setItem('lang', 'ru');
  translateWithDictionaryObj(translationRu);
  translateWithAPI();
  // document.querySelector('.lang-active').textContent = 'Ru';
});

document.querySelector('#en').addEventListener('click', () => {
  localStorage.setItem('lang', 'en');
  translateWithDictionaryObj(translationEn);
  translateWithAPI();
  // document.querySelector('.lang-active').textContent = 'En';
});
document.querySelector('#be').addEventListener('click', () => {
  localStorage.setItem('lang', 'be');
  translateWithDictionaryObj(translationBe);
  translateWithAPI();
  // document.querySelector('.lang-active').textContent = 'Be';
});


function renderWeatherInfo(cityTranslated, country, dataWeatherCurrent, weatherThreeDays, location, image) {
  const placeName = `${cityTranslated}, ${country}`;

  const { threeDaysTemp, threeDaysWeekdays, threeDaysIcons } = filterWeatherThreeDays(weatherThreeDays);

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

  const coordinates = adjustCoordinates(location);
  const degreesMinutes = splitCoordinates(coordinates);

  document.querySelector('.search__input').placeholder = translationObj.placeholder;
  document.querySelector('.search__btn').textContent = translationObj.search;

  document.querySelector('.lat').textContent = `${translationObj.lat} ${degreesMinutes[0][0]}°${degreesMinutes[0][1] || '00'}'`;
  document.querySelector('.lng').textContent = `${translationObj.lng} ${degreesMinutes[1][0]}°${degreesMinutes[1][1] || '00'}'`;

  document.querySelector('.location').textContent = placeName;
  tempCurr.textContent = `${Math.round(dataWeatherCurrent.data[0].temp)}°`;
  document.querySelector('.weather-today-descript').textContent = dataWeatherCurrent.data[0].weather.description;
  document.querySelector('.weather-today-descript').setAttribute('data-i18n', `weather.${dataWeatherCurrent.data[0].weather.code}`);
  tempFeelsLike.textContent = `${translationObj.feel} ${Math.round(dataWeatherCurrent.data[0].app_temp)}°`;
  document.querySelector('.weather-today-wind').textContent = `${translationObj.wind} ${Math.round(dataWeatherCurrent.data[0].wind_spd)} `;
  document.querySelector('.weather-today-humid').textContent = `${translationObj.humidity} ${dataWeatherCurrent.data[0].rh}%`;
  document.querySelector('.meters-sec').textContent = translationObj.ms;

  document.querySelectorAll('.forecast__day').forEach((day, idx) => {
    const key = Object.keys(threeDaysWeekdays)[idx];
    day.textContent = translationObj.day[key];
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

async function getImage(partOfDay) {
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

  const monthNumber = new Date().getMonth();
  document.querySelector('#month').setAttribute('data-i18n', `month.idx${monthNumber}`);

  const weekdayShortNumber = new Date().getDay();
  document.querySelector('#weekdayShort').setAttribute('data-i18n', `dayShort.idx${weekdayShortNumber}`);

  // return dateNow;
}

function definepartOfDay(hrs) {
  let partOfDay;
  if (hrs >= 6 && hrs < 12) {
    partOfDay = 'morning';
  } else if (hrs >= 12 && hrs < 18) {
    partOfDay = 'day';
  } else if (hrs >= 18 && hrs <= 24) {
    partOfDay = 'evening';
  } else if (hrs >= 0 && hrs < 6) {
    partOfDay = 'night';
  }
  return partOfDay;
}

async function init() {
  try {
    const hrs = new Date().getHours();
    const partOfDay = definepartOfDay(hrs);
    const lang = localStorage.getItem('lang');

    const { loc, city } = await getUserLocation();
  
    const { results: [{ components: { country } }] } = await getLocationName(loc);

    const [{ urls: { regular } }, dataWeatherCurrent, dataWeatherThreeDays] = await Promise.all([getImage(partOfDay),
      getCurrentWeather(loc),
      getThreeDaysWeather(loc),      
    ]);

    const cityTranslated = await checkIfTranslationNeeded(city);
    
    return {
      cityTranslated, country, regular, loc, dataWeatherCurrent, dataWeatherThreeDays,
    };
  } catch (err) {
    console.log(err);
  }
}

function defineLocalTime(timezone) {
  const lang = localStorage.getItem('lang');
  const date = new Date();
  const localTime24 = date.toLocaleTimeString(lang, { timeZone: timezone, hour12: false });
  return localTime24;
}

function renderLocalTime(time24) {
  const regexp = new RegExp('^24');
  if (regexp.test(time24)) {
    const time24Fixed = time24.split(':');
    time24Fixed[0] = '00';
    document.querySelector('#time').innerHTML = time24Fixed.join(':');
  } else {
    document.querySelector('#time').innerHTML = time24;
  }
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
async function displayNewWeatherInfo(city, country, geometry) {
  try {
    const lang = localStorage.getItem('lang');
    const cityTranslated = await checkIfTranslationNeeded(city);
    
    showMapSearch(geometry);
    marker = addMarker(geometry);

    const dataWeatherCurrent = await getCurrentWeather(geometry);
    const { timezone } = dataWeatherCurrent.data[0];

    const timeLocal = defineLocalTime(timezone);
    const hrs = timeLocal.slice(0, 2);
    const partOfDay = definepartOfDay(hrs);

    const { urls: { regular } } = await getImage(partOfDay);
    const dataWeatherThreeDays = await getThreeDaysWeather(geometry);

    const imgElement = document.createElement('img');
    imgElement.src = regular;
    imgElement.addEventListener('load', () => {
      renderWeatherInfo(cityTranslated, country, dataWeatherCurrent, dataWeatherThreeDays, geometry, regular);
      defineLocalDate(timezone);
      clearInterval(time);
      renderLocalTime(timeLocal);
      time = setInterval(defineLocalTime, 1000, timezone);
    });
  } catch (err) {
    console.log(err);
  }
}

async function changeImage() {
  const hrs = document.querySelector('#time').textContent.slice(0, 2);
  const partOfDay = definepartOfDay(hrs);
  const { urls: { regular } } = await getImage(partOfDay);
  document.body.style.backgroundImage = `linear-gradient(rgba(8, 15, 26, 0.6) 0%, rgba(17, 17, 46, 0.5) 100%), url(${regular})`;
}

function searchRandomLocationWeather() {
  mapObj.on('click', async (evt) => {
    const arrCoordinates = Object.values(evt.lngLat).reverse();
    const { results: [{ components: { country, city } }] } = await getLocationName(arrCoordinates);
    console.log(marker)
    marker.remove();
    displayNewWeatherInfo(city, country, arrCoordinates);
  });
}

document.querySelector('.btn--image').addEventListener('click', changeImage);

// form search
document.querySelector('.search').addEventListener('submit', async (e) => {
  e.preventDefault();
  const keyWord = document.querySelector('.search__input').value;
  marker.remove();
  const result = await getSearchLocation(keyWord);
  displayNewWeatherInfo(result.city, result.country, result.geometry);
});

window.addEventListener('DOMContentLoaded', () => {
  season = defineSeason();
  init().then((result) => {
    const imgElement = document.createElement('img');
    imgElement.src = result.regular;
    imgElement.addEventListener('load', () => {
      document.body.classList.remove('loading');
      document.querySelector('.header').classList.remove('hidden');
      renderWeatherInfo(result.cityTranslated, result.country, result.dataWeatherCurrent, result.dataWeatherThreeDays, result.loc, result.regular);
      getDate();
      getTime();
      time = setInterval(getTime, 1000);
      mapObj = initMap(result.loc);
      marker = addMarker(result.loc);
      searchRandomLocationWeather();
    });
  });
});



// TO-DO

// renderToDOM +
// Icons +
// save lang & temp type +
// фоновое изображение генерируется с учётом поры года и времени суток указанного в поле поиска населённого пункта +

// отображение часов в часовом поясе +
// внешний вид (классы) +

// promise all +
// loader +
// перевод +

// если на бел, при поиске и зарузке надо подтягивать дни недели +
// переводить название города +

// уведомления об ошибках (плюс посмотреть PR) !
// закончить speech
// модули 
// тесты
// editorsconfig

export default displayNewWeatherInfo;
