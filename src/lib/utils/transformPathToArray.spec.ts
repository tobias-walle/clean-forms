import { transformPathToArray } from './transformPathToArray';

describe('transformPathToArray', () => {
  it('should convert a path to an array', () => {
    expect(transformPathToArray('a.b.c')).toEqual(['a', 'b', 'c']);
  });
  it('should convert an empty path to an array', () => {
    expect(transformPathToArray('')).toEqual([]);
  });
});
