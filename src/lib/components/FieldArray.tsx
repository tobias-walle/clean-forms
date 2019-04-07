import * as React from 'react';
import { memo, useCallback } from 'react';
import { GetKey } from '.';
import { FieldArrayContext, FieldArrayContextProvider } from '../contexts/field-array-context';
import { FieldContextProvider } from '../contexts/field-context';

export type AddItem<Item> = (item: Item) => void;

export interface InnerFieldArrayProps<Item> {
  items: Item[];
  addItem: AddItem<Item>;
}

export type FieldArrayRender<Item> = (props: InnerFieldArrayProps<Item>) => React.ReactElement;

export interface FieldArrayProps<Item> {
  name: string;
  render: FieldArrayRender<Item>;
  getKey?: GetKey<Item>;
}

function _FieldArray<Item = any>({
  name,
  render,
  getKey,
}: FieldArrayProps<Item>) {
  const getIndexKey: GetKey<Item> = useCallback((_, index) => index, []);

  return (
    <FieldContextProvider
      relativeFieldPath={name}
      relativeModelPath={name}
    >
      <FieldArrayContextProvider getKey={getKey || getIndexKey}>
        <FieldArrayContext.Consumer>
          {context => {
            return context ? render(context) : null;
          }}
        </FieldArrayContext.Consumer>
      </FieldArrayContextProvider>
    </FieldContextProvider>
  );
}

export type FieldArray = typeof _FieldArray;
export const FieldArray: FieldArray = memo(_FieldArray) as any;
