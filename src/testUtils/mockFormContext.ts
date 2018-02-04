import { FormApi } from '../lib/api/FormApi';
import { FormContext } from '../lib/components/Form/Form';

export function mockFormContext<Model = any>(model: Model, override: Partial<FormContext<Model>> = {}): FormContext<Model> {
  const defaultOverride: Partial<FormContext<Model>> = {
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
  const context: Partial<FormContext<Model>> = {
    form: new FormApi({ model }),
    ...defaultOverride,
    ...override
  };

  return context as any;
}
