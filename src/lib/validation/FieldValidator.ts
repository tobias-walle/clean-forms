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

export function validateModel<Model = any>({ model, validationDefinition }: ValidateModelArguments<Model>): FieldErrorMapping {
  return getValidationDefinitionPaths(validationDefinition, model)
    .reduce((result, path) => {
      validateField({ model, validationDefinition, path }).forEach(([errorPath, error]) => {
        result[joinPaths(path, errorPath)] = error;
      });
      return result;
    }, {} as FieldErrorMapping);
}

function validateField<Model>({ model, validationDefinition, path }: ValidateFieldArguments<Model>): FieldErrors {
  const value = selectDeep({ object: model, path, assert: false });
  const validation = selectDeepValidator({ object: validationDefinition, path, assert: false });
  if (!validation) {
    return [];
  } else {
    return runValidationFunctionInTryCatchAndCheckType(path, value, model, validation);
  }
}

function runValidationFunctionInTryCatchAndCheckType<Model>(path: string, value: any, model: Model, validationFunction: any): FieldErrors {
  if (typeof validationFunction === 'function') {
    return runValidationFunctionInTryCatch(path, value, model, validationFunction);
  } else {
    const pathAsString = JSON.stringify(path);
    const errorMessage = `Invalid validation type "${typeof validationFunction}" for path "${pathAsString}"`;
    console.error(errorMessage);
    return [['', errorMessage]];
  }
}

function runValidationFunctionInTryCatch<Model>(path: string, value: any, model: Model, validationFunction: ValidationFunction | undefined | null): FieldErrors {
  try {
    return runValidationFunctionIfDefined(value, model, validationFunction);
  } catch (e) {
    value = JSON.stringify(value);
    const errorMessage = `Error while running validation function for value ${value} in path ${path}:`;
    console.error(errorMessage, e);
    return [['', errorMessage]];
  }
}

function runValidationFunctionIfDefined<Model>(value: any, model: Model, validationFunction: ValidationFunction | undefined | null): FieldErrors {
  if (validationFunction == null) {
    return [];
  }
  const validationResult = validationFunction(value);
  if (validationResult instanceof Array) {
    return validationResult
      .map(([path, error]): [string, FieldError] =>
        [path, validationErrorToFieldError(error)]
      );
  } else {
    return [['', validationErrorToFieldError(validationResult)]];
  }
}

function validationErrorToFieldError(validationError: ValidationError): FieldError {
  return validationError || undefined;
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
