const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();
utterance.volume = 0.7;

const startBtn = document.querySelector('.btn--voice');
let voices = [];

function populateVoices() {
  voices = synth.getVoices();
  return voices;
}

function setVoice() {
  utterance.voice = voices.find((voice) => {
    if (localStorage.getItem('lang') === 'en') {
      return voice.lang.includes('en-GB');
    }
    return voice.lang.includes('ru');
  });
}

function toggleSpeech() {
  if (synth.speaking) {
    synth.cancel();
  } else {
    synth.speak(utterance);
  }
}

function getTextToSay() {
  const phrasesToSay = [];
  const elementsToSay = document.querySelectorAll('[data-voice]');
  elementsToSay.forEach((el) => phrasesToSay.push(el.textContent));
  utterance.text = phrasesToSay;
}

function handleSpeechSynth() {
  setVoice();
  getTextToSay();
  toggleSpeech();
}
synth.addEventListener('voiceschanged', populateVoices);

startBtn.addEventListener('click', handleSpeechSynth);

export { utterance, handleSpeechSynth };
