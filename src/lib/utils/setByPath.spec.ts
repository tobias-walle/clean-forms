import { setByPath } from './setByPath';

describe('setByPath', () => {
  it('should set if path exists', () => {
    expect(setByPath({ a: { b: 0 } }, 'a.b', 1)).toEqual({ a: { b: 1 } });
    expect(setByPath({ a: { b: 0 } }, 'a', 2)).toEqual({ a: 2 });
    expect(setByPath({ a: [0] }, 'a.0', 3)).toEqual({ a: [3] });
  });

  it('should throw error if path does not exists', () => {
    expect(
      setByPath({ a: { b: 0 } }, 'a.b.c', 1)
    ).toThrowErrorMatchingInlineSnapshot(`"received is not a function"`);
    expect(setByPath({ a: [] }, 'a.b', 1)).toThrowErrorMatchingInlineSnapshot(
      `"received is not a function"`
    );
    expect(setByPath({}, 'a.b', 1)).toThrowErrorMatchingInlineSnapshot(
      `"received is not a function"`
    );
    expect(setByPath({}, 'a', 1)).toThrowErrorMatchingInlineSnapshot(
      `"received is not a function"`
    );
  });
});
