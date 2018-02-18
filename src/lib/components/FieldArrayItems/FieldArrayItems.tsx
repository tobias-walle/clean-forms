import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FieldArrayContext, fieldArrayContextTypes, FieldGroup } from '../';
import { DELETE, selectDeep } from '../../utils';
import { createPath } from '../../utils/createPath';
import { Path } from '../../utils/FieldRegister';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, formContextTypes } from '../Form/Form';

export interface InnerFieldArrayItemProps<Item> {
  remove: () => void;
  item: Item;
  setArray: (newArray: Item[]) => void;
}

export type GetKey<Item> = (item: Item, index: number) => any;

export type FieldArrayItemsRender<Item> = React.StatelessComponent<InnerFieldArrayItemProps<Item>>;

export interface FieldArrayItemsProps<Item> {
  render: FieldArrayItemsRender<Item>;
}

export interface FieldArrayItemsState {
}

export class FieldArrayItems<Item = any> extends React.Component<FieldArrayItemsProps<Item>, FieldArrayItemsState> {
  public static contextTypes = {
    ...formContextTypes,
    ...fieldGroupContextTypes,
    ...fieldArrayContextTypes
  };
  public context: FormContext<any> & FieldGroupContext & FieldArrayContext;
  private array: Item[];

  public render() {
    const { render } = this.props;
    const getKey = this.getKeyFunction();
    this.array = this.getArray();
    return (
      <>
      {this.array.map((item, index) => (
        <FieldGroup
          key={getKey(item, index)}
          name={this.getNameForItem(item, index)}
          accessor={this.getAccessorForItem(index)}
        >
          {render({
            remove: () => this.removeItem(item, index),
            setArray: this.setArray,
            item
          })}
        </FieldGroup>
      ))}
      </>
    );
  }

  private getArray(): Item[] {
    const { form: { state: { model }}, path = '' } = this.context;
    return selectDeep({ object: model, path });
  }

  private removeItem(item: Item, index: number): void {
    const { onFieldChange } = this.context;
    const identifier = this.getItemIdentifier(item, index);
    const path = this.getItemPath(index);
    onFieldChange(identifier, path, DELETE);
  }

  private getItemPath(index: number): Path {
    return createPath(this.context.path, index);
  }

  private getItemIdentifier(item: Item, index: number): Path {
    return createPath(this.context.namespace, this.getNameForItem(item, index));
  }

  private getNameForItem(item: Item, index: number): string {
    const getKey = this.getKeyFunction();
    return String(getKey(item, index));
  }

  private getKeyFunction(): GetKey<Item> {
    const { getKey } = this.context;
    if (!getKey) {
      throw new Error(`Invalid context. Please make sure that "FieldArrayItems" is wrapped by a "FieldArray"`);
    }
    return getKey;
  }

  private setArray = (newArray: Item[]): void => {
    const { path = '', namespace = '', onFieldChange } = this.context;
    onFieldChange(namespace, path, newArray);
  };

  private getAccessorForItem(index: number): string {
    return String(index);
  }
}
