import { useCallback, useMemo } from 'react';
import { FieldPath } from '../models/FieldPath';
import { FormState } from '../models/FormState';
import {
  getPathAsString,
  Path,
  path as createPath,
  PathLike,
} from '../models/Path';
import { DEFAULT_FIELD_STATUS, FieldStatus } from '../statusTracking';
import { selectDeep } from '../utils';
import {
  FieldError,
  FieldErrorMapping,
  ValidationDefinition,
} from '../validation';

export interface UseFormReadApiProps<Model> {
  state: FormState<Model>;
  validationDefinition?: ValidationDefinition<Model>;
  fieldErrorMapping?: FieldErrorMapping;
  strict?: boolean;
}

export interface FormReadApi<Model> {
  valid: boolean;
  invalid: boolean;
  getFieldValue: (modelPath: Path<Model>) => any;
  getFieldError: (modelPath: Path<Model>) => FieldError;
  getFieldStatus: (fieldPath: FieldPath<Model>) => FieldStatus;
}

export function useFormReadApi<Model>({
  state,
  validationDefinition = {},
  fieldErrorMapping = {},
  strict = true,
}: UseFormReadApiProps<Model>): FormReadApi<Model> {
  const { status = {}, model } = state;

  const valid = useMemo(() => {
    for (const fieldId in fieldErrorMapping) {
      if (!(fieldId in fieldErrorMapping)) {
        continue;
      }
      const error = fieldErrorMapping[fieldId];
      if (error !== undefined) {
        return false;
      }
    }
    return true;
  }, [fieldErrorMapping]);
  const invalid = !valid;

  const getFieldValue = useCallback(
    (path: Path<Model>): any => {
      return selectDeep({ object: model, path, assert: strict });
    },
    [model, strict]
  );

  const getFieldError = useCallback(
    (path: Path<Model>): FieldError => {
      return fieldErrorMapping[getPathAsString(path)];
    },
    [fieldErrorMapping]
  );

  const getFieldStatus = useCallback(
    (path: FieldPath<Model>): FieldStatus => {
      return status[getPathAsString(path)] || DEFAULT_FIELD_STATUS;
    },
    [status]
  );

  return { invalid, valid, getFieldValue, getFieldError, getFieldStatus };
}
