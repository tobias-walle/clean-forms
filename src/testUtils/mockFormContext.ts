import { FormContext, FormInfo } from '../lib/components/Form/Form';

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
  const formInfo: Partial<FormInfo<any>> = { state: { model } };
  const context: Partial<FormContext<Model>> = {
    form: formInfo as any,
    ...defaultOverride,
    ...override
  };

  return context as any;
}
