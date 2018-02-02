export type False = '0';
export type True = '1';
export type If<C extends True | False, Then, Else> = { '0': Else, '1': Then }[C];

export type Diff<T extends string, U extends string> = (
  { [P in T]: P } & { [P in U]: never } & { [x: string]: never }
)[T];

export type X<T> = Diff<keyof T, keyof Object>;

export type Is<T, U> = (Record<X<T & U>, False> & Record<any, True>)[Diff<X<T>, X<U>>];

type DeepPartial<T> = {
    [P in keyof T]?: If<Is<Function & T[P], Function>, T[P], DeepPartial<T[P]>>
}

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

export type ValidationResolver<Value = any, Model = any> = ArrayValidation<Model, any, Value> | ValidationFunction<Value, Model>;

export interface ValidationDefinition<Model> {
  [key: string]: ValidationResolver<any, any> | ValidationDefinition<any> ;
}
