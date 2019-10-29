export function combineProps<P1, P2>(props1: P1, props2: P2): P1 & P2 {
  const props = {
    ...props1,
    ...props2,
  };
  Object.entries(props1).forEach(([key, value1]) => {
    const value2 = (props2 as any)[key];
    if (typeof value1 !== 'function' || typeof value2 !== 'function') {
      return;
    }
    (props as any)[key] = (...args: any[]) => {
      value1(...args);
      value2(...args);
    };
  });
  return props;
}
