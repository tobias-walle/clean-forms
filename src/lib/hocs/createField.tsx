import * as React from 'react';
import { memo, useCallback, useMemo } from 'react';
import { FieldContext, FieldContextProvider, FieldContextValue } from '../contexts/field-context';
import { useShallowMemo } from '../hooks/useShallowMemo';
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
  const Component: FieldComponent<Value, CustomProps> = memo(({ name, ...custom }: FieldComponentProps<CustomProps>) => {
    name = name || '';

    const Field = useCallback(
      (context: FieldContextValue<Value>) => {
        let inputProps = useMemo(() => {
          return createInputProps(context!);
        }, [context]);
        inputProps = useShallowMemo(inputProps);

        return useMemo(() => {
          return render({
            input: inputProps,
            custom: custom as any,
          });
        }, [inputProps]);
      },
      [custom],
    );

    return (
      <FieldContextProvider relativeFieldPath={name} relativeModelPath={name}>
        <FieldContext.Consumer>
          {context => <Field {...context!}/>}
        </FieldContext.Consumer>
      </FieldContextProvider>
    );
  }) as any;

  Component.displayName = `createField(${render.displayName || 'Component'})`;
  Component.standalone = createStandaloneField(render);
  return Component;
}

function createInputProps<Value>(
  fieldContext: FieldContextValue<Value>,
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

  return {
    onBlur: markAsTouched,
    onChange: setValue,
    name,
    value,
    error,
    valid,
    invalid,
    touched,
    untouched,
    pristine,
    dirty,
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
