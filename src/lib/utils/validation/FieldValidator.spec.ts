import { FieldStatus } from '../statusTracking/FieldStatus';
import { FieldValidator, ValidateFieldArguments } from './FieldValidator';

describe('FieldValidator', () => {
  describe('getValidationStatus', () => {
    it('should work if invalid', () => {
      const model = {
        a: 123,
        b: 'test',
      };
      type Model = typeof model;
      const error = 'Value has to be smaller than 100';
      const args: ValidateFieldArguments<Model> = {
        model,
        validationDefinition: {
          a: ({ value }) => value < 100 ? null : error
        },
        path: ['a']
      };
      const expectedResult: Partial<FieldStatus> = {
        inValid: true,
        valid: false,
        error
      };

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
    });

    it('should work if valid', () => {
      const model = {
        a: 50,
        b: 'test',
      };
      type Model = typeof model;
      const errorMessage = 'Value has to be smaller than 100';
      const args: ValidateFieldArguments<Model> = {
        model,
        validationDefinition: {
          a: ({ value }) => value < 100 ? null : errorMessage
        },
        path: ['a']
      };
      const expectedResult: Partial<FieldStatus> = {
        inValid: false,
        valid: true
      };

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
    });

    it('should work with nested paths', () => {
      const model = {
        a: { b: { c: 123 }},
      };
      type Model = typeof model;
      const error = 'Value has to be smaller than 100';
      const args: ValidateFieldArguments<Model> = {
        model,
        validationDefinition: {
          a: { b: { c: ({ value }) => value < 100 ? null : error } }
        },
        path: ['a', 'b', 'c']
      };
      const expectedResult: Partial<FieldStatus> = {
        inValid: true,
        valid: false,
        error
      };

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
    });
  });
});
