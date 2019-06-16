import { path } from '../models/Path';
import { getByPath } from './getByPath';

describe('getByPath', () => {
  it('should return value if found', () => {
    expect(getByPath({ a: { b: 1 } }, path<any>().a.b)).toBe(1);
    expect(getByPath({ a: [2] }, path<any>().a[0])).toBe(2);
    expect(getByPath({ a: 3 }, path<any>().a)).toBe(3);
    expect(getByPath({ a: { b: '' } }, path<any>().a)).toEqual({ b: '' });
  });

  it('should return undefined if not found', () => {
    expect(getByPath({ a: 0 }, path<any>().a.b)).toBe(undefined);
    expect(getByPath({ a: [] }, path<any>().a[0])).toBe(undefined);
    expect(getByPath({ a: {} }, path<any>().a.b)).toBe(undefined);
  });
});
