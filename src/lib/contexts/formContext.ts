import * as React from 'react';
import { useContext } from 'react';
import { GetKey } from '../components';
import { FormReadApi } from '../hooks/useFormReadApi';
import { Path } from '../models/Path';
import { assertNotNull } from '../utils';

export type OnFieldMount<Model> = (path: Path<unknown>) => void;

export type OnFieldUnmount<Model> = (path: Path<unknown>) => void;

export type OnFieldBlur<Model> = (path: Path<unknown>) => void;

export type OnFieldChange<Model> = (
  path: Path<Model>,
  value: any
) => void;

export type SetArrayGetKey<Model> = (
  path: Path<Model>,
  getKey: GetKey<any>
) => void;

export interface FormContextValue<Model> extends FormReadApi<Model> {
  onFieldMount: OnFieldMount<Model>;
  onFieldUnmount: OnFieldUnmount<Model>;
  onFieldBlur: OnFieldBlur<Model>;
  onFieldChange: OnFieldChange<Model>;
  setArrayGetKey: SetArrayGetKey<Model>;
}

export const FormContext = React.createContext<FormContextValue<any> | null>(
  null
);

export function useFormContext<T>(): FormContextValue<T> {
  return assertNotNull(
    useContext(FormContext),
    'This component needs to be used inside a FormContext'
  );
}
