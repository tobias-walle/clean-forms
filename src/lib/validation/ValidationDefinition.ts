export interface ValidationFunctionArgs<Value = any, Model = any> {
  value: Value;
  model: Model;
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

export type ValidationResolver<Value = any, Model = any> = ArrayValidation<Model, any, Value> | ValidationFunction<Value, Model>;

export interface ValidationDefinition<Model> {
  [key: string]: ValidationResolver<any, any> | ValidationDefinition<any> ;
}
