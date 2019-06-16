import { getPathAsString, path, Paths } from '../models/Path';
import {
  getValidationDefinitionPaths,
} from './getValidationDefinitionPaths';
import { ArrayValidation, ValidationDefinition } from './ValidationDefinition';

function getPathsAsString(paths: Paths): string[] {
  return paths.map(p => getPathAsString(p));
}

describe('getValidationDefinitionPaths', () => {
  it('should get paths', () => {
    const value = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: [],
        },
      },
    };
    const validationDefinition: ValidationDefinition<any> = {
      a: () => null,
      b: {
        c: () => null,
        d: {
          e: new ArrayValidation(null, () => null),
        },
      },
    };
    const expectedPaths: Paths = [
      path<typeof value>().a,
      path<typeof value>().b.c,
      path<typeof value>().b.d.e,
    ];

    expect(
      getPathsAsString(
        getValidationDefinitionPaths(validationDefinition, value)
      )
    ).toEqual(getPathsAsString(expectedPaths));
  });

  it('should get paths if value is empty', () => {
    const value = {
      b: {
        c: 12,
      },
    };
    const validationDefinition: ValidationDefinition<any> = {
      a: () => null,
      b: {
        c: () => null,
        d: {
          e: new ArrayValidation(null, () => null),
        },
      },
    };
    const expectedPaths: Paths = [path<any>().a, path<typeof value>().b.c];

    expect(
      getPathsAsString(
        getValidationDefinitionPaths(validationDefinition, value)
      )
    ).toEqual(getPathsAsString(expectedPaths));
  });

  it('should work with value arrays', () => {
    const model = [0];
    const arrayValidation = new ArrayValidation<any>(() => null);
    const expectedPaths: Paths = [path<typeof model>()[0]];

    expect(
      getPathsAsString(
        getValidationDefinitionPaths(arrayValidation, model)
      )
    ).toEqual(getPathsAsString(expectedPaths));
  });

  it('should work with object arrays', () => {
    const model = [{ a: '' }];
    const arrayValidation = new ArrayValidation<typeof model>({
      a: () => null,
    });
    const expectedPaths: Paths = [path<typeof model>()[0].a];

    expect(
      getPathsAsString(
        getValidationDefinitionPaths(arrayValidation, model)
      )
    ).toEqual(getPathsAsString(expectedPaths));
  });

  it('should work with array validators', () => {
    const model = [{ a: '' }];
    const arrayValidation = new ArrayValidation(null, () => null);
    const expectedPaths: Paths = [path<typeof model>()];

    expect(
      getPathsAsString(
        getValidationDefinitionPaths(arrayValidation, model)
      )
    ).toEqual(getPathsAsString(expectedPaths));
  });

  it('should work with array validators in objects', () => {
    const model = { array: [{ a: '' }] };
    const arrayValidation = new ArrayValidation<typeof model['array']>(
      { a: () => null },
      () => null
    );
    const expectedPaths: Paths = [
      path<typeof model>().array,
      path<typeof model>().array[0].a,
    ];

    expect(
      getPathsAsString(
        getValidationDefinitionPaths({ array: arrayValidation }, model)
      )
    ).toEqual(getPathsAsString(expectedPaths));
  });
});
