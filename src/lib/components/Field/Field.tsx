import * as React from 'react';
import * as PropTypes from 'prop-types';
import { FormContext, formContextTypes } from '../Form/Form';

export interface InputProps<Value> {
  name: string;
  value: Value;
  onChange: (value: Value) => void;
}

export interface InnerFieldProps<Value, CustomProps> {
  input: InputProps<Value>;
  custom: CustomProps | null;
}

export type FieldRenderFunction<Value, RenderProps> = React.StatelessComponent<InnerFieldProps<Value, RenderProps>>;

export interface FieldPropsWithoutRender<CustomProps> {
  name: string;
  inner?: CustomProps;
}

export interface FieldProps<Value, CustomProps> extends FieldPropsWithoutRender<CustomProps> {
  render: FieldRenderFunction<Value, CustomProps>;
}

export class Field<Value = any, CustomProps = any> extends React.Component<FieldProps<Value, CustomProps>, {}> {
  public static contextTypes = formContextTypes;
  public context: FormContext<any>;

  public render() {
    const { name, render: Component, inner: custom = null } = this.props;
    const { model } = this.context;
    const value = model[name];
    const input: InputProps<Value> = {
      name, value,
      onChange: this.onChange
    };
    return (
      <Component input={input} custom={custom}/>
    );
  }

  private onChange = (value: any) => {
    this.context.onValueChange(this.props.name, value);
  };
}
