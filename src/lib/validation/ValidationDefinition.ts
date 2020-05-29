import { PathLike } from '../models/Path';

export type ValidationError = string | null;
export type ValidationErrors<T = unknown> = Array<
  [PathLike<T>, ValidationError]
>;

type ArrayItemType<T> = T extends Array<infer U> ? U : never;

export type ValidationFunction<Value = unknown> = (
  value: Value
) => ValidationError | ValidationErrors;

export class ArrayValidation<Value = unknown[]> {
  constructor(
    public readonly itemValidation: ValidationEntry<
      ArrayItemType<Value>
    > | null,
    public readonly arrayValidation?: ValidationFunction<Value>
  ) {}
}

export type ValidationResolver<Value> = Value extends any[]
  ? ArrayValidation<Value>
  : ValidationFunction<Value>;

export type ValidationEntry<Value> =
  | import('yup').Schema<Value>
  | (Value extends any[]
      ? (
          | ValidationFunction<Value>
          | ArrayValidationMapping<Value>
          | ArrayValidation<Value>
        )
      : Value extends object
      ? (ValidationFunction<Value> | ValidationMapping<Value>)
      : ValidationFunction<Value>);

export type ValidationMapping<Model> = {
  [K in keyof Model]?: ValidationEntry<Model[K]>;
};

export type ArrayValidationMapping<Model extends any[]> = {
  [K in number]?: ValidationEntry<Model[K]>;
};

export type ValidationDefinition<Model> =
  | ValidationResolver<Model>
  | ValidationMapping<Model>
  | import('yup').MixedSchema<Model>
  | import('yup').Schema<Model>;
