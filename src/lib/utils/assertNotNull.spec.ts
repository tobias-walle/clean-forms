import { assertNotNull } from './assertNotNull';

describe('assertNotNull', () => {
  it('should return value if value is not null', () => {
    expect(assertNotNull(123, 'Value cannot be null')).toBe(123);
    expect(assertNotNull(0, 'Value cannot be null')).toBe(0);
    expect(assertNotNull('', 'Value cannot be null')).toBe('');
  });

  it('should throw error if value is null or undefined', () => {
    expect(() => assertNotNull(null, 'Cannot be null'))
      .toThrowError(new Error('Cannot be null'));
    expect(() => assertNotNull(undefined, 'Cannot be undefined'))
      .toThrowError(new Error('Cannot be undefined'));
  });
});
