import * as React from 'react';
import { FieldGroupContext, useFieldGroupContext } from '../contexts/field-group-context';
import { createPath } from '../utils';

export interface FieldGroupProps {
  name: string;
  accessor?: string;
  children?: React.ReactNode;
}

function _FieldGroup({ name, accessor, children }: FieldGroupProps) {
  const parentContext = useFieldGroupContext();
  const newContext = {
    path: createPath(parentContext.path, accessor || name),
    namespace: createPath(parentContext.namespace, name)
  };
  return (
    <FieldGroupContext.Provider value={newContext}>
      {children}
    </FieldGroupContext.Provider>
  );
}

export const FieldGroup = React.memo(_FieldGroup);
