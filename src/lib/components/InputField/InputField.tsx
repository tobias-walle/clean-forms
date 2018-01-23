import * as React from 'react';
import { createField } from '../../hocs';
import { FieldPropsWithoutRender, FieldRenderFunction, } from '../Field/Field';

export type InputValue = number | string;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const renderInput: FieldRenderFunction<InputValue, InputProps> = ({ input: { name, value, onChange }, custom }) => {
  const label = custom && custom.label;
  return <label>
    <div>{label}</div>
    <input {...custom} name={name} value={value} onChange={event => onChange(event.target.value)}/>
  </label>;
};

export const InputField = createField<InputValue, InputProps>(renderInput);
