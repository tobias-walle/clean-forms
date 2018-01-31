export function mergeDeep<T extends object, U extends object>(base: T, update: U): T & U {
  const result = { ...(base as any) };

  Object.keys(update)
    .forEach((key) => {
      const baseValue = result[key];
      const updatedValue = (update as any)[key];

      const baseValueIsObject = typeof baseValue === 'object';
      const updatedValueIsObject = typeof updatedValue === 'object';
      const bothValuesAreObjects = updatedValueIsObject && baseValueIsObject;

      if (bothValuesAreObjects) {
        result[key] = mergeDeep(baseValue, updatedValue);
      } else {
        result[key] = updatedValue;
      }
    });

  return result;
}
