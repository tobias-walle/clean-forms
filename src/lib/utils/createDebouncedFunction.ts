export function createDebouncedFunction(func: (...args: any[]) => any, debounceTime: number): (...args: any[]) => void {
  let timeout: number | null = null;
  return (...args) => {
    const toCall = () => {
      timeout = null;
      func(...args);
    };

    timeout && clearTimeout(timeout);
    timeout = setTimeout(toCall, debounceTime);
  };
}
