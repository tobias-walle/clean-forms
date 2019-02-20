import * as React from 'react';
import { memo, useCallback, useLayoutEffect } from 'react';
import { FieldGroup, GetKey } from '.';
import {
  defaultFieldArrayContextValue,
  FieldArrayContext,
  FieldArrayContextValue
} from '../contexts/field-array-context';
import { useFieldGroupContext } from '../contexts/field-group-context';
import { useFormContext } from '../contexts/form-context';
import { createPath, selectDeep } from '../utils';

export type AddItem<Item> = (item: Item) => void;

export interface InnerFieldArrayProps<Item> {
  items: Item[];
  addItem: AddItem<Item>;
}

export type FieldArrayRender<Item> = (props: InnerFieldArrayProps<Item>) => React.ReactNode;

export interface FieldArrayProps<Item> {
  name: string;
  render: FieldArrayRender<Item>;
  getKey?: GetKey<Item>;
}

function _FieldArray<Item = any>({
  name,
  render,
  getKey
}: FieldArrayProps<Item>) {
  const { form, ...formContext } = useFormContext();
  const groupContext = useFieldGroupContext();
  const path = createPath(groupContext.path, name);
  const identifier = createPath(groupContext.namespace, name);

  const items = selectDeep({ object: form.model, path });

  useLayoutEffect(() => {
    formContext.onFieldMount(identifier);
    return () => formContext.onFieldUnmount(identifier);
  }, [identifier]);

  const setArray = useCallback((newArray: Item[]) => {
    formContext.onFieldChange(identifier, path, newArray);
  }, [formContext.onFieldChange, identifier, path]);

  const addItem: AddItem<Item> = useCallback((item) => {
    const newArray = [...items, item];
    setArray(newArray);
  }, [items, setArray]);

  const childContext: FieldArrayContextValue = getKey ? { getKey } : defaultFieldArrayContextValue;

  return (
    <FieldGroup name={name}>
      <FieldArrayContext.Provider value={childContext}>
        {render({ addItem, items })}
      </FieldArrayContext.Provider>
    </FieldGroup>
  );
}

export const FieldArray: typeof _FieldArray = memo(_FieldArray) as any;
