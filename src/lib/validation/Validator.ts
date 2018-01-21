import { Errors } from './Errors';
import { ValidationDefinition, ValidationFunction } from './ValidationDefinition';

export class Validator<Model> {
  private model: Model;
  private validation: ValidationDefinition<Model>;

  public validate(model: Model, validation: ValidationDefinition<Model>): Errors<Model> | undefined {
    this.model = model;
    this.validation = validation;

    if (validation instanceof Function) {
      const result = validation({ value: model, formValue: model }) || {};
      if (typeof result === 'string') {
        throw new EvalError('If you provide just a function as a validation definition. You have to return an object' +
          'not an string.');
      }
      return result;
    }
    return this.validateModel({ model, validation });
  }

  private validateModel<O>(args: { model: O, validation: ValidationDefinition<O> }): Errors<O> | undefined {
    const { model, validation } = args;
    const objectKeys: (keyof O)[] = Object.keys(model) as any[];

    let errors: Errors<O> | undefined = undefined;
    objectKeys.forEach(key => {
      const error = this.getError(model[key], validation[key]) as any;
      if (error != null) {
        errors = errors || {};
        errors[key] = error;
      }
    });

    return errors;
  }

  private getError(value: any, validation: ValidationFunction | ValidationDefinition<any> | undefined): undefined | string | Errors<any> {
      if (validation == null) {
        return undefined;
      } else if (validation instanceof Function) {
        return validation({ value, formValue: this.model }) as any;
      } else {
        return this.validateModel({ model: value, validation: validation }) as any;
      }
  }
}