import { Path, path as createPath, PathLike } from './Path';

type FieldModel<Model> = Model extends any[]
  ? { [K in keyof any]: Model[number] }
  : Model extends object
  ? { [K in keyof Model]: FieldModel<Model[K]> }
  : Model;

export type FieldPath<Model, Value = any> = Path<
  FieldModel<Model>,
  FieldModel<Value>
>;

export type FieldPathLike<Model, Value = any> = PathLike<
  FieldModel<Model>,
  FieldModel<Value>
>;

export function fieldPath<Model>(): FieldPath<Model, Model> {
  return createPath<FieldModel<Model>>();
}
