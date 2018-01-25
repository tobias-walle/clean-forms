import { Errors } from './Errors';

export interface ValidationFunctionArgs<Value = any, Model = any> {
  value: Value;
  formValue: Model;
}

export type ValidationFunction<Value = any, Model = any> =
  (args: ValidationFunctionArgs<Value, Model>) => string | Errors<Model> | null;

export type ValidationDefinition<Model> = {
  [key in keyof Model]?: ValidationFunction<Model[key], Model> | ValidationDefinition<Model[key]>
};
