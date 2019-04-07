import { useRef } from 'react';
import { isShallowEqual } from '../utils/isShallowEqual';

export function useShallowMemo<T>(object: T): T {
  const cachedObjectRef = useRef(object);
  if (!isShallowEqual(object, cachedObjectRef.current)) {
    cachedObjectRef.current = object;
  }
  return cachedObjectRef.current;
}
