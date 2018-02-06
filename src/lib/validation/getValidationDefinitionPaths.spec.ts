import { Paths } from '../utils/FieldRegister';
import { getValidationDefinitionPaths } from './getValidationDefinitionPaths';
import { ArrayValidation, ValidationDefinition } from './ValidationDefinition';

describe('getValidationDefinitionPaths', () => {
  it('should get paths', () => {
    const value = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: []
        }
      }
    };
    const validationDefinition: ValidationDefinition<any> = {
      a: () => null,
      b: {
        c: () => null,
        d: {
          e: new ArrayValidation(null)
        }
      }
    };
    const expectedPaths: Paths = [
      'a',
      'b.c',
      'b.d.e',
    ];

    expect(getValidationDefinitionPaths(validationDefinition, value)).toEqual(expectedPaths);
  });

  it('should work with value arrays', () => {
    const model = [ 0 ];
    const arrayValidation = new ArrayValidation(
      () => null
    );
    const expectedPaths: Paths = [
      '0',
    ];

    expect(getValidationDefinitionPaths(arrayValidation, model)).toEqual(expectedPaths);
  });

  it('should work with object arrays', () => {
    const model = [ { a: '' } ];
    const arrayValidation = new ArrayValidation(
      { a: () => null },
    );
    const expectedPaths: Paths = [
      '0.a',
    ];

    expect(getValidationDefinitionPaths(arrayValidation, model)).toEqual(expectedPaths);
  });

  it('should work with array validators', () => {
    const model = [ { a: '' } ];
    const arrayValidation = new ArrayValidation(
      null,
      () => null
    );
    const expectedPaths: Paths = [
      ''
    ];

    expect(getValidationDefinitionPaths(arrayValidation, model)).toEqual(expectedPaths);
  });
});
