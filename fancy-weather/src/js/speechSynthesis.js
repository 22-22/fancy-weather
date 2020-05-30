const utterance = new SpeechSynthesisUtterance();
// const voices = [];
const startBtn = document.querySelector('.voice-btn');

const phrasesToSay = [];

function populateVoices() {
  const voices = this.getVoices();
  console.log(voices);
}

startBtn.addEventListener('click', () => {
  const elementsToSay = document.querySelectorAll('[data-voice]');

  elementsToSay.forEach((el) => phrasesToSay.push(el.textContent));

  utterance.text = phrasesToSay;

  // console.log(utterance)
  speechSynthesis.speak(utterance);
});
speechSynthesis.addEventListener('voiceschanged', populateVoices);

export default utterance;
