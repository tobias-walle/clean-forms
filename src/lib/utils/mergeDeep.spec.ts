import { mergeDeep } from './mergeDeep';

describe('mergeDeep', () => {
  it('should merge two flat objects', () => {
    const o1 = { a: 123 };
    const o2 = { b: 321 };

    const result = mergeDeep(o1, o2);

    expect(result).toEqual({
      a: 123,
      b: 321,
    });
  });

  it('should merge two nested objects', () => {
    const o1 = {
      a: {
        b: {
          c: 1,
          d: 2
        },
        e: 3
      }
    };
    const o2 = {
      a: {
        b: {
          c: 2
        },
        e: 1,
        f: {
          g: 4,
          h: {
            i: 5
          }
        }
      }
    };

    const result = mergeDeep(o1, o2);

    expect(o1).toEqual({
      a: {
        b: {
          c: 1,
          d: 2
        },
        e: 3
      }
    });
    expect(o2).toEqual({
      a: {
        b: {
          c: 2
        },
        e: 1,
        f: {
          g: 4,
          h: {
            i: 5
          }
        }
      }
    });
    expect(result).toEqual({
      a: {
        b: {
          c: 2,
          d: 2
        },
        e: 1,
        f: {
          g: 4,
          h: {
            i: 5
          }
        }
      }
    });
  });
});
