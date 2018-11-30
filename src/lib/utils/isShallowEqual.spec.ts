import { arePropertiesShallowEqual, isShallowEqual } from './isShallowEqual';

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

describe('arePropertiesShallowEqual', () => {
  it('should check if all properties are shallow equal', () => {
    expect(arePropertiesShallowEqual(['a'], { a: { a: 1 } }, { a: { a: 1 } })).toBe(true);
    expect(arePropertiesShallowEqual(['a'], { a: { a: 2 } }, { a: { a: 1 } })).toBe(false);
    expect(arePropertiesShallowEqual(['a'], { a: { a: 1 }, b: { b: 1 } }, { a: { a: 1 }, b: { b: 2 } })).toBe(true);
    expect(arePropertiesShallowEqual(['a', 'b'], { a: { a: 1 }, b: { b: 1 } }, {
      a: { a: 1 },
      b: { b: 2 }
    })).toBe(false);
    expect(arePropertiesShallowEqual(['a'], {}, { a: { a: 1 } })).toBe(false);
    expect(arePropertiesShallowEqual(['a'], { a: { a: 1 } }, {})).toBe(false);
    expect(arePropertiesShallowEqual(['a'], { a: null }, { a: null })).toBe(true);
  });
});
