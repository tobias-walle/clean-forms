import { Path } from './FieldRegister';
import { getParentPath } from './getParentPath';

describe('getParentPath', () => {
  it('should get parent', () => {
    const path = ['a', 'b', 'c'];
    const expectedParent = ['a', 'b'];

    const result = getParentPath(path);

    expect(result).toEqual(expectedParent);
  });

  it('should throw error if path has a size of 1', () => {
    const path = ['a'];

    expect(() => getParentPath(path)).toThrowErrorMatchingSnapshot();
  });

  it('should throw error if path is empty', () => {
    const path: Path = [];

    expect(() => getParentPath(path)).toThrowErrorMatchingSnapshot();
  });
});
