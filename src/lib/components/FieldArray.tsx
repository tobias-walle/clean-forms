import * as React from 'react';
import { memo, useCallback } from 'react';
import { GetKey } from '.';
import {
  FieldArrayContext,
  FieldArrayContextProvider,
} from '../contexts/fieldArrayContext';
import { FieldContextProvider } from '../contexts/fieldContext';
import { useMemorizedPath } from '../hooks';
import { FieldPathLike } from '../models';

export type AddItem<Item> = (item: Item) => void;

export interface InnerFieldArrayProps<Item> {
  items: Item[];
  addItem: AddItem<Item>;
}

export type FieldArrayRender<Item> = (
  props: InnerFieldArrayProps<Item>
) => React.ReactElement;

export interface FieldArrayProps<Item> {
  name: FieldPathLike<unknown, Item[]>;
  render: FieldArrayRender<Item>;
  getKey?: GetKey<Item>;
}

function _FieldArray<Item = any>({
  name,
  render,
  getKey,
}: FieldArrayProps<Item>) {
  name = useMemorizedPath(name);
  const getIndexKey: GetKey<Item> = useCallback((_, index) => index, []);

  return (
    <FieldContextProvider relativeFieldPath={name} relativeModelPath={name}>
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
