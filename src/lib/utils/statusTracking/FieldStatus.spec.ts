import { cloneFieldStatus, FieldStatus, isFieldStatus } from './FieldStatus';

describe('FieldStatus', () => {
  it('should work this falsy arguments', () => {
    const fieldStatus = new FieldStatus({ dirty: false, touched: false });

    expect(fieldStatus.dirty).toBe(false);
    expect(fieldStatus.pristine).toBe(true);
    expect(fieldStatus.touched).toBe(false);
    expect(fieldStatus.untouched).toBe(true);
  });

  it('should work this truthy arguments', () => {
    const fieldStatus = new FieldStatus({ dirty: true, touched: true });

    expect(fieldStatus.dirty).toBe(true);
    expect(fieldStatus.pristine).toBe(false);
    expect(fieldStatus.touched).toBe(true);
    expect(fieldStatus.untouched).toBe(false);
  });

  it('should clone', () => {
    const fieldStatus = new FieldStatus({ dirty: false, touched: false });

    const clonedFieldStatus = cloneFieldStatus(fieldStatus, { dirty: true });

    expect(fieldStatus).toEqual(new FieldStatus({ dirty: false, touched: false }));
    expect(clonedFieldStatus).toEqual(new FieldStatus({ dirty: true, touched: false }));
  });
});

