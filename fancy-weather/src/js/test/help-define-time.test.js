import { defineSeason, definepartOfDay } from '../help-define-time';

describe('defineSeason', () => {
  it('should return result', () => {
    expect(defineSeason()).toBeDefined();
  });
  it('should return a string in English', () => {
    expect(defineSeason()).toMatch(/[a-z]/i);
  });
});

describe('definepartOfDay', () => {
  it('should return result with a correct parameter passed', () => {
    expect(definepartOfDay(5)).toBeTruthy();
  });
  it('should return undefined with a wrong parameter', () => {
    expect(definepartOfDay(25)).toBeUndefined();
  });
  it('should make correct calculations', () => {
    expect(definepartOfDay(5)).toEqual('night');
  });
});
