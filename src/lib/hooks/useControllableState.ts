import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface UseControllableStateOptions<T> {
  initialStateIfNotControlled: T;
  controlledState?: T;
  onChange?: (value: T) => void;
}

export function useControllableState<T>(
  options: UseControllableStateOptions<T>
): [T, Dispatch<SetStateAction<T>>] {
  const { initialStateIfNotControlled, controlledState, onChange } = options;
  const [innerState, setInnerState] = useState(initialStateIfNotControlled);

  useEffect(() => {
    onChange && onChange(innerState);
  }, [innerState, onChange, options]);

  if (controlledState !== undefined) {
    return [controlledState, setInnerState];
  } else {
    return [innerState, setInnerState];
  }
}
