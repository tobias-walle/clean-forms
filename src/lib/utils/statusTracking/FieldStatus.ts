export interface FieldStatusArguments<T = any> {
  dirty: boolean;
  touched: boolean;
}

export class FieldStatus<T = any> {
  public readonly dirty: boolean;
  public readonly pristine: boolean;
  public readonly touched: boolean;
  public readonly untouched: boolean;

  constructor(args: FieldStatusArguments<T>) {
    const { dirty, touched } = args;

    this.dirty = dirty;
    this.pristine = !dirty;
    this.touched = touched;
    this.untouched = !touched;
  }
}

export const DEFAULT_FIELD_STATUS: FieldStatus = new FieldStatus({ dirty: false, touched: false });

export function isFieldStatus(item: any): item is FieldStatus {
  return item != null && (item as FieldStatus).hasOwnProperty('dirty');
}

export function cloneFieldStatus<Children = any>(statusToClone: FieldStatus, overrideArgs: Partial<FieldStatusArguments<Children>>): FieldStatus {
  return new FieldStatus({
    ...(statusToClone as any),
    ...overrideArgs
  });
}
