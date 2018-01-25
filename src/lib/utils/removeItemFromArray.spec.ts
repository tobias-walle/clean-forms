import { removeItemFromArray } from './removeItemFromArray';

describe('removeItemFromArray', () => {
  it('should remove item from array', () => {
    const array = [1, 2, 3];

    removeItemFromArray(array, 2);

    expect(array).toEqual([1, 3]);
  });
});
