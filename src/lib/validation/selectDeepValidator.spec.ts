import { Path } from '../utils';
import { selectDeepValidator } from './selectDeepValidator';
import { ArrayValidation, ValidationDefinition } from './ValidationDefinition';

describe('selectDeepValidator', () => {
  it('should select from validation definition', () => {
    const validator = () => null;
    const object: ValidationDefinition<any> = {
      a: { b: { c: validator } }
    };
    const path = 'a.b.c';

    const result = selectDeepValidator({ object, path });

    expect(result).toBe(validator);
  });

  it('should select item validation from array validation', () => {
    const validator = () => null;
    const object = new ArrayValidation(validator);
    const path: Path = '0';

    const result = selectDeepValidator({ object, path });

    expect(result).toBe(validator);
  });

  it('should select array validation from array validation', () => {
    const validator = () => null;
    const object: ArrayValidation = new ArrayValidation(null, validator);
    const path: Path = '';

    const result = selectDeepValidator({ object, path });

    expect(result).toBe(validator);
  });

  it('should select deep array validation item validation from validation definition', () => {
    const validator = () => null;
    const object: ValidationDefinition<any> = {
      a: { b: { c: new ArrayValidation(validator) } }
    };
    const path = 'a.b.c.0';

    const result = selectDeepValidator({ object, path });

    expect(result).toBe(validator);
  });

  it('should select deep array validation from validation definition', () => {
    const validator = () => null;
    const object: ValidationDefinition<any> = {
      a: { b: { c: new ArrayValidation(null, validator) } }
    };
    const path = 'a.b.c';

    const result = selectDeepValidator({ object, path });

    expect(result).toBe(validator);
  });

  it('should select from a nested item array definition', () => {
    const validator = () => null;
    const object: ValidationDefinition<any> = {
      a: {
        b: new ArrayValidation({
          c: {
            d: validator
          }
        })
      }
    };
    const path = 'a.b.0.c.d';

    const result = selectDeepValidator({ object, path });

    expect(result).toBe(validator);
  });
});
