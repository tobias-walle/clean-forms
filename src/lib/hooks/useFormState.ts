import { useState } from 'react';
import { FormState } from '../api';

/** Helper hook to initialize the form state */
export function useFormState<T>(initialValue: T) {
  return useState<FormState<T>>({ model: initialValue });
}
