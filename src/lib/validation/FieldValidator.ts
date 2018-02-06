import { createPath } from '../utils/createPath';
import { Path } from '../utils/FieldRegister';
import { selectDeep } from '../utils/selectDeep';
import { getValidationDefinitionPaths } from './getValidationDefinitionPaths';
import { selectDeepValidator } from './selectDeepValidator';
import { ArrayValidation, ValidationDefinition, ValidationFunction, ValidationResolver } from './ValidationDefinition';

export interface ValidateFieldArguments<Model> {
  model: Model;
  validationDefinition: ValidationDefinition<Model>;
  path: Path;
}

export interface ValidateModelArguments<Model> {
  model: Model;
  validationDefinition: ValidationDefinition<Model>;
}

export type FieldError = string | undefined;

export interface FieldErrorMapping {
  [path: string]: FieldError;
}

export class FieldValidator<Model> {
  private path: Path;
  private value: any;
  private model: Model;

  public validateModel({ model, validationDefinition }: ValidateModelArguments<Model>): FieldErrorMapping {
    return getValidationDefinitionPaths(validationDefinition, model)
      .reduce((result, path) => {
        result[path] = this.validateField({model, validationDefinition, path});
        return result;
      }, {} as FieldErrorMapping);
  }

  public validateField({ model, validationDefinition, path }: ValidateFieldArguments<Model>): FieldError {
    this.path = path;
    this.value = selectDeep({ object: model, path, assert: false });
    this.model = model;
    const validation = selectDeepValidator({ object: validationDefinition, path, assert: false });
    if (!validation) {
      return;
    } else {
      return this.runValidationFunctionInTryCatchAndCheckType(validation);
    }
  }

  private runArrayValidation(validation: ArrayValidation): FieldError {
    if (this.value instanceof Array) {
      return this.runValidationFunctionInTryCatch(validation.arrayValidation);
    } else {
      return this.runValidationFunctionInTryCatchAndCheckType(validation.itemValidation);
    }
  }

  private runValidationFunctionInTryCatchAndCheckType(validationFunction: any): FieldError {
    if (typeof validationFunction === 'function') {
      return this.runValidationFunctionInTryCatch(validationFunction);
    } else {
      const pathAsString = JSON.stringify(this.path);
      const errorMessage = `Invalid validation type "${typeof validationFunction}" for path "${pathAsString}"`;
      console.error(errorMessage);
      return errorMessage;
    }
  }

  private runValidationFunctionInTryCatch(validationFunction: ValidationFunction | undefined | null): FieldError {
    try {
      return this.runValidationFunctionIfDefined(validationFunction);
    } catch (e) {
      const value = JSON.stringify(this.value);
      const path = JSON.stringify(this.path);
      const errorMessage = `Error while running validation function for value ${value} in path ${path}:`;
      console.error(errorMessage, e);
      return errorMessage;
    }
  }

  private runValidationFunctionIfDefined(validationFunction: ValidationFunction | undefined | null): FieldError {
    if (validationFunction == null) {
      return;
    }
    return validationFunction({ value: this.value, model: this.model }) || undefined;
  }
}
