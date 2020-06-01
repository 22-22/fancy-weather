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

export { convertToCels, convertToFahr, findDigitInString };
