import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FieldGroup } from '../';
import { DELETE, selectDeep } from '../../utils';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, formContextTypes } from '../Form/Form';

export interface InnerFieldArrayItemProps<Item> {
  remove: () => void;
  setArray: (newArray: Item[]) => void;
}

export type GetKey<Item> = (item: Item, index: number) => any;

export type FieldArrayItemsRender<Item> = React.StatelessComponent<InnerFieldArrayItemProps<Item>>;

export interface FieldArrayItemsProps<Item> {
  render: FieldArrayItemsRender<Item>;
  getKey?: GetKey<Item>;
}

export interface FieldArrayItemsState {
}

export class FieldArrayItems<Item = any> extends React.Component<FieldArrayItemsProps<Item>, FieldArrayItemsState> {
  public static contextTypes = {
    ...formContextTypes,
    ...fieldGroupContextTypes
  };
  public context: FormContext<any> & FieldGroupContext;
  private array: Item[];

  public render() {
    const { render, getKey = this.defaultGetKey } = this.props;
    this.array = this.getArray();
    return (
      <>
      {this.array.map((item, index) => (
        <FieldGroup
          key={getKey(item, index)}
          name={String(index)}
        >
          {render({
            remove: () => this.removeItem(index),
            setArray: this.setArray
          })}
        </FieldGroup>
      ))}
      </>
    );
  }

  private defaultGetKey: GetKey<Item> = (item, index) => `item_${index}`;

  private getArray(): Item[] {
    const { form: { state: { model }}, groups = [] } = this.context;
    return selectDeep({ object: model, path: groups });
  }

  private removeItem(index: number): void {
    const { groups = [], onFieldChange } = this.context;
    onFieldChange([...groups, String(index)], DELETE);
  }

  private setArray = (newArray: Item[]): void => {
    const { groups = [], onFieldChange } = this.context;
    onFieldChange(groups, newArray);
  }
}
