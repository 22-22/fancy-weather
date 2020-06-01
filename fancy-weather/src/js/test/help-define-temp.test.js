import { convertToCels, convertToFahr, findDigitInString } from '../help-define-temp';

describe('convertToCels', () => {
  it('should return a number', () => {
    expect(convertToCels(55)).not.toBeNaN();
  });
  it('should return a correct result', () => {
    expect(convertToCels(50)).toBe(10);
  });
});

describe('convertToFahr', () => {
  it('should return a correct result', () => {
    expect(convertToFahr(14)).toEqual(57);
  });
});

describe('findDigitInString', () => {
  it('should return a correct result', () => {
    expect(findDigitInString('jjj')).toBeDefined();
  });
  it('should return a correct result', () => {
    expect(findDigitInString('jjj123')).toContainEqual('123');
  });
  it('should return a correct result', () => {
    expect(findDigitInString('jjj')).toBeFalsy();
  });
});
