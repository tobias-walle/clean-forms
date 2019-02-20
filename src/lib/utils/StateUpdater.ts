import { DELETE, updateDeep } from './updateDeep';

interface Patch {
  type: 'PATCH';
  patch: object;
}

interface DeepUpdate {
  type: 'DEEP';
  path: string;
  value: any;
}

interface SyncUpdate<State> {
  type: 'SYNC';
  setState: (old: State) => State;
}

type Update<State> = Patch | DeepUpdate | SyncUpdate<State>;

export class StateUpdater<S> {
  private onChange?: (state: S) => void;
  private updates: Array<Update<S>> = [];

  constructor(
    private getState: () => S,
    private isMounted: () => boolean,
  ) {
  }

  public updateDeep(path: string, value: any | DELETE, noCallback = false): void {
    this.updates.push({ type: 'DEEP', path, value });
    this.triggerUpdate(noCallback);
  }

  public update(setState: (old: S) => S): void {
    this.updates.push({ type: 'SYNC', setState });
    this.triggerUpdate(false);
  }

  public patch(patch: Partial<S>): void {
    this.updates.push({ type: 'PATCH', patch });
    this.triggerUpdate(false);
  }

  private triggerUpdate(noCallback: boolean): void {
    if (this.isMounted() && !noCallback) {
      this.applyUpdates();
    }
  }

  private applyUpdates() {
    const newState = flush(this.getState(), this.updates);
    this.onChange && this.onChange(newState);
    this.updates = [];
  }

  public registerOnChange(onChange?: (state: S) => void): void {
    this.onChange = onChange;
  }
}

function flush<S>(state: S, updates: Array<Update<S>>): S {
  let newState: S = state;
  for (const update of updates) {
    if (update.type === 'DEEP') {
      newState = updateDeep({ object: newState, path: update.path, value: update.value });
    } else if (update.type === 'PATCH') {
      newState = { ...(newState as any), ...update.patch };
    } else if (update.type === 'SYNC') {
      newState = update.setState(newState);
    }
  }
  return newState;
}
