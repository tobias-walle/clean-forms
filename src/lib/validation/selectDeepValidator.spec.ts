import { path } from '../models/Path';
import { selectDeepValidator } from './selectDeepValidator';
import { ArrayValidation, ValidationDefinition } from './ValidationDefinition';

describe('selectDeepValidator', () => {
  it('should select from validation definition', () => {
    const validator = () => null;
    const object: ValidationDefinition<any> = {
      a: { b: { c: validator } },
    };
    const p = path<any>().a.b.c;

    const result = selectDeepValidator({ object, path: p });

    expect(result).toBe(validator);
  });

  it('should select item validation from array validation', () => {
    const validator = () => null;
    const object = new ArrayValidation(validator);
    const p = path<any[]>()[0];

    const result = selectDeepValidator({ object, path: p });

    expect(result).toBe(validator);
  });

  it('should select array validation from array validation', () => {
    const validator = () => null;
    const object: ArrayValidation = new ArrayValidation(null, validator);
    const p = path();

    const result = selectDeepValidator({ object, path: p });

    expect(result).toBe(validator);
  });

  it('should select deep array validation item validation from validation definition', () => {
    const validator = () => null;
    const object: ValidationDefinition<any> = {
      a: { b: { c: new ArrayValidation(validator) } },
    };
    const p = path<any>().a.b.c[0];

    const result = selectDeepValidator({ object, path: p });

    expect(result).toBe(validator);
  });

  it('should select deep array validation from validation definition', () => {
    const validator = () => null;
    const object: ValidationDefinition<any> = {
      a: { b: { c: new ArrayValidation(null, validator) } },
    };
    const p = path<any>().a.b.c;

    const result = selectDeepValidator({ object, path: p });

    expect(result).toBe(validator);
  });

  it('should select from a nested item array definition', () => {
    const validator = () => null;

    interface Model {
      a: {
        b: Array<{
          c: {
            d: 1;
          };
        }>;
      };
    }

    const object: ValidationDefinition<Model> = {
      a: {
        b: new ArrayValidation({
          c: {
            d: validator,
          },
        }),
      },
    };

    const p = path<Model>().a.b[0].c.d;

    const result = selectDeepValidator({ object, path: p });

    expect(result).toBe(validator);
  });
});
