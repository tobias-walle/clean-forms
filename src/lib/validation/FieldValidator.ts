import { Path } from '../utils/FieldRegister';
import { selectDeep } from '../utils/selectDeep';
import { getValidationDefinitionPaths } from './getValidationDefinitionPaths';
import { selectDeepValidator } from './selectDeepValidator';
import { ValidationDefinition, ValidationError, ValidationFunction } from './ValidationDefinition';

interface ValidateFieldArguments<Model> {
  model: Model;
  validationDefinition: ValidationDefinition<Model>;
  path: Path;
}

export interface ValidateModelArguments<Model> {
  model: Model;
  validationDefinition: ValidationDefinition<Model>;
}

export type FieldError = string | undefined;

type FieldErrors = Array<[string, FieldError]>;

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
        this.validateField({ model, validationDefinition, path }).forEach(([errorPath, error]) => {
          result[joinPaths(path, errorPath)] = error;
        });
        return result;
      }, {} as FieldErrorMapping);
  }

  private validateField({ model, validationDefinition, path }: ValidateFieldArguments<Model>): FieldErrors {
    this.path = path;
    this.value = selectDeep({ object: model, path, assert: false });
    this.model = model;
    const validation = selectDeepValidator({ object: validationDefinition, path, assert: false });
    if (!validation) {
      return [];
    } else {
      return this.runValidationFunctionInTryCatchAndCheckType(validation);
    }
  }

  private runValidationFunctionInTryCatchAndCheckType(validationFunction: any): FieldErrors {
    if (typeof validationFunction === 'function') {
      return this.runValidationFunctionInTryCatch(validationFunction);
    } else {
      const pathAsString = JSON.stringify(this.path);
      const errorMessage = `Invalid validation type "${typeof validationFunction}" for path "${pathAsString}"`;
      console.error(errorMessage);
      return [['', errorMessage]];
    }
  }

  private runValidationFunctionInTryCatch(validationFunction: ValidationFunction | undefined | null): FieldErrors {
    try {
      return this.runValidationFunctionIfDefined(validationFunction);
    } catch (e) {
      const value = JSON.stringify(this.value);
      const path = JSON.stringify(this.path);
      const errorMessage = `Error while running validation function for value ${value} in path ${path}:`;
      console.error(errorMessage, e);
      return [['', errorMessage]];
    }
  }

  private runValidationFunctionIfDefined(validationFunction: ValidationFunction | undefined | null): FieldErrors {
    if (validationFunction == null) {
      return [];
    }
    const validationResult = validationFunction({ value: this.value, model: this.model });
    if (validationResult instanceof Array) {
      return validationResult
        .map(([path, error]): [string, FieldError] =>
          [path, this.validationErrorToFieldError(error)]
        );
    } else {
      return [['', this.validationErrorToFieldError(validationResult)]];
    }
  }

  private validationErrorToFieldError(validationError: ValidationError): FieldError {
    return validationError || undefined;
  }
}

function joinPaths(path1: string, path2: string): string {
  if (path1 === '') {
    return path2;
  }
  if (path2 === '') {
    return path1;
  }
  return `${path1}.${path2}`;
}
