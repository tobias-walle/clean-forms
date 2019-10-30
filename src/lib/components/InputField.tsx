import * as React from 'react';
import { createField } from '../hocs';
import { getInputProps } from '../utils/getInputProps';

export const InputField = createField<string, JSX.IntrinsicElements['input']>(
  ({ input: fieldInputProps, custom }) => {
    return <input {...getInputProps(fieldInputProps, custom)} />;
  }
);
