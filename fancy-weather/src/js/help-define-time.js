import translationBe from './translation-be.json';

function defineSeason() {
  const seasonIdx = new Date().getMonth();
  const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];
  return seasons[seasonIdx];
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

function setDate(dateNow, weekdayShort, weekdayShortNumber, month, monthNumber) {
  const lang = localStorage.getItem('lang');
  document.querySelector('#month').setAttribute('data-i18n', `month.idx${monthNumber}`);
  document.querySelector('#weekdayShort').setAttribute('data-i18n', `dayShort.idx${weekdayShortNumber}`);
  if (lang === 'be') {
    const monthKey = `idx${monthNumber}`;
    const weekdayShortKey = `idx${weekdayShortNumber}`;
    document.querySelector('#month').innerHTML = translationBe.month[monthKey];
    document.querySelector('#weekdayShort').innerHTML = translationBe.dayShort[weekdayShortKey];
  } else {
    document.querySelector('#month').innerHTML = month;
    document.querySelector('#weekdayShort').innerHTML = weekdayShort;
  }
  document.querySelector('#date').innerHTML = dateNow;
}

function getDateInUserLocation() {
  const lang = localStorage.getItem('lang');
  const weekdayShort = new Date().toLocaleDateString(lang, { weekday: 'short' });
  const month = new Date().toLocaleDateString(lang, { month: 'long' });
  const dateNow = new Date().toLocaleDateString(lang, { day: 'numeric' });
  const monthNumber = new Date().getMonth();
  const weekdayShortNumber = new Date().getDay();
  setDate(dateNow, weekdayShort, weekdayShortNumber, month, monthNumber);
}

function getTimeInUserLocation() {
  const date = new Date();
  const timeNow = date.toLocaleTimeString();
  document.querySelector('#time').innerHTML = timeNow;
  return timeNow;
}

function defineTimeInSearchPlace(timezone) {
  const lang = localStorage.getItem('lang');
  const date = new Date();
  const localTime24 = date.toLocaleTimeString(lang, { timeZone: timezone, hour12: false });
  document.querySelector('#time').innerHTML = localTime24;
  return localTime24;
}

function defineDateInSearchPlace(timezone) {
  const lang = localStorage.getItem('lang');
  const dateNow = new Date().toLocaleDateString(lang, { day: 'numeric', timeZone: timezone });
  const weekdayShort = new Date().toLocaleDateString(lang, { weekday: 'short', timeZone: timezone });
  const weekdayShortNumber = new Date().toLocaleDateString(lang, { day: 'numeric', timeZone: timezone });
  const month = new Date().toLocaleDateString(lang, { month: 'long', timeZone: timezone });
  // toLocaleDateString() returns a human month number
  const monthNumber = new Date().toLocaleDateString(lang, { month: 'numeric', timeZone: timezone }) - 1;
  setDate(dateNow, weekdayShort, weekdayShortNumber, month, monthNumber);
}


export {
  defineSeason, getTimeInUserLocation, getDateInUserLocation,
  definepartOfDay, defineTimeInSearchPlace,
  defineDateInSearchPlace,
};
