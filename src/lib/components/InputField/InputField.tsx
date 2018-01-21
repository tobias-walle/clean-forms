import * as React from 'react';
import { createField } from '../../hocs';
import { FieldRenderFunction, FieldPropsWithoutRender } from '../Field/Field';

export type InputValue = number | string;
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const renderInput: FieldRenderFunction<InputValue, InputProps> = ({ input: { name, value, onChange }, custom }) => (
    <input {...custom} name={name} value={value} onChange={event => onChange(event.target.value)}/>
);

export const InputField = createField<InputValue, InputProps>(renderInput);
