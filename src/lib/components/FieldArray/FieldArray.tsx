import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FieldGroup } from '../';
import { selectDeep } from '../../utils';
import { createPath } from '../../utils/createPath';
import { Path } from '../../utils/FieldRegister';
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
  private path: Path;

  public render() {
    const { name, render } = this.props;
    this.updatePath();
    this.array = this.getArray();

    return (
      <FieldGroup name={name}>
        {render({addItem: this.addItem})}
      </FieldGroup>
    );
  }

  private updatePath(): void {
    this.path = createPath(this.context.groups, this.props.name);
  }

  public componentDidMount() {
    this.context.onFieldMount(this.path);
  }

  private addItem: AddItem<Item> = (item) => {
    const newArray = [...this.array, item];
    this.setArray(newArray);
  }

  private getArray(): Item[] {
    const { form: { state: { model }} } = this.context;
    return selectDeep({ object: model, path: this.path });
  }

  private setArray(newArray: Item[]): void {
    const { onFieldChange } = this.context;
    onFieldChange(this.path, newArray);
  }
}
