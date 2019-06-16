import { path } from '../models/Path';
import { selectDeep } from './selectDeep';

describe('selectDeep', () => {
  it('should select an property of an object by the path', () => {
    const object = { a: { b: { c: 123 } } };
    const p = path<typeof object>().a.b.c;

    const result = selectDeep({object, path: p});

    expect(result).toBe(123);
  });

  it('should select an property of an object by the path with a length of 1', () => {
    const object = { a: { b: { c: 123 } } };
    const p = path<typeof object>().a;

    const result = selectDeep({object, path: p});

    expect(result).toEqual({ b: { c: 123 } });
  });

  it('should return the object if the path has a length of 0', () => {
    const object = { a: { b: { c: 123 } } };
    const p = path<typeof object>();

    const result = selectDeep({object, path: p});

    expect(result).toBe(object);
  });

  it('should throw an error if the path does not exist', () => {
    const object = { a: { b: { c: 123 } } };
    const p = path<any>().b;

    expect(() => selectDeep({object, path: p})).toThrowErrorMatchingSnapshot();
  });

  it('should not throw an error if the path does not exist and assert is set to false', () => {
    const object = { a: { b: { c: 123 } } };
    const p = path<any>().b.c;

    const result = selectDeep({object, path: p, assert: false});

    expect(result).toBeUndefined();
  });

  it('should select next object with "getNext"', () => {
    const object = { a: { children: { c: 123 } } };
    const p = path<any>().a.c;

    const result = selectDeep({ object, path: p, getNext: obj => obj.children || obj });

    expect(result).toBe(123);
  });

});
