import {
  cloneFieldStatus, DEFAULT_FIELD_STATUS, FieldStatus,
  FieldStatusArguments
} from '../statusTracking/FieldStatus';
import { FieldStatusMapping } from '../statusTracking/FieldStatusMapping';
import { FieldValidator, ValidateFieldArguments } from './FieldValidator';
import { ArrayValidation, ValidationDefinition } from './ValidationDefinition';

describe('FieldValidator', () => {
  let fieldValidator: FieldValidator<any>;

  beforeEach(() => {
    fieldValidator = new FieldValidator<any>();
  });

  describe('validateField', () => {
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
        path: 'a'
      };

      const result = fieldValidator.validateField(args);

      expect(result).toEqual(error);
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
        path: 'a'
      };

      const result = fieldValidator.validateField(args);

      expect(result).toEqual(undefined);
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
        path: 'a'
      };
      console.error = jest.fn();

      const error = fieldValidator.validateField(args);

      expect(error).toEqual(expect.any(String));
      expect(console.error).toHaveBeenCalledTimes(1);
      const consoleErrorMessage = (console.error as jest.Mock).mock.calls[0][0];
      expect(consoleErrorMessage).toMatchSnapshot();
    });

    it('should check if validation is invalid for an item', () => {
      const model = { a: [], };
      type Model = typeof model;
      const args: ValidateFieldArguments<Model> = {
        model,
        validationDefinition: { a: {} as any },
        path: 'a'
      };
      console.error = jest.fn();

      const error = fieldValidator.validateField(args);

      expect(error).toEqual(expect.any(String));
      expect(console.error).toHaveBeenCalledTimes(1);
      const consoleErrorMessage = (console.error as jest.Mock).mock.calls[0][0];
      expect(consoleErrorMessage).toMatchSnapshot();
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
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: 'array.0.a' };

      const result = fieldValidator.validateField(args);

      expect(result).toEqual(error);
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
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: 'array.0' };

      const result = fieldValidator.validateField(args);

      expect(result).toEqual(error);
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
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: 'array' };

      const result = fieldValidator.validateField(args);

      expect(result).toBe(undefined);
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
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: 'array' };

      const result = fieldValidator.validateField(args);

      expect(result).toBe(error);
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
      const validationDefinition: ValidationDefinition<Model> = {
        array: new ArrayValidation(
          new ArrayValidation(
            new ArrayValidation<Model, Item>(
              { a: ({ value }) => value > 1 ? null : error },
            )),
        )
      };
      const args: ValidateFieldArguments<Model> = { model, validationDefinition, path: 'array.0.0.0.a' };

      const result = fieldValidator.validateField(args);

      expect(result).toEqual(error);
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
          a: {
            b: {
              c: ({ value }) => value < 100 ? null : error,
            }
          }
        },
        path: 'a.b.c'
      };

      const result = fieldValidator.validateField(args);

      expect(result).toEqual(error);
    });
  });

  describe('validateModel', () => {
    it('should get validation status mapping', () => {
      const model = {
        a: 0,
        b: {
          c: {
            d: 123,
            e: 0,
          }
        }
      };
      type Model = typeof model;
      const validationDefinition: ValidationDefinition<Model> = {
        a: ({ value }) => value !== 0 ? null : 'Value cannot be 0',
        b: {
          c: {
            d: ({ value }) => value > 1000 ? null : 'Value has to be greater than 1000',
            e: ({ value }) => value === 0 ? null : 'Value has to be 0'
          }
        }
      };
      const expectedResult = {
        a: 'Value cannot be 0',
        'b.c.d': 'Value has to be greater than 1000',
        'b.c.e': undefined,
      };

      const result = fieldValidator.validateModel({ model, validationDefinition });

      expect(result).toEqual(expectedResult);
    });
  });
});