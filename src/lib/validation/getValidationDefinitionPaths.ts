import { createPath } from '../utils/createPath';
import { Path, Paths } from '../utils/FieldRegister';
import { isValidationResolver } from './isValidationResolver';
import { ArrayValidation, ValidationDefinition, ValidationMapping } from './ValidationDefinition';

export function getValidationDefinitionPaths(
  validationDefinition: ValidationDefinition<any> | ArrayValidation,
  value: any,
  parentPath: Path = ''
): Paths {
  if (validationDefinition instanceof Function) {
    return [''];
  } else if (validationDefinition instanceof ArrayValidation) {
    return getValidationDefinitionPathsForArray(validationDefinition, value, parentPath);
  } else {
    return getValidationDefinitionPathsForObject(validationDefinition, value, parentPath);
  }
}

export function getValidationDefinitionPathsForObject(
  validationDefinition: ValidationMapping<any>,
  value: any,
  parentPath: Path = ''
): Paths {
  const keys = Object.keys(validationDefinition);
  return keys.reduce(getKeyPaths, []);

  function getKeyPaths(paths: Paths, key: string): Paths {
    const currentPath = createPath(parentPath, key);
    if (value == null || validationDefinition == null) {
      return [];
    }
    const itemValue = value[key];
    const itemDefinition = validationDefinition[key];
    if (itemDefinition instanceof ArrayValidation || (!isValidationResolver(itemDefinition) && typeof itemDefinition === 'object')) {
      return [...paths, ...getValidationDefinitionPaths(itemDefinition, itemValue, currentPath)];
    } else if (isValidationResolver(itemDefinition)) {
      paths.push(currentPath);
    }
    return paths;
  }
}

function getValidationDefinitionPathsForArray(
  arrayValidation: ArrayValidation,
  array: any[],
  parentPath: Path = ''
): Paths {
  const keys = range(array.length).map(n => String(n));
  const initialPaths = [];
  if (arrayValidation.arrayValidation) {
    initialPaths.push(parentPath);
  }
  return keys.reduce(getKeyPaths, initialPaths);

  function getKeyPaths(paths: Paths, key: string) {
    const currentPath = createPath(parentPath, key);
    const itemValue = (array as any)[key];
    const itemDefinition = arrayValidation.itemValidation;
    if (itemDefinition != null) {
      if (itemDefinition instanceof ArrayValidation || (!isValidationResolver(itemDefinition) && typeof itemDefinition === 'object')) {
        return [...paths, ...getValidationDefinitionPaths(itemDefinition, itemValue, currentPath)];
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
