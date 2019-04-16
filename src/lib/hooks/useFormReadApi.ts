import { useCallback, useMemo } from 'react';
import { FormState } from '../models/FormState';
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
  getFieldValue: (modelPath: string) => any;
  getFieldError: (modelPath: string) => FieldError;
  getFieldStatus: (fieldPath: string) => FieldStatus;
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
    (path: string): any => {
      return selectDeep({ object: model, path, assert: strict });
    },
    [model, strict]
  );

  const getFieldError = useCallback(
    (path: string): FieldError => {
      return fieldErrorMapping[path];
    },
    [fieldErrorMapping]
  );

  const getFieldStatus = useCallback(
    (fieldId: string): FieldStatus => {
      return status[fieldId] || DEFAULT_FIELD_STATUS;
    },
    [status]
  );

  return { invalid, valid, getFieldValue, getFieldError, getFieldStatus };
}
