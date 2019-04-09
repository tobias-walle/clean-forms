export function composeFunctions<A extends any[]>(
  ...functions: Array<((...args: A) => void) | undefined>
): (...args: A) => void {
  return (...props) => {
    functions
      .filter(f => f != null)
      .forEach(f => f!(...props));
  };
}
