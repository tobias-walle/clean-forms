import React from 'react';
import { createField } from '../lib/hocs';

interface InputFieldProps {
  label: string;
}

export const InputField = createField<string,
  InputFieldProps & JSX.IntrinsicElements['input']>(
  ({
    input: { value, name, onChange, onBlur, error, touched },
    custom: { label, ...other },
  }) => {
    return (
      <div>
        <input
          value={value}
          name={name}
          onChange={event => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={label}
          {...other}
        />
        {touched && <div>{error}</div>}
      </div>
    );
  },
);
