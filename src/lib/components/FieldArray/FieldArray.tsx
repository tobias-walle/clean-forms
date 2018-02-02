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

export class FieldArray extends React.Component<FieldArrayProps<any>, FieldArrayState> {
  public static contextTypes = {
    ...formContextTypes,
    ...fieldGroupContextTypes
  };
  public context: FormContext<any> & FieldGroupContext;
  private array: any[];
  private path: Path;
  private identifier: string;

  public render() {
    const { name, render } = this.props;
    this.updatePathAndIdentifier();
    this.array = this.getArray();

    return (
      <FieldGroup name={name}>
        {render({ addItem: this.addItem })}
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
    const newArray = [...this.array, item];
    this.setArray(newArray);
  };

  private getArray(): any[] {
    const { form: { state: { model } } } = this.context;
    return selectDeep({ object: model, path: this.path });
  }

  private setArray(newArray: any[]): void {
    const { onFieldChange } = this.context;
    onFieldChange(this.identifier, this.path, newArray);
  }
}
