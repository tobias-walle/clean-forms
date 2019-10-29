import { combineProps } from './combineProps';

describe('combineProps', () => {
  it('should combine props with callbacks', () => {
    const p1 = {
      a: 1,
      b: 2,
      c: jest.fn(),
      d: jest.fn(),
    };
    const p2 = {
      b: 3,
      c: jest.fn(),
    };

    const p = combineProps(p1, p2);

    expect(p).toEqual({
      a: 1,
      b: 3,
      c: expect.any(Function),
      d: expect.any(Function),
    });
    p.c('Hello');
    p.d('Test');
    expect(p1.c).toHaveBeenCalledWith('Hello');
    expect(p1.d).toHaveBeenCalledWith('Test');
    expect(p2.c).toHaveBeenCalledWith('Hello');
  });
});
