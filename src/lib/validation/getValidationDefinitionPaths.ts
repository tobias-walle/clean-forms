import { createPath } from '../utils/createPath';
import { Path, Paths } from '../utils/FieldRegister';
import { isValidationResolver } from './isValidationResolver';
import { ArrayValidation, ValidationDefinition } from './ValidationDefinition';

export function getValidationDefinitionPaths(
  validationDefinition: ValidationDefinition<any> | ArrayValidation,
  value: any,
  parentPath: Path = ''
): Paths {
  if (validationDefinition instanceof ArrayValidation) {
    return getValidationDefinitionPathsForArray(validationDefinition, value, parentPath);
  } else {
    return getValidationDefinitionPathsForObject(validationDefinition, value, parentPath);
  }
}

export function getValidationDefinitionPathsForObject(
  validationDefinition: ValidationDefinition<any>,
  value: any,
  parentPath: Path = ''
): Paths {
  const keys = Object.keys(validationDefinition);
  return keys.reduce(getKeyPaths, []);

  function getKeyPaths(paths: Paths, key: string) {
    const currentPath = createPath(parentPath, key);
    const itemValue = value[key];
    const itemDefinition = validationDefinition[key];
    if (isValidationResolver(itemDefinition)) {
      paths.push(currentPath);
    } else if (typeof itemDefinition === 'object') {
      return [...paths, ...getValidationDefinitionPaths(itemDefinition, itemValue, currentPath)];
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
    initialPaths.push('');
  }
  return keys.reduce(getKeyPaths, initialPaths);

  function getKeyPaths(paths: Paths, key: string) {
    const currentPath = createPath(parentPath, key);
    const itemValue = (array as any)[key];
    const itemDefinition = arrayValidation.itemValidation;
    if (isValidationResolver(itemDefinition)) {
      paths.push(currentPath);
    } else if (typeof itemDefinition === 'object' && itemDefinition != null) {
      return [...paths, ...getValidationDefinitionPaths(itemDefinition, itemValue, currentPath)];
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
