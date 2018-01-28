import { Path } from './FieldRegister';

export function getParentPath(path: Path): Path {
  const length = path.length;
  if (length <= 1) {
    throw new ReferenceError('Path does not have a parent');
  }
  return path.slice(0, length - 1);
}
