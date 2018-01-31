import { createPath } from '../createPath';
import { Path } from '../FieldRegister';
import { selectDeep } from '../selectDeep';
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

export type ValidationResult = string | undefined;

export interface ValidationResultMapping {
  [path: string]: ValidationResult;
}

export class FieldValidator<Model> {
  private path: Path;
  private value: any;
  private model: Model;

  public validateModel({ model, validationDefinition }: ValidateModelArguments<Model>): ValidationResultMapping {
    return getValidationDefinitionPaths(validationDefinition, model)
      .reduce((result, path) => {
        result[path] = this.validateField({model, validationDefinition, path});
        return result;
      }, {} as ValidationResultMapping);
  }

  public validateField({ model, validationDefinition, path }: ValidateFieldArguments<Model>): ValidationResult {
    this.path = path;
    this.value = selectDeep({ object: model, path, assert: false });
    this.model = model;
    const validation: ValidationResolver = selectDeepValidator({ object: validationDefinition, path, assert: false });
    if (!validation) {
      return;
    } else if (validation instanceof ArrayValidation) {
      return this.runArrayValidation(validation);
    } else {
      return this.runValidationFunctionInTryCatchAndCheckType(validation);
    }
  }

  private runArrayValidation(validation: ArrayValidation): ValidationResult {
    if (this.value instanceof Array) {
      return this.runValidationFunctionInTryCatch(validation.arrayValidation);
    } else {
      return this.runValidationFunctionInTryCatchAndCheckType(validation.itemValidation);
    }
  }

  private runValidationFunctionInTryCatchAndCheckType(validationFunction: any): ValidationResult {
    if (typeof validationFunction === 'function') {
      return this.runValidationFunctionInTryCatch(validationFunction);
    } else {
      const pathAsString = JSON.stringify(this.path);
      const errorMessage = `Invalid validation type "${typeof validationFunction}" for path "${pathAsString}"`;
      console.error(errorMessage);
      return errorMessage;
    }
  }

  private runValidationFunctionInTryCatch(validationFunction: ValidationFunction | undefined | null): ValidationResult {
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

  private runValidationFunctionIfDefined(validationFunction: ValidationFunction | undefined | null): ValidationResult {
    if (validationFunction == null) {
      return;
    }
    return validationFunction({ value: this.value, formValue: this.model }) || undefined;
  }
}
