import { isShallowEqual } from './isShallowEqual';

describe('isShallowEqual', () => {
  it('it should check if objects are equal', () => {
    expect(isShallowEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(isShallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isShallowEqual({ a: 1 }, { a: 1, b: 1 })).toBe(false);
    expect(isShallowEqual({ a: 1 }, { b: 1 })).toBe(false);
    expect(isShallowEqual({ a: 1, c: 2 }, { a: 1, c: 2 })).toBe(true);
    expect(isShallowEqual({ a: 1, c: 2 }, { a: true, c: 2 })).toBe(false);
  });
});
