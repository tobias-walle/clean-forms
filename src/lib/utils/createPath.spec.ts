import { createPath } from './createPath';

describe('createPath', () => {
  it('should create a path', () => {
    const path = createPath(['group1'], 'name');
    expect(path).toEqual(['group1', 'name']);
  });

  it('should create a path without groups', () => {
    const path = createPath(undefined, 'name');
    expect(path).toEqual(['name']);
  });

  it('should create a path without name', () => {
    const path = createPath(['group1'], null);
    expect(path).toEqual(['group1']);
  });
});