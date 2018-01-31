import { Paths } from '../FieldRegister';

export interface ValidationFunctionArgs<Value = any, Model = any> {
  value: Value;
  formValue: Model;
}

export type ValidationFunction<Value = any, Model = any> =
  (args: ValidationFunctionArgs<Value, Model>) => string | null;

export class ArrayValidation<Model = any, Item = any, ArrayType = Item[]> {
  constructor(
    public readonly itemValidation: ValidationFunction<Item, Model> | ValidationDefinition<Item> | ArrayValidation<Model> | null,
    public readonly arrayValidation?: ValidationFunction<ArrayType, Model>
  ) {
  }
}

export type ValidationResolver<Value = any, Model = any> = ValidationFunction<Value, Model> | ArrayValidation<Model, any, Value>;

export type ValidationDefinition<Model> = {
  [key in keyof Model]?: ValidationResolver<Model[key], Model> | ValidationDefinition<Model[key]>;
};
