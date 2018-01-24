import { updateDeep } from './updateDeep';

describe('updateDeep', () => {
  it('should deep update an object without modifying the original', () => {
    const original = { a: { b: { c: 1 } } };
    const path = ['a', 'b', 'c'];
    const value = 2;

    const newObject = updateDeep(original, path, value);

    expect(original).toEqual({ a: { b: { c: 1 } } });
    expect(newObject).toEqual({ a: { b: { c: 2 } } });
  });

  it('should deep update an object with a path of 1', () => {
    const original = { a: { b: { c: 1 } } };
    const path = ['a'];
    const value = 2;

    const newObject = updateDeep(original, path, value);

    expect(original).toEqual({ a: { b: { c: 1 } } });
    expect(newObject).toEqual({ a: 2 });
  });

  it('should throw an error if the path is 0', () => {
    const original = { a: { b: { c: 1 } } };
    const path: string[] = [];
    const value = 2;

    expect(() => updateDeep(original, path, value)).toThrowErrorMatchingSnapshot();
  });

  it('should throw an error if the path is invalid', () => {
    const original = { a: { b: { c: 1 } } };
    const path = ['b'];
    const value = 2;

    expect(() => updateDeep(original, path, value)).toThrowErrorMatchingSnapshot();
  });
});
