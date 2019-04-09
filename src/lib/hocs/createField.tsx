import * as React from 'react';
import { memo, useMemo } from 'react';
import { FieldContext, FieldContextProvider, FieldContextValue } from '../contexts/fieldContext';
import { useShallowMemo } from '../hooks/useShallowMemo';
import { FieldStatus } from '../statusTracking';
import { Omit } from '../types';
import { composeFunctions } from '../utils/composeFunctions';
import { FieldError } from '../validation';
import { createStandaloneField, StandaloneFieldComponent } from './createStandaloneField';

export type FieldComponentProps<Value, CustomProps> =
  Omit<CustomProps, keyof FieldComponentPropsWithoutCustomProps<Value>>
  & FieldComponentPropsWithoutCustomProps<Value>;

export type FieldComponent<Value, CustomProps> = React.FunctionComponent<FieldComponentProps<Value, CustomProps>>
  & { standalone: StandaloneFieldComponent<Value, CustomProps> };

export function createField<Value, CustomProps = {}>(
  render: FieldRenderFunction<Value, CustomProps>,
): FieldComponent<Value, CustomProps> {
  const Component: FieldComponent<Value, CustomProps> = memo(({
    name,
    onValueChange,
    ...custom
  }: FieldComponentProps<Value, CustomProps>) => {
    name = name || '';
    const ownProps: FieldComponentPropsWithoutCustomProps<Value> = useShallowMemo({
      name,
      onValueChange,
    });

    return (
      <FieldContextProvider relativeFieldPath={name} relativeModelPath={name}>
        <FieldContext.Consumer>
          {context => <Field<Value, CustomProps>
            context={context!}
            customProps={custom as any}
            ownProps={ownProps}
            render={render}
          />}
        </FieldContext.Consumer>
      </FieldContextProvider>
    );
  }) as any;

  Component.displayName = `createField(${render.displayName || 'Component'})`;
  Component.standalone = createStandaloneField(render);
  return Component;
}

interface FieldProps<Value, CustomProps> {
  context: FieldContextValue<Value>;
  customProps: CustomProps;
  ownProps: FieldComponentPropsWithoutCustomProps<Value>;
  render: FieldRenderFunction<Value, CustomProps>;
}

function _Field<Value, CustomProps>({
  context,
  render,
  customProps,
  ownProps,
}: FieldProps<Value, CustomProps>) {
  const inputProps = useInputProps(context!, ownProps);

  return useMemo(() => {
    return render({
      input: inputProps,
      custom: customProps,
    });
  }, [customProps, inputProps, render]);
}

const Field: typeof _Field = memo(_Field) as any;

function useInputProps<Value>(
  fieldContext: FieldContextValue<Value>,
  ownProps: FieldComponentPropsWithoutCustomProps<Value>,
): InputProps<Value> {
  const {
    markAsTouched,
    name,
    setValue,
    value,
    error,
    valid,
    invalid,
    touched,
    untouched,
    pristine,
    dirty,
  } = fieldContext;

  const onChange = useMemo(
    () => composeFunctions(
      setValue,
      ownProps.onValueChange,
    ),
    [ownProps.onValueChange, setValue],
  );

  return useShallowMemo({
    onBlur: markAsTouched,
    onChange,
    name,
    value,
    error,
    valid,
    invalid,
    touched,
    untouched,
    pristine,
    dirty,
  });
}

export interface InputProps<Value> extends FieldStatus {
  name?: string;
  value: Value;
  onBlur: () => void;
  onChange: (value: Value) => void;
  error: FieldError;
  valid: boolean;
  invalid: boolean;
}

export interface InnerFieldProps<Value, CustomProps = {}> {
  input: InputProps<Value>;
  custom: CustomProps;
}

export type FieldRenderFunction<Value = any, RenderProps = {}> =
  React.FunctionComponent<InnerFieldProps<Value, RenderProps>>;

export interface FieldComponentPropsWithoutCustomProps<Value> {
  name: string | null;
  onValueChange?: (value: Value) => void;
}
