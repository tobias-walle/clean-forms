import { path } from '../models/Path';
import {
  combineValidationDefinitions,
  validateModel,
  ValidateModelArguments,
} from './FieldValidator';
import {
  ArrayValidation,
  ValidationDefinition,
  ValidationErrors,
} from './ValidationDefinition';

describe('validateModel', () => {
  it('should work if invalid', () => {
    const model = {
      a: 123,
      b: 'test',
    };
    type Model = typeof model;
    const error = 'Value has to be smaller than 100';
    const args: ValidateModelArguments<Model> = {
      model,
      validationDefinition: {
        a: value => (value < 100 ? null : error),
      },
    };

    const result = validateModel(args);

    expect(result).toEqual({ a: error });
  });

  it('should work if valid', () => {
    const model = {
      a: 50,
      b: 'test',
    };
    type Model = typeof model;
    const errorMessage = 'Value has to be smaller than 100';
    const args: ValidateModelArguments<Model> = {
      model,
      validationDefinition: {
        a: value => (value < 100 ? null : errorMessage),
      },
    };

    const result = validateModel(args);

    expect(result).toEqual({ a: undefined });
  });

  it('should catch errors in validation function', () => {
    const model = {
      a: 50,
      b: 'test',
    };
    type Model = typeof model;
    const args: ValidateModelArguments<Model> = {
      model,
      validationDefinition: {
        a: () => {
          throw new Error('Test');
        },
      },
    };
    console.error = jest.fn();

    const error = validateModel(args);

    expect(error).toEqual({ a: expect.any(String) });
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
      array: new ArrayValidation<Item[]>({
        a: value => (value > 1 ? null : error),
      }),
    };
    const args: ValidateModelArguments<Model> = { model, validationDefinition };

    const result = validateModel(args);

    expect(result).toEqual({ 'array.0.a': error });
  });

  it('should validate numbers in an array', () => {
    interface Model {
      array: number[];
    }

    const model: Model = { array: [0, 1] };
    const error = 'Value has to be greater than 0';
    const validationDefinition = {
      array: new ArrayValidation<number[]>(value => (value > 0 ? null : error)),
    };
    const args: ValidateModelArguments<Model> = { model, validationDefinition };

    const result = validateModel(args);

    expect(result).toEqual({ 'array.0': error, 'array.1': undefined });
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
      array: new ArrayValidation<Item[]>({
        a: value => (value > 1 ? null : error),
      }),
    };
    const args: ValidateModelArguments<Model> = { model, validationDefinition };

    const result = validateModel(args);

    expect(result).toEqual({});
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
      array: new ArrayValidation<Item[]>(null, value =>
        value.length > 1 ? null : error
      ),
    };
    const args: ValidateModelArguments<Model> = { model, validationDefinition };

    const result = validateModel(args);

    expect(result).toEqual({ array: error });
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
          new ArrayValidation<Item[]>({
            a: value => (value > 1 ? null : error),
          })
        )
      ),
    };
    const args: ValidateModelArguments<Model> = { model, validationDefinition };

    const result = validateModel(args);

    expect(result).toEqual({
      'array.0.0.0.a': error,
    });
  });

  it('should work with nested paths', () => {
    const model = {
      a: { b: { c: 123 } },
    };
    type Model = typeof model;
    const error = 'Value has to be smaller than 100';
    const args: ValidateModelArguments<Model> = {
      model,
      validationDefinition: {
        a: {
          b: {
            c: value => (value < 100 ? null : error),
          },
        },
      },
    };

    const result = validateModel(args);

    expect(result).toEqual({
      'a.b.c': error,
    });
  });
});

it('should get validation status mapping', () => {
  const model = {
    a: 0,
    b: {
      c: {
        d: 123,
        e: 0,
      },
    },
  };
  type Model = typeof model;
  const validationDefinition: ValidationDefinition<Model> = {
    a: value => (value !== 0 ? null : 'Value cannot be 0'),
    b: {
      c: {
        d: value => (value > 1000 ? null : 'Value has to be greater than 1000'),
        e: value => (value === 0 ? null : 'Value has to be 0'),
      },
    },
  };
  const expectedResult = {
    a: 'Value cannot be 0',
    'b.c.d': 'Value has to be greater than 1000',
    'b.c.e': undefined,
  };

  const result = validateModel({ model, validationDefinition });

  expect(result).toEqual(expectedResult);
});

it('should work if the validator returns multiple errors', () => {
  const model = {
    a: 0,
    b: {
      c: {
        d: 123,
        e: 0,
      },
    },
  };
  type Model = typeof model;
  const validationDefinition: ValidationDefinition<Model> = {
    a: value => (value !== 0 ? null : 'Value cannot be 0'),
    b: value => [
      ['c.d', value.c.d > 1000 ? null : 'Value has to be greater than 1000'],
      [path<Model['b']>().c.e, value.c.e === 0 ? null : 'Value has to be 0'],
      ['', 'Error'],
    ],
  };
  const expectedResult = {
    a: 'Value cannot be 0',
    'b.c.d': 'Value has to be greater than 1000',
    'b.c.e': undefined,
    b: 'Error',
  };

  const result = validateModel({ model, validationDefinition });

  expect(result).toEqual(expectedResult);
});

it('should combine multiple validators', () => {
  interface Model {
    a?: {
      b: number;
      c?: number;
    };
  }

  const aValidator1: ValidationDefinition<Model['a']> = (value: Model['a']) =>
    !!value ? null : 'Value is required';
  const aValidator2: ValidationDefinition<Model['a']> = (
    value: Model['a']
  ): ValidationErrors => [
    [
      'b',
      !value || value.b <= 0 ? null : 'Value has to smaller than or equal 0',
    ],
  ];
  const aValidator3: ValidationDefinition<Model['a']> = {
    c: (value: Model['a']) => (value == null ? 'Value is required' : null),
  };

  const validationDefinition = {
    a: combineValidationDefinitions<Model['a']>(
      aValidator1,
      aValidator2,
      aValidator3
    ),
  };

  expect(
    validateModel<Model>({
      model: {
        a: {
          b: 123,
        },
      },
      validationDefinition,
    })
  ).toEqual({
    a: undefined,
    'a.b': 'Value has to smaller than or equal 0',
    'a.c': 'Value is required',
  });

  expect(
    validateModel<Model>({
      model: {},
      validationDefinition,
    })
  ).toEqual({
    a: 'Value is required',
    'a.b': undefined,
    'a.c': undefined,
  });

  expect(
    validateModel<Model>({
      model: {
        a: {
          b: -100,
          c: 0,
        },
      },
      validationDefinition,
    })
  ).toEqual({
    a: undefined,
    'a.b': undefined,
    'a.c': undefined,
  });
});

it('should not override result on multiple validators', () => {
  const validationDefinition = combineValidationDefinitions<number>(
    a => (a > 0 ? null : 'greater 0'),
    a => (a != null ? null : 'required')
  );

  expect(
    validateModel({
      model: 0,
      validationDefinition,
    })
  ).toEqual({
    '': 'greater 0',
  });
});
