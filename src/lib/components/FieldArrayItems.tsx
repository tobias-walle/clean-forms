import * as React from 'react';
import { memo, useCallback } from 'react';
import { useFieldArrayContext } from '../contexts/field-array-context';
import { FieldContext, FieldContextProvider, FieldContextValue, useFieldContext } from '../contexts/field-context';
import { DELETE } from '../utils';

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
  const { getKey } = useFieldArrayContext();
  const {
    value: array,
    setValue: setArray
  } = useFieldContext<Item[]>();

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
  const { getKey } = useFieldArrayContext();
  const relativeFieldPath = String(getKey(item, index));
  const relativeModelPath = String(index);
  const renderItem = useCallback(
    (fieldContext: FieldContextValue<Item>) => (
      render({
        remove: () => fieldContext.setValue(DELETE as any),
        setArray,
        index,
        item
      })
    ),
    [render, setArray, index, item]
  );

  return (
    <FieldContextProvider
      relativeFieldPath={relativeFieldPath}
      relativeModelPath={relativeModelPath}
    >
      <FieldContext.Consumer>
        {renderItem as any}
      </FieldContext.Consumer>
    </FieldContextProvider>
  );
}

const FieldArrayItem: typeof _FieldArrayItem = memo(_FieldArrayItem) as any;
