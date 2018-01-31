import { getPathHead, getPathHeadAsNumber } from './getPathHead';

describe('getPathHead', () => {
  it('should get path head', () => {
    expect(getPathHead('a.b')).toBe('b');
  });

  it('should throw error if path is empty', () => {
    expect(() => getPathHead('')).toThrowErrorMatchingSnapshot();
  });
});

describe('getPathHeadAsNumber', () => {
  it('should get path head as number', () => {
    expect(getPathHeadAsNumber('a.0')).toBe(0);
  });

  it('should throw error if path cannot be a number', () => {
    expect(() => getPathHeadAsNumber('a')).toThrowErrorMatchingSnapshot();
  });
});
