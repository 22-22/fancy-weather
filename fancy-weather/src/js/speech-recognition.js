
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let isRecognizing = false;

const recognition = new SpeechRecognition();

function startListening() {
  recognition.start();
}

document.querySelector('.search__mic').addEventListener('click', () => {
  isRecognizing = !isRecognizing;
  if (isRecognizing) {
    recognition.start();
    recognition.addEventListener('end', startListening);
    document.querySelector('.search__mic').classList.add('scaled');
  } else {
    recognition.removeEventListener('end', startListening);
    recognition.stop();
    document.querySelector('.search__mic').classList.remove('scaled');
  }
});

export default recognition;
