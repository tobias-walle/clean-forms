import { DEFAULT_FIELD_STATUS, FieldStatus } from '../statusTracking/FieldStatus';
import { FieldStatusMapping } from '../statusTracking/FieldStatusMapping';
import { FormApi } from './FormApi';

describe('FormApi', () => {
  let model: any;
  let status: FieldStatusMapping;
  let api: FormApi<any>;
  let aFieldStatus: FieldStatus;

  beforeEach(() => {
    model = { a: 1, b: 2 };
    aFieldStatus = new FieldStatus({ dirty: true, touched: true });
    status = { a: aFieldStatus };
    api = new FormApi<any>(
      { model, status },
      {},
      { a: 'Error' }
    );
  });

  it('should provide status', () => {
    expect(api.status).toBe(status);
  });

  it('should provide model', () => {
    expect(api.model).toBe(model);
  });

  it('should get value for a specific field', () => {
    expect(api.getFieldValue('a')).toBe(1);
    expect(api.getFieldValue('b')).toBe(2);
    expect(() => api.getFieldValue('c')).toThrowErrorMatchingSnapshot();
  });

  it('should get status for a specific field', () => {
    expect(api.getFieldStatus('a')).toBe(aFieldStatus);
    expect(api.getFieldStatus('b')).toBe(DEFAULT_FIELD_STATUS);
    expect(api.getFieldStatus('c')).toBe(DEFAULT_FIELD_STATUS);
  });

  it('should get error for a specific field', () => {
    expect(api.getFieldError('a')).toBe('Error');
    expect(api.getFieldError('b')).toBe(undefined);
  });

  it('should get valid/inValid for an invalid form', () => {
    expect(api.inValid).toBe(true);
    expect(api.valid).toBe(false);
  });

  it('should get valid/inValid for an valid form', () => {
    api = new FormApi({ model });
    expect(api.inValid).toBe(false);
    expect(api.valid).toBe(true);
  });
});
