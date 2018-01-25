export function createDebouncedFunction<Args>(func: (...args: Args) => any, debounceTime: number): (...args: Args) => void {
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
