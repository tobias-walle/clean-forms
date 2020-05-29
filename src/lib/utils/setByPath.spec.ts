import { setByPath } from './setByPath';

describe('setByPath', () => {
  it('should set deep value', () => {
    expect(setByPath({ a: { b: 0 } }, 'a.b', 1)).toEqual({ a: { b: 1 } });
    expect(setByPath({ a: { b: 0 } }, 'a', 2)).toEqual({ a: 2 });
    expect(setByPath({ a: [0] }, 'a.0', 3)).toEqual({ a: [3] });
    expect(setByPath({}, 'a.b.c', 3)).toEqual({ a: { b: { c: 3 } } });
  });
});
