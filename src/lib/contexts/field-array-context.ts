import { useContext } from 'react';
import * as React from 'react';
import { GetKey } from '../components';

export interface FieldArrayContextValue {
  getKey: GetKey<any>;
}

export const defaultFieldArrayContextValue: FieldArrayContextValue = {
  getKey: (item, index) => `${index}`
};

export const FieldArrayContext = React.createContext<FieldArrayContextValue>(defaultFieldArrayContextValue);

export function useFieldArrayContext(): FieldArrayContextValue {
  return useContext(FieldArrayContext);
}
