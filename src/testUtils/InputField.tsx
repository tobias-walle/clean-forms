import * as React from 'react';
import { FieldRenderFunction } from '../lib/components/Field';
import { createField } from '../lib/hocs/index';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showErrorIfDirty?: boolean;
}

export const renderInput: FieldRenderFunction<string | number, InputFieldProps> = ({
  input: {
    name,
    value,
    onFocus,
    onChange,
    onBlur,
    error,
    touched,
    dirty
  },
  custom: {
    showErrorIfDirty,
    ...custom
  }
}) => {
  const showError = error && (showErrorIfDirty ? dirty : touched);
  return (
    <label>
      {custom.label}
      <input
        name={name}
        value={value}
        onChange={event => {
          let newValue: string | number = event.target.value;
          if (custom.type === 'number') {
            newValue = Number(newValue);
          }
          onChange(newValue);
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        {...custom}
      />
      {showError && <div>{error}</div>}
    </label>
  );
};

export const InputField = createField<string | number, InputFieldProps>(renderInput);
