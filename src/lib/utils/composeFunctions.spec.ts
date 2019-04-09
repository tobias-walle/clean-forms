import { composeFunctions } from './composeFunctions';

describe('composeFunctions', () => {
  it('should compose functions', () => {
    const f1 = jest.fn();
    const f2 = jest.fn();

    const f3 = composeFunctions(f1, f2);
    f3(0);

    expect(f1).toHaveBeenCalledWith(0);
    expect(f2).toHaveBeenCalledWith(0);
  });
});
