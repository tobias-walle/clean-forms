import * as React from 'react';
import { useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { useShallowMemo } from '../hooks/useShallowMemo';
import { FieldStatus } from '../statusTracking';
import { assertNotNull, createPath, DELETE, Path } from '../utils';
import { FieldError } from '../validation';
import { useFormContext } from './formContext';

export type SetFieldValueWithValue<Value> = (value: Value) => void;
export type SetFieldValueWithFunction<Value> = (update: (old: Value) => Value) => void;
export type SetFieldValue<Value> = SetFieldValueWithValue<Value>;

export type MarkAsTouched = () => void;

export interface FieldContextValue<Value> extends FieldStatus {
  /** The path to the field. Used for example for storing the error message */
  fieldPath: Path;

  /** The path on the file model */
  modelPath: Path;

  /** The name of the field */
  name: string;

  /** The value of the field */
  value: Value;

  /** True if the field has no errors */
  valid: boolean;

  /** True if the field has errors */
  invalid: boolean;

  /** Validation error if the field has any */
  error: FieldError;

  /** Set the value of the field */
  setValue: SetFieldValue<Value>;

  /** Mark the field as touched */
  markAsTouched: MarkAsTouched;
}

export const FieldContext = React.createContext<FieldContextValue<any> | null>(null);

export function useComputedFieldContext<Value>(
  relativeModelPath: string,
  relativeFieldPath: string
): FieldContextValue<Value> {
  const formContext = useFormContext();
  const {
    getFieldValue,
    getFieldStatus,
    getFieldError,
    onFieldBlur,
    onFieldChange,
  } = formContext;
  const parentFieldContext = useFieldContext();

  const fieldPath = createPath(parentFieldContext.fieldPath, relativeFieldPath);

  const modelPath = createPath(parentFieldContext.modelPath, relativeModelPath);

  /** Register the field to the form */
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  useLayoutEffect(() => {
    formContextRef.current.onFieldMount(fieldPath);
    return () => formContextRef.current.onFieldUnmount(fieldPath);
    // eslint-disable-next-line
  }, []);

  const value = useMemo(
    () => getFieldValue(modelPath),
    [getFieldValue, modelPath],
  );

  const error = useMemo(
    () => getFieldError(modelPath),
    [getFieldError, modelPath],
  );

  const fieldStatus = useMemo(
    () => getFieldStatus(fieldPath),
    [getFieldStatus, fieldPath],
  );

  const setValue: SetFieldValue<Value | DELETE> = useCallback(
    valueOrUpdate => onFieldChange(fieldPath, modelPath, valueOrUpdate),
    [fieldPath, modelPath, onFieldChange],
  );

  const markAsTouched: MarkAsTouched = useCallback(() => {
    onFieldBlur(fieldPath);
  }, [fieldPath, onFieldBlur]);

  return useShallowMemo({
    ...fieldStatus,
    name: fieldPath,
    fieldPath,
    modelPath,
    value,
    error,
    valid: !error,
    invalid: !!error,
    setValue,
    markAsTouched,
  });
}

interface FieldContextProviderProps {
  relativeFieldPath: Path;
  relativeModelPath: Path;
  children?: React.ReactNode;
}

export function FieldContextProvider<Value>(props: FieldContextProviderProps) {
  return <FieldContext.Provider value={useComputedFieldContext(
    props.relativeModelPath,
    props.relativeFieldPath
  )}>{props.children}</FieldContext.Provider>;
}

export function useFieldContext<Value>(): FieldContextValue<Value> {
  return assertNotNull(
    useContext(FieldContext),
    'You can only use the FieldContext inside a Form',
  );
}
