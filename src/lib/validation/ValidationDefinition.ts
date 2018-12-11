export interface ValidationFunctionArgs<Value = any, Model = any> {
  value: Value;
  model: Model;
}

export type ValidationError = string | null;
export type ValidationErrors = Array<[string, ValidationError]>;

export type ValidationFunction<Value = any, Model = any> =
  (args: ValidationFunctionArgs<Value, Model>) => ValidationError | ValidationErrors;

export class ArrayValidation<Model = any, Item = any, ArrayType = Item[]> {
  constructor(
    public readonly itemValidation: ValidationFunction<Item, Model> | ValidationMapping<Item> | ArrayValidation<Model> | null,
    public readonly arrayValidation?: ValidationFunction<ArrayType, Model>
  ) {
  }
}

export type ValidationResolver<Value = any, Model = any> = ArrayValidation<Model, any, Value> | ValidationFunction<Value, Model>;

export interface ValidationMapping<Model> {
  [key: string]: ValidationResolver<any, any> | ValidationMapping<any> ;
}

export type ValidationDefinition<Model> = ValidationResolver<Model, any> | ValidationMapping<Model>;
