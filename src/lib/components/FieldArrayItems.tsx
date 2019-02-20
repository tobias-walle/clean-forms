import * as React from 'react';
import { memo, useCallback, useMemo } from 'react';
import { FieldGroup } from '.';
import { useFieldArrayContext } from '../contexts/field-array-context';
import { useFieldGroupContext } from '../contexts/field-group-context';
import { useFormContext } from '../contexts/form-context';
import { createPath, DELETE, selectDeep } from '../utils';

export type SetArray<Item> = (newArray: Item[]) => void;

export interface InnerFieldArrayItemProps<Item> {
  remove: () => void;
  item: Item;
  index: number;
  setArray: SetArray<Item>;
}

export type GetKey<Item> = (item: Item, index: number) => any;

export type FieldArrayItemsRender<Item> = (props: InnerFieldArrayItemProps<Item>) => React.ReactNode;

export interface FieldArrayItemsProps<Item> {
  render: FieldArrayItemsRender<Item>;
}

function _FieldArrayItems<Item = any>(props: FieldArrayItemsProps<Item>) {
  const { form, ...formContext } = useFormContext();
  const { path = '', namespace = '' } = useFieldGroupContext();
  const { getKey } = useFieldArrayContext();

  const array: Item[] = useMemo(
    () => selectDeep({ object: form.model, path }),
    [form.model, path]
  );

  const setArray: SetArray<Item> = useCallback((newArray): void => {
    formContext.onFieldChange(namespace, path, newArray);
  }, [formContext.onFieldChange, namespace, path]);

  return (
    <>
      {array.map((item, index) => <FieldArrayItem<Item>
        setArray={setArray}
        key={getKey(item, index)}
        item={item}
        index={index}
        fieldArrayItemsProps={props}
      />)}
    </>
  );
}

export const FieldArrayItems: typeof _FieldArrayItems = memo(_FieldArrayItems) as any;

interface FieldArrayItemProps<Item> {
  index: number;
  item: Item;
  setArray: SetArray<Item>;
  fieldArrayItemsProps: FieldArrayItemsProps<Item>;
}

function _FieldArrayItem<Item>({
  index,
  item,
  setArray,
  fieldArrayItemsProps: {
    render
  }
}: FieldArrayItemProps<Item>) {
  const formContext = useFormContext();
  const { getKey } = useFieldArrayContext();
  const groupContext = useFieldGroupContext();

  const name = String(getKey(item, index));
  const accessor = String(index);

  const path = createPath(groupContext.path, index);
  const identifier = createPath(groupContext.namespace, name);

  const removeItem = useCallback(() => {
    formContext.onFieldChange(identifier, path, DELETE);
  }, [formContext.onFieldChange, identifier, path]);

  return (
    <FieldGroup
      name={name}
      accessor={accessor}
    >
      {render({
        remove: removeItem,
        setArray,
        index,
        item
      })}
    </FieldGroup>
  );
}

const FieldArrayItem: typeof _FieldArrayItem = memo(_FieldArrayItem) as any;
