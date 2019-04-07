import { MutableRefObject, useRef } from 'react';

export function useAsRef<T>(state: T): MutableRefObject<T> {
  const ref = useRef(state);
  ref.current = state;
  return ref;
}
