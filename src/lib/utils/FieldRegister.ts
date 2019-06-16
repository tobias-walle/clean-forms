import { getPathAsString, Path, Paths } from '../models/Path';
import { createDebouncedFunction } from './createDebouncedFunction';
import { removeItemFromArray } from './removeItemFromArray';

export interface FieldRegisterChanges {
  registered: Paths;
  unregistered: Paths;
}

export type FieldRegisterListener = (changes: FieldRegisterChanges) => void;

export class FieldRegister {
  public static DEBOUNCE_IN_MS = 10;
  private listeners: FieldRegisterListener[] = [];
  private changes: FieldRegisterChanges;

  private _paths: Paths = [];
  public get paths(): Paths {
    return this._paths;
  }

  private triggerListeners = createDebouncedFunction(() => {
    this.listeners.forEach(listener => listener(this.changes));
    this.resetChanges();
  }, FieldRegister.DEBOUNCE_IN_MS);

  constructor() {
    this.resetChanges();
  }

  public includesPath(path: Path<unknown>): boolean {
    const pathAsString = getPathAsString(path);
    return this.paths.find(p => pathAsString === getPathAsString(p)) != null;
  }

  public register(path: Path<unknown>): void {
    this._paths.push(path);

    this.changes.registered.push(path);
    this.triggerListeners();
  }

  public unregister(path: Path<unknown>): void {
    const pathAsString = getPathAsString(path);
    const index = this.paths.findIndex(p => pathAsString === getPathAsString(p));

    this._paths.splice(index, 1);

    this.changes.unregistered.push(path);
    this.triggerListeners();
  }

  public addListener(callback: FieldRegisterListener): void {
    this.triggerListenerIfPathsAlreadyRegistered(callback);
    this.listeners.push(callback);
  }

  private triggerListenerIfPathsAlreadyRegistered(callback: FieldRegisterListener): void {
    if (this.paths.length > 0) {
      callback({ registered: this.paths, unregistered: [] });
    }
  }

  public removeListener(callback: FieldRegisterListener): void {
    removeItemFromArray(this.listeners, callback);
  }

  private resetChanges() {
    this.changes = { registered: [], unregistered: [] };
  }
}
