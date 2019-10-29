import { renderHook } from '@testing-library/react-hooks';
import { fieldPath } from '../models';
import { path } from '../models/Path';
import {
  DEFAULT_FIELD_STATUS,
  FieldStatus,
} from '../statusTracking/FieldStatus';
import { FieldStatusMapping } from '../statusTracking/FieldStatusMapping';
import { FormReadApi, useFormReadApi } from './useFormReadApi';

interface Model {
  a: number;
  b: number;
}

describe('FormApi', () => {
  let model: Model;
  let status: FieldStatusMapping;
  let api: FormReadApi<Model>;
  let aFieldStatus: FieldStatus;

  beforeEach(() => {
    model = { a: 1, b: 2 };
    aFieldStatus = new FieldStatus({ dirty: true, touched: true });
    status = { a: aFieldStatus };
    const { result } = renderHook(() =>
      useFormReadApi({
        value: model,
        status,
        validationDefinition: {},
        fieldErrorMapping: { a: 'Error' },
      })
    );

    api = result.current;
  });

  it('should get value for a specific field', () => {
    expect(api.getFieldValue(path<Model>().a)).toBe(1);
    expect(api.getFieldValue(path<Model>().b)).toBe(2);
    expect(() =>
      api.getFieldValue(path<any>().c)
    ).toThrowErrorMatchingSnapshot();
  });

  it('should get status for a specific field', () => {
    expect(api.getFieldStatus(fieldPath<Model>().a)).toBe(aFieldStatus);
    expect(api.getFieldStatus(fieldPath<Model>().b)).toBe(DEFAULT_FIELD_STATUS);
    expect(api.getFieldStatus(fieldPath<any>().c)).toBe(DEFAULT_FIELD_STATUS);
  });

  it('should get error for a specific field', () => {
    expect(api.getFieldError(path<Model>().a)).toBe('Error');
    expect(api.getFieldError(path<Model>().b)).toBe(undefined);
  });

  it('should get valid/inValid for an invalid form', () => {
    expect(api.invalid).toBe(true);
    expect(api.valid).toBe(false);
  });

  it('should get valid/inValid for an valid form', () => {
    const { result } = renderHook(() =>
      useFormReadApi({
        value: model
      })
    );
    api = result.current;

    expect(api.invalid).toBe(false);
    expect(api.valid).toBe(true);
  });
});
