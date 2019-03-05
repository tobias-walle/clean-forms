import * as React from 'react';
import { FieldArrayContext, FieldArrayContextValue } from '../lib/contexts/field-array-context';
import { FormContext, FormContextValue } from '../lib/contexts/form-context';

export const withFormContext = (context: FormContextValue<any>) => (element: React.ReactNode) => (
  <FormContext.Provider value={context}>
    {element}
  </FormContext.Provider>
);

export const withArrayContext = (context: FieldArrayContextValue<any>) => (element: React.ReactNode) => (
  <FieldArrayContext.Provider value={context}>
    {element}
  </FieldArrayContext.Provider>
);
