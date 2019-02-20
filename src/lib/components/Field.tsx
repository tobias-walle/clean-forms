import React, { memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { FormApi } from '../api';
import { useFieldGroupContext } from '../contexts/field-group-context';
import { useFormContext } from '../contexts/form-context';
import { FieldStatus } from '../statusTracking';
import { createPath, Path } from '../utils';
import { FieldError } from '../validation';

export type FieldId = string;

export interface InputProps<Value> extends FieldStatus {
  name?: string;
  value: Value;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: Value) => void;
  error: FieldError;
  valid: boolean;
  inValid: boolean;
}

export interface InnerFieldProps<Value, Model = any, CustomProps = {}> {
  input: InputProps<Value>;
  form: FormApi<Model>;
  custom: CustomProps;
}

export type FieldRenderFunction<Value = any, Model = any, RenderProps = {}> =
  React.FunctionComponent<InnerFieldProps<Value, Model, RenderProps>>;

export interface FieldPropsWithoutRender {
  name: string | null;
}

export type FieldProps<Value, CustomProps = {}> = FieldPropsWithoutRender & {
  render: FieldRenderFunction<Value, any, CustomProps>;
  inner: CustomProps;
};

function _Field<Value = any, CustomProps = {}>({
  name,
  render,
  inner: custom
}: FieldProps<Value, CustomProps>) {
  const { form, ...formContext } = useFormContext();
  const groupContext = useFieldGroupContext();

  const path: Path = createPath(groupContext.path, name);
  const fieldId: FieldId = createPath(groupContext.namespace, name);

  const value = form.getFieldValue(path);
  const status = form.getFieldStatus(fieldId);
  const error = form.getFieldError(path);

  useLayoutEffect(() => {
    formContext.onFieldMount(fieldId);
    return () => formContext.onFieldUnmount(fieldId);
  }, [fieldId]);

  const handleFocus = useCallback(() => {
    formContext.onFieldFocus(fieldId);
  }, [formContext.onFieldFocus, fieldId]);

  const handleBlur = useCallback(() => {
    formContext.onFieldBlur(fieldId);
  }, [formContext.onFieldBlur, fieldId]);

  const handleChange = useCallback((newValue: Value) => {
    formContext.onFieldChange(fieldId, path, newValue);
  }, [formContext.onFieldBlur, fieldId, path]);

  const input: InputProps<Value> = {
    name: name || undefined,
    value,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleChange,
    ...status,
    error,
    valid: !error,
    inValid: !!error,
  };

  return render({ input, custom, form });
}

export const Field = memo(_Field);
