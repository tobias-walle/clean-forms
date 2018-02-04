import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FormApi } from '../../api/FormApi';
import { createPath } from '../../utils/createPath';
import { Path } from '../../utils/FieldRegister';
import { FieldStatus } from '../../utils/statusTracking/FieldStatus';
import { FieldError } from '../../utils/validation';
import { FieldGroupContext, fieldGroupContextTypes } from '../FieldGroup/FieldGroup';
import { FormContext, formContextTypes } from '../Form/Form';

export type FieldId = string;

export interface InputProps<Value> extends FieldStatus {
  name?: string;
  value: Value;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: Value) => void;
  error: FieldError;
  valid: boolean;
  inValid: boolean;
}

export interface InnerFieldProps<Value, Model = any, CustomProps = {}> {
  input: InputProps<Value>;
  form: FormApi<Model>;
  custom: CustomProps;
}

export type FieldRenderFunction<Value = any, RenderProps = {}> =
  React.StatelessComponent<InnerFieldProps<Value, any, RenderProps>>;

export interface FieldPropsWithoutRender {
  name: string | null;
}

export type FieldProps<Value, CustomProps = {}> = FieldPropsWithoutRender & {
  render: FieldRenderFunction<Value, CustomProps>;
  inner: CustomProps;
};

export class Field<Value = any, CustomProps = any> extends React.Component<FieldProps<Value, CustomProps>, {}> {
  public static contextTypes = {
    ...formContextTypes,
    ...fieldGroupContextTypes
  };
  public context: FormContext<any> & FieldGroupContext;

  private fieldId: FieldId;
  private path: Path;

  public render() {
    const { name, render, inner: custom } = this.props;
    const { form } = this.context;
    this.updatePathAndId();

    const value = form.getFieldValue(this.path);
    const status = form.getFieldStatus(this.fieldId);
    const error = form.getFieldError(this.fieldId);
    const input: InputProps<Value> = {
      name: name || undefined,
      value,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      onChange: this.onChange,
      ...status,
      error,
      valid: !error,
      inValid: !!error,
    };

    return render({ input, custom, form });
  }

  private updatePathAndId(): void {
    this.path = createPath(this.context.path, this.props.name);
    this.fieldId = createPath(this.context.namespace, this.props.name);
  }

  public componentDidMount() {
    this.context.onFieldMount(this.fieldId);
  }

  public componentWillUnmount() {
    this.context.onFieldUnmount(this.fieldId);
  }

  private onFocus = () => {
    this.context.onFieldFocus(this.fieldId);
  };

  private onBlur = () => {
    this.context.onFieldBlur(this.fieldId);
  };

  private onChange = (value: any) => {
    this.context.onFieldChange(this.fieldId, this.path, value);
  };
}
