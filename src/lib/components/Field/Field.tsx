import * as PropTypes from 'prop-types';
import * as React from 'react';
import { selectDeep } from '../../utils';
import { createPath } from '../../utils/createPath';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, formContextTypes, FormInfo } from '../Form/Form';

export interface InputProps<Value> {
  name?: string;
  value: Value;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: Value) => void;
}

export interface InnerFieldProps<Value, CustomProps, Model = any> {
  input: InputProps<Value>;
  form: FormInfo<Model>;
  custom: CustomProps | null;
}

export type FieldRenderFunction<Value, RenderProps> = React.StatelessComponent<InnerFieldProps<Value, RenderProps>>;

export interface FieldPropsWithoutRender<CustomProps> {
  name: string | null;
  inner?: CustomProps;
}

export interface FieldProps<Value, CustomProps> extends FieldPropsWithoutRender<CustomProps> {
  render: FieldRenderFunction<Value, CustomProps>;
}

export class Field<Value = any, CustomProps = any> extends React.Component<FieldProps<Value, CustomProps>, {}> {
  public static contextTypes = {
    ...formContextTypes,
    ...fieldGroupContextTypes
  };
  public context: FormContext<any> & FieldGroupContext;

  private path: string[];

  public render() {
    const { name, render, inner: custom = null } = this.props;
    const { form } = this.context;

    this.path = createPath(this.context.groups, this.props.name);
    const value = selectDeep({ object: form.state.model, path: this.getPath() });
    const input: InputProps<Value> = {
      name: name || undefined,
      value,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange
    };

    return render({input, custom, form});
  }

  public componentDidMount() {
    this.context.onFieldMount(this.getPath());
  }

  public componentWillUnmount() {
    this.context.onFieldUnmount(this.getPath());
  }

  private onFocus = () => {
    this.context.onFieldFocus(this.getPath());
  }

  private onBlur = () => {
    this.context.onFieldBlur(this.getPath());
  }

  private onChange = (value: any) => {
    this.context.onFieldChange(this.getPath(), value);
  }

  private getPath(): string[] {
    return this.path;
  }
}
