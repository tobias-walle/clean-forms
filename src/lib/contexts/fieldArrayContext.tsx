import * as React from 'react';
import { useCallback, useContext } from 'react';
import { AddItem, GetKey } from '../components';
import { assertNotNull } from '../utils';
import { useFieldContext } from './fieldContext';

export interface FieldArrayContextValue<Item> {
  getKey: GetKey<Item>;
  addItem: AddItem<Item>;
  items: Item[];
}

export const FieldArrayContext = React.createContext<FieldArrayContextValue<any> | null>(null);

export function useFieldArrayContext<Item>(): FieldArrayContextValue<Item> {
  return assertNotNull(
    useContext(FieldArrayContext),
    'You can only use the FieldArrayContext inside a FieldArray'
  );
}

interface FieldArrayContextProviderProps<Item> {
  getKey: GetKey<Item>;
  children?: React.ReactNode;
}

function _FieldArrayContextProvider<Item>({ getKey, children }: FieldArrayContextProviderProps<Item>) {
  const { setValue: setArray, value: items } = useFieldContext<Item[]>();

  const addItem: AddItem<Item> = useCallback((item) => {
    const newArray = [...items, item];
    setArray(newArray);
  }, [items, setArray]);

  const context: FieldArrayContextValue<Item> = {
    addItem,
    getKey,
    items
  };

  return (
    <FieldArrayContext.Provider value={context}>
      {children}
    </FieldArrayContext.Provider>
  );
}

export const FieldArrayContextProvider: typeof _FieldArrayContextProvider = _FieldArrayContextProvider as any;
