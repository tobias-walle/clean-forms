import { delay } from '../../testUtils/delay';
import { asPath, getPathAsString, getPathSegments, path } from '../models/Path';
import { FieldRegister } from './FieldRegister';

describe('FieldRegister', () => {
  let fieldRegister: FieldRegister;

  beforeEach(() => {
    fieldRegister = new FieldRegister();
  });

  it('should register and unregister new paths', () => {
    fieldRegister.register(asPath('path1'));
    fieldRegister.register(asPath('path2'));
    fieldRegister.register(asPath('path3'));

    expect(fieldRegister.paths.map(getPathAsString)).toEqual(['path1', 'path2', 'path3']);

    fieldRegister.unregister(asPath('path2'));

    expect(fieldRegister.paths.map(getPathAsString)).toEqual(['path1', 'path3']);
  });

  it('should trigger callback on changes', async () => {
    const DEBOUNCE_TIME = 10;
    const listener = jest.fn();
    const path1 = asPath('path1');
    const path2 = asPath('path2');
    const path3 = asPath('path3');

    fieldRegister.addListener(listener);
    fieldRegister.register(path1);
    fieldRegister.register(path2);
    fieldRegister.register(path3);
    await delay(DEBOUNCE_TIME);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].registered.map(getPathAsString)).toEqual([path1, path2, path3].map(getPathAsString));
    expect(listener.mock.calls[0][0].unregistered.map(getPathAsString)).toEqual([].map(getPathAsString));

    fieldRegister.unregister(path2);
    await delay(DEBOUNCE_TIME);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[1][0].registered.map(getPathAsString)).toEqual([]);
    expect(listener.mock.calls[1][0].unregistered.map(getPathAsString)).toEqual([path2].map(getPathAsString));

    fieldRegister.removeListener(listener);
    fieldRegister.register(path2);
    await delay(DEBOUNCE_TIME);

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should trigger callback initially', async () => {
    const listener = jest.fn();
    const path1 = asPath('path1');
    const path2 = asPath('path2');
    const path3 = asPath('path3');

    fieldRegister.register(path1);
    fieldRegister.register(path2);
    fieldRegister.register(path3);
    fieldRegister.addListener(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].registered.map(getPathAsString)).toEqual([path1, path2, path3].map(getPathAsString));
    expect(listener.mock.calls[0][0].unregistered.map(getPathAsString)).toEqual([].map(getPathAsString));
  });

  it('should check if it includes a path', () => {
    fieldRegister.register(asPath('myPath'));

    expect(fieldRegister.includesPath(asPath('myPath'))).toBe(true);
    expect(fieldRegister.includesPath(path())).toBe(false);
  });
});
