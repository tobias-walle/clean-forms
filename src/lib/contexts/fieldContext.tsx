import * as React from 'react';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useMemorizedPath } from '../hooks';
import { useShallowMemo } from '../hooks/useShallowMemo';
import {
  asPath,
  combinePaths,
  getPathAsString,
  Path,
  PathLike,
} from '../models/Path';
import { FieldStatus } from '../statusTracking';
import { assertNotNull, DELETE } from '../utils';
import { FieldError } from '../validation';
import { useFormContext } from './formContext';

export type SetFieldValueWithValue<Value> = (value: Value) => void;
export type SetFieldValueWithFunction<Value> = (
  update: (old: Value) => Value
) => void;
export type SetFieldValue<Value> = SetFieldValueWithValue<Value>;

export type MarkAsTouched = () => void;

export interface FieldContextValue<Value> extends FieldStatus {
  /** The path on the property in the model */
  path: Path<unknown, Value>;

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

export const FieldContext = React.createContext<FieldContextValue<any> | null>(
  null
);

export function useComputedFieldContext<ContextValue, Value>(
  relativePath: PathLike<ContextValue, Value>
): FieldContextValue<Value> {
  const formContext = useFormContext();
  const {
    getFieldValue,
    getFieldStatus,
    getFieldError,
    onFieldBlur,
    onFieldChange,
  } = formContext;
  const parentFieldContext = useFieldContext<ContextValue>();

  const path = useMemorizedPath(
    combinePaths(parentFieldContext.path, asPath(relativePath))
  );

  /** Register the field to the form */
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  useEffect(() => {
    formContextRef.current.onFieldMount(path);
    return () => formContextRef.current.onFieldUnmount(path);
    // eslint-disable-next-line
  }, []);

  const value = useMemo(() => getFieldValue(path), [getFieldValue, path]);

  const error = useMemo(() => getFieldError(path), [getFieldError, path]);

  const fieldStatus = useMemo(() => getFieldStatus(path), [getFieldStatus, path]);

  const setValue: SetFieldValue<Value | DELETE> = useCallback(
    valueOrUpdate => onFieldChange(path, valueOrUpdate),
    [onFieldChange, path]
  );

  const markAsTouched: MarkAsTouched = useCallback(() => {
    onFieldBlur(path);
  }, [onFieldBlur, path]);

  return useShallowMemo({
    ...fieldStatus,
    name: getPathAsString(path),
    path,
    value,
    error,
    valid: !error,
    invalid: !!error,
    setValue,
    markAsTouched,
  });
}

interface FieldContextProviderProps<Value> {
  relativePath: PathLike<unknown, Value>;
  children?: React.ReactNode;
}

export function FieldContextProvider<Value>(
  props: FieldContextProviderProps<Value>
) {
  return (
    <FieldContext.Provider
      value={useComputedFieldContext(
        props.relativePath
      )}
    >
      {props.children}
    </FieldContext.Provider>
  );
}

export function useFieldContext<Value>(): FieldContextValue<Value> {
  return assertNotNull(
    useContext(FieldContext),
    'You can only use the FieldContext inside a Form'
  ) as FieldContextValue<Value>;
}
