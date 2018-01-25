import { updateDeep } from './updateDeep';

describe('updateDeep', () => {
  it('should deep update an object without modifying the original', () => {
    const original = { a: { b: { c: 1 } } };
    const path = ['a', 'b', 'c'];
    const value = 2;

    const newObject = updateDeep({object: original, path, value});

    expect(original).toEqual({ a: { b: { c: 1 } } });
    expect(newObject).toEqual({ a: { b: { c: 2 } } });
  });

  it('should deep update an object with a path of 1', () => {
    const original = { a: { b: { c: 1 } } };
    const path = ['a'];
    const value = 2;

    const newObject = updateDeep({object: original, path, value});

    expect(original).toEqual({ a: { b: { c: 1 } } });
    expect(newObject).toEqual({ a: 2 });
  });

  it('should throw an error if the path is 0', () => {
    const original = { a: { b: { c: 1 } } };
    const path: string[] = [];
    const value = 2;

    expect(() => updateDeep({object: original, path, value})).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error if the path is invalid', () => {
    const original = { a: { b: { c: 1 } } };
    const path = ['b'];
    const value = 2;

    expect(() => updateDeep({object: original, path, value})).toThrowErrorMatchingSnapshot();
  });

  it('should not throw an error if the path is invalid but assert is set to false', () => {
    const original = { a: { b: { c: 1 } } };
    const path = ['b', 'c'];
    const value = 2;

    const result = updateDeep({object: original, path, value, assert: false});

    expect(result).toEqual({ a: { b: { c: 1 } }, b: { c: 2 } });
  });
});
