import * as React from 'react';
import styled from 'react-emotion';
import { createField } from '../../lib/hocs';

const Wrapper = styled('label')`
  display: block;
  margin-bottom: .5rem;
`;

const Label = styled('span')`
  font-size: .8rem;
  font-weight: bold;
`;

const ErrorMessage = styled('span')`
  font-size: .8rem;
  color: red;
`;

export interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = createField<string | number, StyledInputProps>(({
  input: {
    name,
    onFocus,
    onChange,
    onBlur,
    error,
    touched
  },
  custom: {
    label
  }
}) => {
  return (
    <Wrapper>
      <div>
        <Label>{label}</Label>
        <span> </span>
        {touched ? <ErrorMessage>{error}</ErrorMessage> : ''}
      </div>
      <input
        name={name}
        onChange={event => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </Wrapper>
  );
});
