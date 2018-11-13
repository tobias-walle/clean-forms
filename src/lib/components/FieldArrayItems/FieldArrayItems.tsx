import * as React from 'react';
import { FieldGroup } from '../';
import { FieldArrayContext, FieldArrayContextValue } from '../../contexts/field-array-context';
import { FieldGroupContext, FieldGroupContextValue } from '../../contexts/field-group-context';
import { FormContext, FormContextValue } from '../../contexts/form-context';
import { assertNotNull, DELETE, selectDeep } from '../../utils';
import { createPath, Path } from '../../utils';
import { isShallowEqual } from '../../utils/isShallowEqual';

export interface InnerFieldArrayItemProps<Item> {
  remove: () => void;
  item: Item;
  index: number;
  setArray: (newArray: Item[]) => void;
}

export type GetKey<Item> = (item: Item, index: number) => any;

export type FieldArrayItemsRender<Item> = (props: InnerFieldArrayItemProps<Item>) => React.ReactNode;

export interface FieldArrayItemsProps<Item> {
  render: FieldArrayItemsRender<Item>;
}

export class FieldArrayItems<Item = any> extends React.PureComponent<FieldArrayItemsProps<Item>> {
  public render() {
    return (
      <FormContext.Consumer>
        {formContext => (
          <FieldGroupContext.Consumer>
            {groupContext => (
              <FieldArrayContext.Consumer>
                {arrayContext => (
                  <FieldArrayItemsWithoutContext
                    {...this.props}
                    formContext={assertNotNull(formContext, 'You cannot use the FieldArrayItems outside a form')}
                    groupContext={groupContext}
                    arrayContext={arrayContext}
                  />
                )}
              </FieldArrayContext.Consumer>
            )}
          </FieldGroupContext.Consumer>
        )}
      </FormContext.Consumer>
    );
  }
}

export interface FieldArrayItemsWithoutContextProps<Item> extends FieldArrayItemsProps<Item> {
  formContext: FormContextValue<any>;
  groupContext: FieldGroupContextValue;
  arrayContext: FieldArrayContextValue;
}

export class FieldArrayItemsWithoutContext<Item = any> extends React.Component<FieldArrayItemsWithoutContextProps<Item>> {
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
            index,
            item
          })}
        </FieldGroup>
      ))}
      </>
    );
  }

  public shouldComponentUpdate(nextProps: FieldArrayItemsWithoutContextProps<any>) {
    return isShallowEqual(this.props, nextProps);
  }

  private getArray(): Item[] {
    const { form: { state: { model }} } = this.props.formContext;
    const { path = '' } = this.props.groupContext;
    return selectDeep({ object: model, path });
  }

  private removeItem(item: Item, index: number): void {
    const { onFieldChange } = this.props.formContext;
    const identifier = this.getItemIdentifier(item, index);
    const path = this.getItemPath(index);
    onFieldChange(identifier, path, DELETE);
  }

  private getItemPath(index: number): Path {
    return createPath(this.props.groupContext.path, index);
  }

  private getItemIdentifier(item: Item, index: number): Path {
    return createPath(this.props.groupContext.namespace, this.getNameForItem(item, index));
  }

  private getNameForItem(item: Item, index: number): string {
    const getKey = this.getKeyFunction();
    return String(getKey(item, index));
  }

  private getKeyFunction(): GetKey<Item> {
    const { getKey } = this.props.arrayContext;
    if (!getKey) {
      throw new Error(`Invalid context. Please make sure that "FieldArrayItems" is wrapped by a "FieldArray"`);
    }
    return getKey;
  }

  private setArray = (newArray: Item[]): void => {
    const { onFieldChange } = this.props.formContext;
    const { path = '', namespace = '' } = this.props.groupContext;
    onFieldChange(namespace, path, newArray);
  };

  private getAccessorForItem(index: number): string {
    return String(index);
  }
}
