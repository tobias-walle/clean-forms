import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FieldGroup, GetKey } from '../';
import { createPath, Path, selectDeep } from '../../utils';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, formContextTypes } from '../Form/Form';

export type AddItem<Item> = (item: Item) => void;

export const fieldArrayContextTypes = {
  getKey: PropTypes.func,
};

export interface FieldArrayContext<Item = any> {
  getKey: GetKey<Item>;
}

export interface InnerFieldArrayProps<Item> {
  items: Item[];
  addItem: AddItem<Item>;
}

export interface FieldArrayProps<Item> {
  name: string;
  render: React.StatelessComponent<InnerFieldArrayProps<Item>>;
  getKey?: GetKey<Item>;
}

export interface FieldArrayState {
}

export class FieldArray extends React.Component<FieldArrayProps<any>, FieldArrayState> {
  public static childContextTypes = fieldArrayContextTypes;
  public static contextTypes = {
    ...formContextTypes,
    ...fieldGroupContextTypes
  };
  public context: FormContext<any> & FieldGroupContext;
  private items: any[];
  private path: Path;
  private identifier: string;

  public render() {
    const { name, render } = this.props;
    this.updatePathAndIdentifier();
    this.items = this.getItems();

    return (
      <FieldGroup name={name}>
        {render({
          addItem: this.addItem,
          items: this.items,
        })}
      </FieldGroup>
    );
  }

  private updatePathAndIdentifier(): void {
    this.path = createPath(this.context.path, this.props.name);
    this.identifier = createPath(this.context.namespace, this.props.name);
  }

  public componentDidMount() {
    this.context.onFieldMount(this.identifier);
  }

  private addItem: AddItem<any> = (item) => {
    const newArray = [...this.items, item];
    this.setArray(newArray);
  };

  private getItems(): any[] {
    const { form: { state: { model } } } = this.context;
    return selectDeep({ object: model, path: this.path });
  }

  private setArray(newArray: any[]): void {
    const { onFieldChange } = this.context;
    onFieldChange(this.identifier, this.path, newArray);
  }

  public getChildContext(): FieldArrayContext {
    const { getKey = this.defaultGetKey } = this.props;
    return { getKey };
  }

  private defaultGetKey: GetKey<any> = (item, index) => `${index}`;
}
