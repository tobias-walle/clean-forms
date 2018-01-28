import { FieldStatus } from '../statusTracking/FieldStatus';
import { FieldValidator, ValidateFieldArguments } from './FieldValidator';
import { ArrayValidation } from './ValidationDefinition';

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

    it('should catch errors in validation function', () => {
      const model = {
        a: 50,
        b: 'test',
      };
      type Model = typeof model;
      const args: ValidateFieldArguments<Model> = {
        model,
        validationDefinition: {
          a: () => {
            throw new Error('Test');
          }
        },
        path: ['a']
      };
      const expectedResult: Partial<FieldStatus> = {
        inValid: true,
        valid: false,
        error: expect.any(String)
      };
      console.error = jest.fn();

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
      expect(console.error).toHaveBeenCalledTimes(1);
      const errorMessage = (console.error as jest.Mock).mock.calls[0][0];
      expect(errorMessage).toMatchSnapshot();
    });

    it('should check if validation is invalid for an item', () => {
      const model = { a: [], };
      type Model = typeof model;
      const args: ValidateFieldArguments<Model> = {
        model,
        validationDefinition: { a: {} },
        path: ['a']
      };
      const expectedResult: Partial<FieldStatus> = {
        inValid: true,
        valid: false,
        error: expect.any(String)
      };
      console.error = jest.fn();

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
      expect(console.error).toHaveBeenCalledTimes(1);
      const errorMessage = (console.error as jest.Mock).mock.calls[0][0];
      expect(errorMessage).toMatchSnapshot();
    });

    it('should validate objects in an array', () => {
      interface Item {
        a: number;
        b: string;
      }

      interface Model {
        array: Item[];
      }

      const model: Model = { array: [{ a: 1, b: 'hello' }] };
      const error = 'Value has to be greater than 1';
      const validationDefinition = {
        array: new ArrayValidation<Model, Item>(
          { a: ({ value }) => value > 1 ? null : error },
        )
      };
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: ['array', '0', 'a'] };
      const expectedResult: Partial<FieldStatus> = {
        inValid: true,
        valid: false,
        error,
      };

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
    });

    it('should validate numbers in an array', () => {
      interface Model {
        array: number[];
      }

      const model: Model = { array: [0, 1] };
      const error = 'Value has to be greater than 0';
      const validationDefinition = {
        array: new ArrayValidation<Model, number>(
          ({ value }) => value > 0 ? null : error
        )
      };
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: ['array', '0'] };
      const expectedResult: Partial<FieldStatus> = {
        inValid: true,
        valid: false,
        error,
      };

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
    });

    it('should not validate objects in an empty array', () => {
      interface Item {
        a: number;
        b: string;
      }

      interface Model {
        array: Item[];
      }

      const model: Model = { array: [] };
      const error = 'Value has to be greater than 1';
      const validationDefinition = {
        array: new ArrayValidation<Model, Item>(
          { a: ({ value }) => value > 1 ? null : error },
        )
      };
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: ['array'] };
      const expectedResult: Partial<FieldStatus> = {
        inValid: false,
        valid: true,
      };

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
    });

    it('should validate array itself', () => {
      interface Item {
        a: number;
        b: string;
      }

      interface Model {
        array: Item[];
      }

      const model: Model = { array: [{ a: 1, b: 'hello' }] };
      const error = 'Array has to be bigger than 1';
      const validationDefinition = {
        array: new ArrayValidation<Model, Item>(
          null,
          ({ value }) => value.length > 1 ? null : error
        )
      };
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: ['array'] };
      const expectedResult: Partial<FieldStatus> = {
        inValid: true,
        valid: false,
        error,
      };

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
    });

    it('should run item validation if the value is not an array', () => {
      interface Model {
        value: number;
      }

      const model: Model = { value: 123 };
      const error = 'The number has to be smaller than 1';
      const validationDefinition = {
        value: new ArrayValidation<Model, number, any>(
          ({ value }) => value < 1 ? null : error
        )
      };
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: ['value'] };
      const expectedResult: Partial<FieldStatus> = {
        inValid: true,
        valid: false,
        error,
      };

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
    });

    it('should validate nested arrays', () => {
      interface Item {
        a: number;
        b: string;
      }

      interface Model {
        array: Item[][][];
      }

      const model: Model = { array: [[[{ a: 1, b: 'hello' }]]] };
      const error = 'Value has to be bigger than 1';
      const validationDefinition = {
        array: new ArrayValidation(
          new ArrayValidation(
            new ArrayValidation<Model, Item>(
              { a: ({ value }) => value > 1 ? null : error },
            )),
        )
      };
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: ['array', '0', '0', '0', 'a'] };
      const expectedResult: Partial<FieldStatus> = {
        inValid: true,
        valid: false,
        error,
      };

      const result = FieldValidator.getValidationStatus(args);

      expect(result).toEqual(expectedResult);
    });

    it('should work with nested paths', () => {
      const model = {
        a: { b: { c: 123 } },
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
