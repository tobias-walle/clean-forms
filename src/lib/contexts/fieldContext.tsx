import * as React from 'react';
import {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useMemorizedPath } from '../hooks';
import { useShallowMemo } from '../hooks/useShallowMemo';
import { FieldPath, FieldPathLike } from '../models';
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
  /** The path to the field. Used for example for storing the error message */
  fieldPath: FieldPath<unknown, Value>;

  /** The path on the file model */
  modelPath: Path<unknown, Value>;

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
  relativeModelPath: PathLike<ContextValue, Value>,
  relativeFieldPath: FieldPathLike<ContextValue, Value>
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

  const fieldPath = useMemorizedPath(combinePaths(
    parentFieldContext.fieldPath,
    asPath(relativeFieldPath)
  ));

  const modelPath = useMemorizedPath(combinePaths(
    parentFieldContext.modelPath,
    asPath(relativeModelPath)
  ));

  /** Register the field to the form */
  const formContextRef = useRef(formContext);
  formContextRef.current = formContext;
  useLayoutEffect(() => {
    formContextRef.current.onFieldMount(fieldPath);
    return () => formContextRef.current.onFieldUnmount(fieldPath);
    // eslint-disable-next-line
  }, []);

  const value = useMemo(() => getFieldValue(modelPath), [
    getFieldValue,
    modelPath,
  ]);

  const error = useMemo(() => getFieldError(modelPath), [
    getFieldError,
    modelPath,
  ]);

  const fieldStatus = useMemo(() => getFieldStatus(fieldPath), [
    getFieldStatus,
    fieldPath,
  ]);

  const setValue: SetFieldValue<Value | DELETE> = useCallback(
    valueOrUpdate => onFieldChange(fieldPath, modelPath, valueOrUpdate),
    [fieldPath, modelPath, onFieldChange]
  );

  const markAsTouched: MarkAsTouched = useCallback(() => {
    onFieldBlur(fieldPath);
  }, [fieldPath, onFieldBlur]);

  return useShallowMemo({
    ...fieldStatus,
    name: getPathAsString(fieldPath),
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

interface FieldContextProviderProps<ContextValue, Value> {
  relativeModelPath: PathLike<ContextValue, Value>;
  relativeFieldPath: FieldPathLike<ContextValue, Value>;
  children?: React.ReactNode;
}

export function FieldContextProvider<ContextValue, Value>(
  props: FieldContextProviderProps<ContextValue, Value>
) {
  return (
    <FieldContext.Provider
      value={useComputedFieldContext(
        props.relativeModelPath,
        props.relativeFieldPath
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
