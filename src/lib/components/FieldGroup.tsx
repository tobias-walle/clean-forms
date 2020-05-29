import * as React from 'react';
import { FieldContextProvider } from '../contexts/fieldContext';
import { useMemorizedPath } from '../hooks';
import { PathLike } from '../models';

export interface FieldGroupProps<Model = any, Value = any> {
  name: PathLike<Model, Value>;
  children?: React.ReactNode;
}

function _FieldGroup<Model = any, Value = any>({
  name,
  children,
}: FieldGroupProps<Model, Value>) {
  name = useMemorizedPath(name);
  return (
    <FieldContextProvider relativePath={name}>
      {children}
    </FieldContextProvider>
  );
}

export const FieldGroup = React.memo(_FieldGroup);
export type FieldGroup = typeof FieldGroup;
