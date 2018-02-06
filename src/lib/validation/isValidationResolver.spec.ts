import { isValidationResolver } from './isValidationResolver';
import { ArrayValidation } from './ValidationDefinition';

describe('isValidationResolver', () => {
  it('should work with functions', () => {
    expect(isValidationResolver(() => {})).toBe(true);
  });

  it('should work with array validations', () => {
    expect(isValidationResolver(new ArrayValidation(null))).toBe(true);
  });

  it(`shouldn't work with other types`, () => {
    expect(isValidationResolver('test')).toBe(false);
    expect(isValidationResolver(true)).toBe(false);
    expect(isValidationResolver(null)).toBe(false);
    expect(isValidationResolver({})).toBe(false);
  });
});
