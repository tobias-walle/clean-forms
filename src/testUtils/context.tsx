import * as React from 'react';
import { FieldArrayContext, FieldArrayContextValue } from '../lib/contexts/field-array-context';
import { FieldGroupContext, FieldGroupContextValue } from '../lib/contexts/field-group-context';
import { FormContext, FormContextValue } from '../lib/contexts/form-context';

export const withFormContext = (context: FormContextValue<any>) => (element: React.ReactNode) => (
  <FormContext.Provider value={context}>
    {element}
  </FormContext.Provider>
);

export const withGroupContext = (context: FieldGroupContextValue) => (element: React.ReactNode) => (
  <FieldGroupContext.Provider value={context}>
    {element}
  </FieldGroupContext.Provider>
);

export const withArrayContext = (context: FieldArrayContextValue) => (element: React.ReactNode) => (
  <FieldArrayContext.Provider value={context}>
    {element}
  </FieldArrayContext.Provider>
);
