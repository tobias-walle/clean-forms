import { createDebouncedFunction } from './createDebouncedFunction';
import { removeItemFromArray } from './removeItemFromArray';

export type Path = string[];
export type Paths = Path[];

export interface FieldRegisterChanges {
  registered: Paths;
  unregistered: Paths;
}

export type FieldRegisterListener = (changes: FieldRegisterChanges) => void;

export class FieldRegister {
  private listeners: FieldRegisterListener[] = [];
  private changes: FieldRegisterChanges;

  private _paths: Paths = [];
  public get paths(): Paths {
    return this._paths;
  }

  private pathsAsString: string[] = [];

  private triggerListeners = createDebouncedFunction(() => {
    this.listeners.forEach(listener => listener(this.changes));
    this.resetChanges();
  }, 10);

  constructor() {
    this.resetChanges();
  }

  public includesPath(path: Path): boolean {
    return this.pathsAsString.includes(pathToString(path));
  }

  public register(path: Path): void {
    this._paths.push(path);
    this.pathsAsString.push(pathToString(path));

    this.changes.registered.push(path);
    this.triggerListeners();
  }

  public unregister(path: Path): void {
    const index = this.pathsAsString.indexOf(pathToString(path));

    this._paths.splice(index, 1);
    this.pathsAsString.splice(index, 1);

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

function pathToString(path: Path): string {
  return path.join('.');
}
