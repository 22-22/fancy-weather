import { locationKey, imageKey } from '../../api-keys'

function getLocation() {
    const url = `https://ipinfo.io/json?token=${locationKey}`;
    fetch(url)
        .then((response) => response.json())
        .then(data => console.log(data))
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


getLocation();
// getImage();


// function getTimeFromPageLoad() {
//     getTime();
//     setInterval(getTime, 1000);
// }
// getTimeFromPageLoad()