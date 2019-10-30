const pathSegmentsSymbol = Symbol('pathSegmentsSymbol');

export type Path<T, V = any> = {
  [K in keyof V]-?: V[K] extends undefined | never | null ? V[K] : Path<T, V[K]>
} & {
  [pathSegmentsSymbol]: Array<keyof any>;
};

export type Paths = Array<Path<any>>;

export function path<T>(): Path<T, T> {
  return new Proxy<Path<T, T>>(
    {
      [pathSegmentsSymbol]: [],
    } as any,
    pathProxyHandler
  );
}

export function getPathSegments(p: Path<unknown>): Array<keyof any> {
  return p[pathSegmentsSymbol];
}

export function getPathAsString(p: Path<unknown>): string {
  return getPathSegments(p).join('.');
}

const pathProxyHandler = {
  get(target: Path<unknown>, key: keyof any): any {
    if (key === 'valueOf') {
      return () => getPathAsString(target);
    }
    if (key in target) {
      return (target as any)[key];
    }

    const pathSegments = getPathSegments(target);
    return new Proxy(
      {
        [pathSegmentsSymbol]: [...pathSegments, key],
      } as any,
      pathProxyHandler
    );
  },
};

export type PathValue<P extends Path<any, any>> = P extends Path<any, infer V>
  ? V
  : never;

export function combinePaths<T, V, R>(
  p1: Path<T, V>,
  p2: Path<V, R>
): Path<T, R> {
  return pathSegmentsAsPath([
    ...getPathSegments(p1),
    ...getPathSegments(p2),
  ]) as Path<T, R>;
}

/** Types that can be converted to a path */
export type PathLike<T, V = any> = string | Array<keyof any> | Path<T, V>;

export function asPath<T = unknown, V = any>(pathLike: PathLike<T, V>): Path<T, V> {
  if (typeof pathLike === 'string') {
    return pathStringAsPath(pathLike) as Path<T, V>;
  } else if (pathLike instanceof Array) {
    return pathSegmentsAsPath(pathLike) as Path<T, V>;
  } else {
    return pathLike;
  }
}

export function pathSegmentsAsPath(
  segments: Array<keyof any>
): Path<unknown, unknown> {
  return new Proxy(
    {
      [pathSegmentsSymbol]: segments,
    } as any,
    pathProxyHandler
  );
}

const arrayIndexRegex = /\[(\d+)]/;
export function pathStringAsPath(string: string) {
  const normalizedString = string.replace(arrayIndexRegex, '.$1');
  return pathSegmentsAsPath(normalizedString.split('.').filter(v => v));
}
