import * as React from 'react';
import { useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { FieldStatus } from '../statusTracking';
import { assertNotNull, createPath, DELETE, Path } from '../utils';
import { FieldError } from '../validation';
import { useFormContext } from './form-context';

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

export function useFieldContext<T>(): FieldContextValue<T> {
  return assertNotNull(
    useContext(FieldContext),
    'You can only use the FieldContext inside a Form'
  );
}

interface FieldContextProviderProps {
  relativeFieldPath: Path;
  relativeModelPath: Path;
  children?: React.ReactNode;
}

export function FieldContextProvider<Value>(props: FieldContextProviderProps) {
  const formContext = useFormContext();
  const parentFieldContext = useFieldContext();

  const fieldPath = createPath(parentFieldContext.fieldPath, props.relativeFieldPath);

  const modelPath = createPath(parentFieldContext.modelPath, props.relativeModelPath);

  /** Register the field to the form */
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  useLayoutEffect(() => {
    formContextRef.current.onFieldMount(fieldPath);
    return () => formContextRef.current.onFieldUnmount(fieldPath);
    // eslint-disable-next-line
  }, []);

  const {
    getFieldValue,
    getFieldStatus,
    getFieldError
  } = formContext;
  const value = useMemo(
    () => getFieldValue(modelPath),
    [getFieldValue, modelPath]
  );

  const error = useMemo(
    () => getFieldError(modelPath),
    [getFieldError, modelPath]
  );

  const fieldStatus = useMemo(
    () => getFieldStatus(fieldPath),
    [getFieldStatus, fieldPath]
  );

  const setValue: SetFieldValue<Value | DELETE> = useCallback(
    valueOrUpdate => formContext.onFieldChange(fieldPath, modelPath, valueOrUpdate),
    [formContext, fieldPath, modelPath]
  );

  const markAsTouched: MarkAsTouched = useCallback(() => {
    formContext.onFieldBlur(fieldPath);
  }, [formContext, fieldPath]);

  const contextValue: FieldContextValue<Value> = {
    ...fieldStatus,
    name: fieldPath,
    fieldPath,
    modelPath,
    value,
    error,
    valid: !error,
    invalid: !!error,
    setValue,
    markAsTouched
  };

  return <FieldContext.Provider value={contextValue}>{props.children}</FieldContext.Provider>;
}
