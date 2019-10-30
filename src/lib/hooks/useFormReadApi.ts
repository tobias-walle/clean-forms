import { useCallback, useMemo } from 'react';
import { FieldPathLike } from '../models/FieldPath';
import { asPath, getPathAsString, PathLike } from '../models/Path';
import {
  DEFAULT_FIELD_STATUS,
  FieldStatus,
  FieldStatusMapping,
} from '../statusTracking';
import { selectDeep } from '../utils';
import {
  FieldError,
  FieldErrorMapping,
  ValidationDefinition,
} from '../validation';

export interface UseFormReadApiProps<Model> {
  value: Model;
  status?: FieldStatusMapping;
  validationDefinition?: ValidationDefinition<Model>;
  fieldErrorMapping?: FieldErrorMapping;
  strict?: boolean;
}

export interface FormReadApi<Model> {
  valid: boolean;
  invalid: boolean;
  getFieldValue: (modelPath?: PathLike<Model>) => any;
  getFieldError: (modelPath?: PathLike<Model>) => FieldError;
  getFieldStatus: (fieldPath?: FieldPathLike<Model>) => FieldStatus;
}

export function useFormReadApi<Model>({
  value,
  status = {},
  validationDefinition = {},
  fieldErrorMapping = {},
  strict = false,
}: UseFormReadApiProps<Model>): FormReadApi<Model> {
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
    (path: PathLike<Model> = ''): any => {
      path = asPath(path);
      return selectDeep({ object: value, path, assert: strict });
    },
    [value, strict]
  );

  const getFieldError = useCallback(
    (path: PathLike<Model> = ''): FieldError => {
      path = asPath(path);
      return fieldErrorMapping[getPathAsString(path)];
    },
    [fieldErrorMapping]
  );

  const getFieldStatus = useCallback(
    (path: FieldPathLike<Model> = ''): FieldStatus => {
      path = asPath(path);
      return status[getPathAsString(path)] || DEFAULT_FIELD_STATUS;
    },
    [status]
  );

  return { invalid, valid, getFieldValue, getFieldError, getFieldStatus };
}
