import { delay } from '../../testUtils/delay';
import { createDebouncedFunction } from './createDebouncedFunction';

describe('createDebouncedFunction', () => {
  it('should debounce the execution', async () => {
    const myFunction = jest.fn();
    const debouncedFunction = createDebouncedFunction(myFunction, 100);

    debouncedFunction();

    expect(myFunction).not.toBeCalled();

    await delay(10);
    debouncedFunction();
    expect(myFunction).not.toBeCalled();

    await delay(100);

    expect(myFunction).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments', async () => {
    const myFunction: (a: number, b: string) => void = jest.fn();
    const debouncedFunction = createDebouncedFunction(myFunction, 100);

    debouncedFunction(123, 'test');

    await delay(100);

    expect(myFunction).toHaveBeenCalledWith(123, 'test');
  });
});
