import { useRef } from 'react';
import { isShallowEqual } from '../utils/isShallowEqual';

export function useShallowMemo<T>(object: T, debug: boolean = false): T {
  const cachedObjectRef = useRef(object);
  if (!isShallowEqual(object, cachedObjectRef.current, debug)) {
    cachedObjectRef.current = object;
  }
  return cachedObjectRef.current;
}
