import { wait } from '../../testUtils/wait';
import { FieldRegister } from './FieldRegister';

describe('FieldRegister', () => {
  let fieldRegister: FieldRegister;

  beforeEach(() => {
    fieldRegister = new FieldRegister();
  });

  it('should register and unregister new paths', () => {
    fieldRegister.register(['path1']);
    fieldRegister.register(['path2']);
    fieldRegister.register(['path3']);

    expect(fieldRegister.paths).toEqual([['path1'], ['path2'], ['path3']]);

    fieldRegister.unregister(['path2']);

    expect(fieldRegister.paths).toEqual([['path1'], ['path3']]);
  });

  it('should trigger callback on changes', async () => {
    const DEBOUNCE_TIME = 10;
    const listener = jest.fn();
    const path1 = ['path1'];
    const path2 = ['path2'];
    const path3 = ['path3'];

    fieldRegister.addListener(listener);
    fieldRegister.register(path1);
    fieldRegister.register(path2);
    fieldRegister.register(path3);
    await wait(DEBOUNCE_TIME);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ registered: [path1, path2, path3], unregistered: []});

    fieldRegister.unregister(path2);
    await wait(DEBOUNCE_TIME);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith({ registered: [], unregistered: [path2]});

    fieldRegister.removeListener(listener);
    fieldRegister.register(path2);
    await wait(DEBOUNCE_TIME);

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should trigger callback initially', async () => {
    const listener = jest.fn();
    const path1 = ['path1'];
    const path2 = ['path2'];
    const path3 = ['path3'];

    fieldRegister.register(path1);
    fieldRegister.register(path2);
    fieldRegister.register(path3);
    fieldRegister.addListener(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ registered: [path1, path2, path3], unregistered: []});
  });

  it('should check if it includes a path', () => {
    fieldRegister.register(['myPath']);

    expect(fieldRegister.includesPath(['myPath'])).toBe(true);
    expect(fieldRegister.includesPath([])).toBe(false);
  });
});
