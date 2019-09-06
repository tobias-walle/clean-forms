import {
  asPath,
  combinePaths,
  getPathAsString,
  Path,
  path as createPath,
} from '../models/Path';
import { selectDeep } from '../utils/selectDeep';
import { getValidationDefinitionPaths } from './getValidationDefinitionPaths';
import { selectDeepValidator } from './selectDeepValidator';
import {
  ValidationDefinition,
  ValidationError,
  ValidationErrors,
  ValidationFunction,
} from './ValidationDefinition';

interface ValidateFieldArguments<Model> {
  model: Model;
  validationDefinition: ValidationDefinition<Model>;
  path: Path<Model>;
}

export interface ValidateModelArguments<Model> {
  model: Model;
  validationDefinition: ValidationDefinition<Model>;
}

export type FieldError = string | undefined;

type FieldErrors<Model> = Array<[Path<Model>, FieldError]>;

export interface FieldErrorMapping {
  [path: string]: FieldError;
}

export function combineValidationDefinitions<Value>(
  ...validators: Array<ValidationDefinition<Value>>
): ValidationFunction<Value> {
  return value => {
    return validators.reduce(
      (allErrors, validationDefinition) => {
        const validationResult: ValidationErrors = Object.entries(
          validateModel({
            model: value,
            validationDefinition,
          })
        ).map(([path, error]) => [path, error || null]);
        return [...allErrors, ...validationResult];
      },
      [] as ValidationErrors
    );
  };
}

export function validateModel<Model = any>({
  model,
  validationDefinition,
}: ValidateModelArguments<Model>): FieldErrorMapping {
  return getValidationDefinitionPaths(validationDefinition, model).reduce(
    (result, path) => {
      validateField({ model, validationDefinition, path }).forEach(
        ([errorPath, error]) => {
          result[getPathAsString(combinePaths(path, errorPath))] = error;
        }
      );
      return result;
    },
    {} as FieldErrorMapping
  );
}

function validateField<Model>({
  model,
  validationDefinition,
  path,
}: ValidateFieldArguments<Model>): FieldErrors<Model> {
  const value = selectDeep({ object: model, path, assert: false });
  const validation = selectDeepValidator({
    object: validationDefinition,
    path,
    assert: false,
  });
  if (!validation) {
    return [];
  } else {
    return runValidationFunctionInTryCatchAndCheckType(
      path,
      value,
      model,
      validation
    );
  }
}

function runValidationFunctionInTryCatchAndCheckType<Model>(
  path: Path<Model>,
  value: any,
  model: Model,
  validationFunction: any
): FieldErrors<Model> {
  if (typeof validationFunction === 'function') {
    return runValidationFunctionInTryCatch(
      path,
      value,
      model,
      validationFunction
    );
  } else {
    const pathAsString = getPathAsString(path);
    const errorMessage = `Invalid validation type "${typeof validationFunction}" for path "${pathAsString}"`;
    console.error(errorMessage);
    return [[createPath(), errorMessage]];
  }
}

function runValidationFunctionInTryCatch<Model>(
  path: Path<Model>,
  value: any,
  model: Model,
  validationFunction: ValidationFunction | undefined | null
): FieldErrors<Model> {
  try {
    return runValidationFunctionIfDefined(value, model, validationFunction);
  } catch (e) {
    value = JSON.stringify(value);
    const pathAsString = getPathAsString(path);
    const errorMessage = `Error while running validation function for value ${value} in path ${pathAsString}:`;
    console.error(errorMessage, e);
    return [[createPath(), errorMessage]];
  }
}

function runValidationFunctionIfDefined<Model>(
  value: any,
  model: Model,
  validationFunction: ValidationFunction | undefined | null
): FieldErrors<Model> {
  if (validationFunction == null) {
    return [];
  }
  const validationResult = validationFunction(value);
  if (validationResult instanceof Array) {
    return validationResult.map(
      ([pathLike, error]): [Path<Model>, FieldError] => [
        asPath(pathLike) as Path<Model>,
        validationErrorToFieldError(error),
      ]
    );
  } else {
    return [[createPath(), validationErrorToFieldError(validationResult)]];
  }
}

function validationErrorToFieldError(
  validationError: ValidationError
): FieldError {
  return validationError || undefined;
}
