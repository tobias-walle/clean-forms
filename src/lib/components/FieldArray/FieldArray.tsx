import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FieldGroup } from '../';
import { selectDeep } from '../../utils';
import { createPath } from '../../utils/createPath';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, formContextTypes } from '../Form/Form';

export type AddItem<Item> = (item: Item) => void;

export interface InnerFieldArrayProps<Item> {
  addItem: AddItem<Item>;
}

export interface FieldArrayProps<Item> {
  name: string;
  render: React.StatelessComponent<InnerFieldArrayProps<Item>>;
}

export interface FieldArrayState {
}

export class FieldArray<Item = any> extends React.Component<FieldArrayProps<Item>, FieldArrayState> {
  public static contextTypes = {
    ...formContextTypes,
    ...fieldGroupContextTypes
  };
  public context: FormContext<any> & FieldGroupContext;
  private array: Item[];

  public render() {
    const { name, render } = this.props;
    this.array = this.getArray();

    return (
      <FieldGroup name={name}>
        {render({addItem: this.addItem})}
      </FieldGroup>
    );
  }

  private addItem: AddItem<Item> = (item) => {
    const newArray = [...this.array, item];
    this.setArray(newArray);
  }

  private getArray(): Item[] {
    const { model } = this.context;
    return selectDeep(model, this.getPath());
  }

  private setArray(newArray: Item[]): void {
    const { onValueChange } = this.context;
    onValueChange(this.getPath(), newArray);
  }
  private getPath(): string[] {
    return createPath(this.context.groups, this.props.name);
  }
}
