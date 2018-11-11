import { FormApi } from '../lib/api';
import { FormContextValue } from '../lib/contexts/form-context';

export function mockFormContext<Model = any>(model: Model, override: Partial<FormContextValue<Model>> = {}): FormContextValue<Model> {
  const defaultOverride: Partial<FormContextValue<Model>> = {
    onFieldChange: () => {
    },
    onFieldBlur: () => {
    },
    onFieldFocus: () => {
    },
    onFieldMount: () => {
    },
    onFieldUnmount: () => {
    },
  };
  const context: Partial<FormContextValue<Model>> = {
    form: new FormApi({ model }),
    ...defaultOverride,
    ...override
  };

  return context as any;
}
