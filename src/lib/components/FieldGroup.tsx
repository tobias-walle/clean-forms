import * as React from 'react';
import { FieldContextProvider } from '../contexts/field-context';

export interface FieldGroupProps {
  name: string;
  accessor?: string;
  children?: React.ReactNode;
}

function _FieldGroup({
  name,
  accessor = '',
  children
}: FieldGroupProps) {
  return (
    <FieldContextProvider
      relativeModelPath={name}
      relativeFieldPath={accessor}
    >
      {children}
    </FieldContextProvider>
  );
}

export const FieldGroup = React.memo(_FieldGroup);
export type FieldGroup = typeof FieldGroup;
