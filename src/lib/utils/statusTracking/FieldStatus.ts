export interface FieldStatus {
  valid: boolean;
  inValid: boolean;
  pristine: boolean;
  dirty: boolean;
  untouched: boolean;
  touched: boolean;
  error?: string;
}

export const DEFAULT_FIELD_STATUS: FieldStatus = {
  valid: true,
  inValid: false,
  pristine: true,
  dirty: false,
  untouched: true,
  touched: false
};
