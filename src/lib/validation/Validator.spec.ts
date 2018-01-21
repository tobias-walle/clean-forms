import { Errors } from './Errors';
import { ValidationDefinition } from './ValidationDefinition';
import { Validator } from './Validator';

describe('Validator', () => {
  it('should validate a model', () => {
    const model = {
      a: 1,
      b: 'hello'
    };
    type Model = typeof model;
    const errorMessageForA = 'Value has to be greater than 1';
    const errorMessageForB = 'Value a to have more than 2 characters';
    const validationDefinition: ValidationDefinition<Model> = {
      a: ({value}) => value > 1 ? null : errorMessageForA,
      b: ({value}) => value.length > 2 ? null : errorMessageForB,
    };
    const expectedResult: Errors<Model> = {
      a: errorMessageForA,
      b: null
    };
    const validator = new Validator();

    const actualResult = validator.validate(model, validationDefinition);

    expect(actualResult).toEqual(expectedResult);
  });

  it('should validate with an empty definition', () => {
    const model = {
      a: 1,
      b: 'hello'
    };
    type Model = typeof model;
    const validationDefinition: ValidationDefinition<Model> = {};
    const expectedResult: Errors<Model> = {
      a: null,
      b: null
    };
    const validator = new Validator();

    const actualResult = validator.validate(model, validationDefinition);

    expect(actualResult).toEqual(expectedResult);
  });

  it('should validate a nested model', () => {
    const model = {
      a: 1,
      b: 'hello',
      c: {
        c1: 2,
        c2: 3,
      }
    };
    type Model = typeof model;
    const errorMessageForC1 = 'Value has to be greater than 5';
    const validationDefinition: ValidationDefinition<Model> = {
      c: {
        c1: ({value}) => value <= 5 ? errorMessageForC1 : null
      }
    };
    const expectedResult: Errors<Model> = {
      a: null,
      b: null,
      c: {
        c1: errorMessageForC1,
        c2: null
      }
    };
    const validator = new Validator();

    const actualResult = validator.validate(model, validationDefinition);

    expect(actualResult).toEqual(expectedResult);
  });

});