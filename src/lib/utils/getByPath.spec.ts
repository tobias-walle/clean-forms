import { getByPath } from './getByPath';

describe('getByPath', () => {
  it('should return value if found', () => {
    expect(getByPath({ a: { b: 1 } }, 'a.b')).toBe(1);
    expect(getByPath({ a: [2] }, 'a.0')).toBe(2);
    expect(getByPath({ a: 3 }, 'a')).toBe(3);
    expect(getByPath({ a: { b: '' } }, 'a')).toEqual({ b: '' });
  });

  it('should return undefined if not found', () => {
    expect(getByPath({ a: 0 }, 'a.b')).toBe(undefined);
    expect(getByPath({ a: [] }, 'a.0')).toBe(undefined);
    expect(getByPath({ a: {} }, 'a.b')).toBe(undefined);
  });
});
