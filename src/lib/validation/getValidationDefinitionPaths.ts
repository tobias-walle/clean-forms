import { path, Path, Paths } from '../models/Path';
import { isYupSchema } from '../utils/isYupSchema';
import { isValidationResolver } from './isValidationResolver';
import {
  ArrayValidation,
  ValidationDefinition,
  ValidationMapping,
} from './ValidationDefinition';

export function getValidationDefinitionPaths<T>(
  validationDefinition: ValidationDefinition<T>,
  value: T,
  parentPath: Path<T> = path()
): Paths {
  if (
    validationDefinition instanceof Function ||
    isYupSchema(validationDefinition)
  ) {
    return [parentPath];
  } else if (validationDefinition instanceof ArrayValidation) {
    return getValidationDefinitionPathsForArray(
      validationDefinition,
      value as any,
      parentPath
    );
  } else {
    return getValidationDefinitionPathsForObject(
      validationDefinition as ValidationMapping<any>,
      value as any,
      parentPath
    );
  }
}

export function getValidationDefinitionPathsForObject<T extends object>(
  validationDefinition: ValidationMapping<T>,
  value: T,
  parentPath: Path<T> = path()
): Paths {
  const keys = Object.keys(validationDefinition);
  return keys.reduce(getKeyPaths, []);

  function getKeyPaths(paths: Paths, key: string): Paths {
    const currentPath = (parentPath as any)[key];
    if (value == null || validationDefinition == null) {
      return [];
    }
    const itemValue = (value as any)[key];
    const itemDefinition = (validationDefinition as ValidationMapping<any>)[
      key
    ];
    if (
      itemDefinition instanceof ArrayValidation ||
      (!isValidationResolver(itemDefinition) &&
        typeof itemDefinition === 'object')
    ) {
      return [
        ...paths,
        ...getValidationDefinitionPaths(itemDefinition, itemValue, currentPath),
      ];
    } else if (isValidationResolver(itemDefinition)) {
      paths.push(currentPath);
    }
    return paths;
  }
}

function getValidationDefinitionPathsForArray<T extends any[]>(
  arrayValidation: ArrayValidation<T>,
  array: T,
  parentPath: Path<T> = path()
): Paths {
  const keys = range(array.length).map(n => String(n));
  const initialPaths = [];
  if (arrayValidation.arrayValidation) {
    initialPaths.push(parentPath);
  }
  return keys.reduce(getKeyPaths, initialPaths);

  function getKeyPaths(paths: Paths, key: string) {
    const currentPath = (parentPath as any)[key];
    const itemValue = (array as any)[key];
    const itemDefinition = arrayValidation.itemValidation as ValidationDefinition<
      any
    >;
    if (itemDefinition != null) {
      if (
        itemDefinition instanceof ArrayValidation ||
        (!isValidationResolver(itemDefinition) &&
          typeof itemDefinition === 'object')
      ) {
        return [
          ...paths,
          ...getValidationDefinitionPaths(
            itemDefinition,
            itemValue,
            currentPath
          ),
        ];
      } else if (isValidationResolver(itemDefinition)) {
        paths.push(currentPath);
      }
    }
    return paths;
  }
}

function range(max: number): number[] {
  const result = [];
  for (let i = 0; i < max; i++) {
    result.push(i);
  }
  return result;
}
