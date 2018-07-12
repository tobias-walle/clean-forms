import { DELETE, updateDeep } from './updateDeep';

export class StateUpdater<S> {
  private defaultState: S;
  private state: S;
  private timeout?: number;
  private onChange?: (state: S) => void;

  constructor(
    initialState: S
  ) {
    this.resetWith(initialState);
  }

  public resetWith(state: S): void {
    this.defaultState = state;
    this.state = state;
    clearTimeout(this.timeout);
  }

  public updateDeep(path: string, value: any | DELETE, noCallback = false): void {
    this.triggerUpdate(updateDeep({ object: this.state, path, value }), noCallback);
  }

  public patch(patch: Partial<S>, noCallback = false): void {
    this.triggerUpdate({
      ...(this.state as any),
      ...(patch as any)
    }, noCallback);
  }

  private triggerUpdate(newState: S, noCallback: boolean): void {
    this.state = newState;

    if (this.timeout != null) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.state = this.defaultState;
    }, 50);

    if (!noCallback) {
      this.onChange && this.onChange(this.state);
    }
  }

  public registerOnChange(onChange?: (state: S) => void): void {
    this.onChange = onChange;
  }
}
