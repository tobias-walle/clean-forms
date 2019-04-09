import * as React from 'react';
import { FieldContextProvider } from '../contexts/fieldContext';

export interface FieldGroupProps {
  name: string;
  accessor?: string;
  children?: React.ReactNode;
}

function _FieldGroup({
  name,
  accessor = name,
  children
}: FieldGroupProps) {
  return (
    <FieldContextProvider
      relativeModelPath={accessor}
      relativeFieldPath={name}
    >
      {children}
    </FieldContextProvider>
  );
}

export const FieldGroup = React.memo(_FieldGroup);
export type FieldGroup = typeof FieldGroup;
