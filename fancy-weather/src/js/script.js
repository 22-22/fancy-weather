import { locationKey, imageKey, weatherKey } from '../../api-keys'

async function getLocation() {
    const url = `https://ipinfo.io/json?token=${locationKey}`;
    return fetch(url)
        .then((response) => response.json())
}

async function getWeather(location) {
    const coordinates = location.split(',')
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates[0]}&lon=${coordinates[1]}&lang=ru&units=metric&APPID=a9a3a62789de80865407c0452e9d1c27`;
    // const url = `https://api.openweathermap.org/data/2.5/forecast?q=Minsk&lang=ru&units=metric&APPID=a9a3a62789de80865407c0452e9d1c27`;
    return fetch(url)
        .then((response) => response.json())
        .then(data => {
            const entriesPerDay = 8;
            const daysToDisplay = 3;
            const entriesToCheck = entriesPerDay * daysToDisplay;
            const dataDaily = data.list.filter((entry, idx) => {
                if (idx < entriesToCheck) {
                    return entry.dt_txt.includes('18:00:00');
                }
            });
            const dataNow = data.list[0];
            console.log(dataNow)
        })
}

function getImage() {
    const url = `https://api.unsplash.com/photos/random?orientation=landscape`
        + `&per_page=1&query=nature&client_id=${imageKey}`;
    fetch(url)
        .then((response) => response.json())
        .then((data) => document.body.style.backgroundImage = `url(${data.urls.regular})`);
}

function getTimeNow() {
    let date = new Date();
    let timeNow = date.toLocaleTimeString();
    document.querySelector('#time').innerHTML = timeNow;
}

function getDay() {
    const options = { weekday: 'short', month: 'long', day: 'numeric' };
    let day = new Date().toLocaleDateString('en-us', options);
    document.querySelector('#day').innerHTML = day;
}

window.addEventListener('DOMContentLoaded', () => {
    getDay();
    getTimeNow();
})

setInterval(getTimeNow, 1000);

async function init() {
    try {
        const { loc, city } = await getLocation();
        const { current } = await getWeather(loc);
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