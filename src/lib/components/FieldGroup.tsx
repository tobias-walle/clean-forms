import * as React from 'react';
import { FieldContextProvider } from '../contexts/fieldContext';
import { useMemorizedPath } from '../hooks';
import { FieldPathLike, PathLike } from '../models';

export interface FieldGroupProps<Model = any, Value = any> {
  name: FieldPathLike<Model, Value>;
  accessor?: PathLike<Model, Value>;
  children?: React.ReactNode;
}

function _FieldGroup<Model = any, Value = any>({
  name,
  accessor = name as any,
  children,
}: FieldGroupProps<Model, Value>) {
  name = useMemorizedPath(name);
  accessor = useMemorizedPath(accessor);
  return (
    <FieldContextProvider<Model, Value>
      relativeModelPath={accessor}
      relativeFieldPath={name}
    >
      {children}
    </FieldContextProvider>
  );
}

export const FieldGroup = React.memo(_FieldGroup);
export type FieldGroup = typeof FieldGroup;
