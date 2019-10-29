import React from 'react';
import { InputProps } from '../hocs';
import { combineProps } from './combineProps';

export function getInputProps(
  fieldInputProps: InputProps<number | string | string[]>,
  customProps: React.PropsWithoutRef<JSX.IntrinsicElements['input']> = {}
): JSX.IntrinsicElements['input'] {
  const inputProps: JSX.IntrinsicElements['input'] = {
    name: fieldInputProps.name,
    value: fieldInputProps.value,
    onBlur: fieldInputProps.onBlur,
    onChange: event => fieldInputProps.onChange(event.target.value as any),
  };
  return combineProps(inputProps, customProps);
}