import * as React from 'react';
import { DEFAULT_FIELD_STATUS } from '../statusTracking';
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
  const result: React.StatelessComponent<StandaloneFieldProps<Value, CustomProps>> =
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
    ...DEFAULT_FIELD_STATUS,
    name: props.name,
    value: props.value,
    onChange: props.onChange || emptyFunction,
    onBlur: props.onBlur || emptyFunction,
    error: undefined,
    valid: true,
    invalid: false
  };

  const custom: any = {};
  const inputKeys = new Set(Object.keys(input));
  Object.keys(props)
    .filter(key => !inputKeys.has(key))
    .forEach(key => custom[key] = (props as any)[key]);

  return { input, custom };
}
