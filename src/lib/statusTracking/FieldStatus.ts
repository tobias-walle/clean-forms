export interface FieldStatusArguments {
  dirty: boolean;
  touched: boolean;
}

export class FieldStatus {
  public readonly dirty: boolean;
  public readonly pristine: boolean;
  public readonly touched: boolean;
  public readonly untouched: boolean;

  constructor(args: FieldStatusArguments) {
    const { dirty, touched } = args;

    this.dirty = dirty;
    this.pristine = !dirty;
    this.touched = touched;
    this.untouched = !touched;
  }
}

export const DEFAULT_FIELD_STATUS: FieldStatus = new FieldStatus({ dirty: false, touched: false });

export function cloneFieldStatus<Children = any>(statusToClone: FieldStatus, overrideArgs: Partial<FieldStatusArguments>): FieldStatus {
  return new FieldStatus({
    ...(statusToClone as any),
    ...overrideArgs
  });
}
