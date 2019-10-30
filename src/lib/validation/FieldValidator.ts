import {
  asPath,
  combinePaths,
  getPathAsString,
  Path,
  path as createPath,
} from '../models/Path';
import { isYupSchema } from '../utils/isYupSchema';
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

interface ValidateFieldWithYupArguments<Model> {
  model: Model;
  validationDefinition: import('yup').Schema<Model>;
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
  let errors: Array<Array<readonly [string, FieldError]>> = [];
  if (isYupSchema(validationDefinition)) {
    errors = [
      validateFieldWithYup({
        model,
        validationDefinition,
        path: createPath(),
      }).map(([path, error]) => [getPathAsString(path), error] as const),
    ];
  } else {
    errors = getValidationDefinitionPaths(validationDefinition, model).map(
      path => {
        const fieldErrors = validateField({
          model,
          validationDefinition,
          path,
        });
        return fieldErrors.map(
          ([errorPath, error]) =>
            [getPathAsString(combinePaths(path, errorPath)), error] as const
        );
      }
    );
  }

  const result: FieldErrorMapping = {};
  errors.forEach(arr =>
    arr.forEach(([path, error]) => {
      if (error != null) {
        result[path] = error;
      }
    })
  );
  return result;
}

function validateField<Model>(
  args: ValidateFieldArguments<Model>
): FieldErrors<Model> {
  const { model, validationDefinition, path } = args;
  const value = selectDeep({ object: model, path, assert: false });
  const validation = selectDeepValidator({
    object: validationDefinition,
    path,
    assert: false,
  });
  if (!validation) {
    return [];
  } else if (isYupSchema(validation)) {
    return validateFieldWithYup({
      model,
      validationDefinition: validation,
      path,
    });
  } else {
    return runValidationFunctionInTryCatchAndCheckType(
      path,
      value,
      model,
      validation
    );
  }
}

function validateFieldWithYup<Model>({
  model,
  validationDefinition,
  path,
}: ValidateFieldWithYupArguments<Model>): FieldErrors<Model> {
  try {
    const value = selectDeep({ object: model, path, assert: false });
    validationDefinition.validateSync(value, {
      abortEarly: false,
      strict: true,
    });
  } catch (err) {
    const yupError = err as import('yup').ValidationError;
    return yupError.inner.map(innerError => [
      asPath(innerError.path || ''),
      innerError.message,
    ]);
  }
  return [];
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
    return validationResult.map(([pathLike, error]): [
      Path<Model>,
      FieldError
    ] => [asPath(pathLike) as Path<Model>, validationErrorToFieldError(error)]);
  } else {
    return [[createPath(), validationErrorToFieldError(validationResult)]];
  }
}

function validationErrorToFieldError(
  validationError: ValidationError
): FieldError {
  return validationError || undefined;
}
