import { wait } from '../../testUtils/wait';
import { StateUpdater } from './StateUpdater';

describe('StateUpdater', () => {
  it('should trigger the onChange callback with aggregated updates after a debounce', async () => {
    interface TestState {
      a: string;
      b: string;
      c: { d: { e: number } };
    }

    const initialState: TestState = {
      a: 'a',
      b: 'b',
      c: { d: { e: 0 } },
    };
    const manager = new StateUpdater(initialState);
    const onChange = jest.fn();

    manager.registerOnChange(onChange);
    manager.updateDeep('c.d.e', 1);
    manager.patch({ b: 'b2' });

    await wait(100);

    expect(onChange).toHaveBeenCalledWith({
      a: 'a',
      b: 'b2',
      c: { d: { e: 1 } },
    });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('should reset state after a timeout is called', async () => {
    interface TestState {
      a: string;
      b: string;
      c: { d: { e: number } };
    }

    const initialState: TestState = {
      a: 'a',
      b: 'b',
      c: { d: { e: 0 } },
    };
    const manager = new StateUpdater(initialState);
    const onChange = jest.fn();

    manager.registerOnChange(onChange);
    manager.updateDeep('c.d.e', 1);
    manager.patch({ b: 'b2' });

    await wait(50);

    manager.patch({ a: 'a1' });

    expect(onChange.mock.calls[2][0]).toEqual({
      a: 'a1',
      b: 'b',
      c: { d: { e: 0 } },
    });
  });

  it('should reset state immediatly after resetWith is called', () => {
    interface TestState {
      a: string;
      b: string;
      c: { d: { e: number } };
    }

    const initialState: TestState = {
      a: 'a',
      b: 'b',
      c: { d: { e: 0 } },
    };
    const manager = new StateUpdater(initialState);
    const onChange = jest.fn();

    manager.registerOnChange(onChange);
    manager.updateDeep('c.d.e', 1);
    manager.patch({ b: 'b2' });

    manager.resetWith(initialState);

    manager.patch({ a: 'a1' });

    expect(onChange.mock.calls[2][0]).toEqual({
      a: 'a1',
      b: 'b',
      c: { d: { e: 0 } },
    });
  });
});
