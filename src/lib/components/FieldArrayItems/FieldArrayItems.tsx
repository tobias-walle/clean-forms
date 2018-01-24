import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FieldGroup } from '../';
import { selectDeep } from '../../utils';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, formContextTypes } from '../Form/Form';

export interface InnerFieldArrayItemProps {
  remove: () => void;
}

export type GetKey<Item> = (item: Item, index: number) => any;

export interface FieldArrayItemsProps<Item> {
  render: React.StatelessComponent<InnerFieldArrayItemProps>;
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
          {render({remove: () => this.removeItem(index)})}
        </FieldGroup>
      ))}
      </>
    );
  }

  private defaultGetKey: GetKey<Item> = (item, index) => `item_${index}`;

  private getArray(): Item[] {
    const { model, groups = [] } = this.context;
    return selectDeep(model, groups);
  }

  private removeItem(index: number): void {
    const newArray = [
      ...this.array.slice(0, index),
      ...this.array.slice(index + 1)
    ];
    this.setArray(newArray);
  }

  private setArray(newArray: Item[]): void {
    const { groups = [], onValueChange } = this.context;
    onValueChange(groups, newArray);
  }
}
