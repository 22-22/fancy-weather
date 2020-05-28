import displayNewWeatherInfo from './script';

window.SpeechRecognition = window.SpeechRecognition
  || window.webkitSpeechRecognition;

let isRecognizing = false;

const recognition = new SpeechRecognition();
recognition.addEventListener('result', (e) => {
  const recognizedWord = e.results[0][0].transcript;
  document.querySelector('.search__input').value = recognizedWord;
  displayNewWeatherInfo(recognizedWord);
});

function startListening() {
  recognition.start();
}

document.querySelector('.search__mic').addEventListener('click', () => {
  isRecognizing = !isRecognizing;
  if (isRecognizing) {
    recognition.start();
    recognition.addEventListener('end', startListening);
    document.querySelector('.search__mic').style.transform = 'scale(1.2)';
  } else {
    recognition.removeEventListener('end', startListening);
    recognition.stop();
    document.querySelector('.search__mic').style.transform = 'scale(0.8)';
  }
});

export default recognition;
