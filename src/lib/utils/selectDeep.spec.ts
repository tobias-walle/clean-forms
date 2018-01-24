import { selectDeep } from './selectDeep';

describe('selectDeep', () => {
  it('should select an property of an object by the path', () => {
    const object = { a: { b: { c: 123 } } };
    const path = ['a', 'b', 'c'];

    const result = selectDeep(object, path);

    expect(result).toBe(123);
  });

  it('should select an property of an object by the path with a length of 1', () => {
    const object = { a: { b: { c: 123 } } };
    const path = ['a'];

    const result = selectDeep(object, path);

    expect(result).toEqual({ b: { c: 123 } });
  });

  it('should return the object if the path has a length of 0', () => {
    const object = { a: { b: { c: 123 } } };
    const path: string[] = [];

    const result = selectDeep(object, path);

    expect(result).toBe(object);
  });

  it('should throw an error if the path does not exist', () => {
    const object = { a: { b: { c: 123 } } };
    const path = ['b'];

    expect(() => selectDeep(object, path)).toThrowErrorMatchingSnapshot();
  });
});
