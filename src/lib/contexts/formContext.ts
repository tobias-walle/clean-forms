import * as React from 'react';
import { useContext } from 'react';
import { GetKey } from '../components';
import { FormReadApi } from '../hooks/useFormReadApi';
import { FieldPath } from '../models';
import { Path } from '../models/Path';
import { assertNotNull } from '../utils';

export type OnFieldMount<Model> = (fieldPath: FieldPath<unknown>) => void;

export type OnFieldUnmount<Model> = (fieldPath: FieldPath<unknown>) => void;

export type OnFieldBlur<Model> = (fieldPath: FieldPath<unknown>) => void;

export type OnFieldChange<Model> = (
  fieldPath: FieldPath<Model>,
  path: Path<Model>,
  value: any
) => void;

export type SetArrayGetKey<Model> = (
  fieldPath: FieldPath<Model>,
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
