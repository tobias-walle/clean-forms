import { useMemo } from 'react';
import { asPath, getPathAsString, PathLike } from '../models';

/**
 * Memorize a path. Only change the reference if content changes.
 */
export function useMemorizedPath<P extends PathLike<C, V>, C, V>(path: P): P {
  const pathAsString =
    typeof path === 'string'
      ? path
      : getPathAsString(asPath(path as PathLike<C, V>));
  path = useMemo(
    () => path,
    // eslint-disable-next-line
    [pathAsString]
  );
  return path;
}
