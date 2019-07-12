import * as React from 'react';
import { Omit } from '../types';
import { emptyFunction } from '../utils/emptyFunction';
import { FieldRenderFunction, InputProps } from './createField';

export type StandaloneFieldProps<Value, CustomProps> =
  Omit<CustomProps, keyof InputProps<Value>>
  & Partial<Omit<InputProps<Value>, 'value'>>
  & Pick<InputProps<Value>, 'value'>;

export type StandaloneFieldComponent<Value, CustomProps> =
  React.FunctionComponent<StandaloneFieldProps<Value, CustomProps>>;

export function createStandaloneField<Value, CustomProps = {}>(
  render: FieldRenderFunction<Value, CustomProps>
): StandaloneFieldComponent<Value, CustomProps> {
  const result: React.FunctionComponent<StandaloneFieldProps<Value, CustomProps>> =
    (props) => render({
      ...splitStandaloneFieldProps(props)
    });
  result.displayName = `createStandaloneField(${render.displayName || 'Component'})`;
  return result;
}

function splitStandaloneFieldProps<Value, CustomProps>(props: StandaloneFieldProps<Value, CustomProps>): {
  input: InputProps<Value>,
  custom: CustomProps
} {
  const input: InputProps<Value> = {
    ...props,
    name: props.name,
    value: props.value,
    onChange: props.onChange || emptyFunction,
    onBlur: props.onBlur || emptyFunction,
    error: props.error,
    valid: !!props.valid,
    invalid: !!props.invalid,
    dirty: !!props.dirty,
    pristine: !!props.pristine,
    touched: !!props.touched,
    untouched: !!props.untouched
  };

  const custom: any = {};
  const inputKeys = new Set(Object.keys(input));
  Object.keys(props)
    .filter(key => !inputKeys.has(key))
    .forEach(key => custom[key] = (props as any)[key]);

  return { input, custom };
}
