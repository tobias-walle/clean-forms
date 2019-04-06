import * as React from 'react';
import { useCallback } from 'react';
import { FieldContext, FieldContextProvider, FieldContextValue } from '../contexts/field-context';
import { FieldStatus } from '../statusTracking';
import { Omit } from '../types';
import { FieldError } from '../validation';
import { createStandaloneField, StandaloneFieldComponent } from './createStandaloneField';

export type FieldComponentProps<CustomProps> = Omit<CustomProps, 'name'> & FieldComponentPropsWithoutCustomProps;

export type FieldComponent<Value, CustomProps> = React.FunctionComponent<FieldComponentProps<CustomProps>>
  & { standalone: StandaloneFieldComponent<Value, CustomProps> };

export function createField<Value, CustomProps = {}>(
  render: FieldRenderFunction<Value, CustomProps>,
): FieldComponent<Value, CustomProps> {
  const Component: FieldComponent<Value, CustomProps> = ({ name, ...custom }) => {
    name = name || '';

    const renderChildren = useCallback(
      (fieldContext: FieldContextValue<Value>) => render({
        input: createInputProps(fieldContext),
        custom: custom as any
      }),
      [custom]
    );

    return (
      <FieldContextProvider relativeFieldPath={name} relativeModelPath={name}>
        <FieldContext.Consumer>
          {renderChildren as any}
        </FieldContext.Consumer>
      </FieldContextProvider>
    );
  };

  Component.displayName = `createField(${render.displayName || 'Component'})`;
  Component.standalone = createStandaloneField(render);
  return Component;
}

function createInputProps<Value>(
  fieldContext: FieldContextValue<Value>
): InputProps<Value> {
  const {
    markAsTouched,
    setValue,
    ...fieldContextRest
  } = fieldContext;

  return {
    onBlur: markAsTouched,
    onChange: setValue,
    ...fieldContextRest
  };
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

export interface FieldComponentPropsWithoutCustomProps {
  name: string | null;
}
