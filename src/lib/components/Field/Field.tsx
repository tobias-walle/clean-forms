import * as PropTypes from 'prop-types' ;
import * as React from 'react';
import { FormApi } from '../../api';
import { FieldStatus } from '../../statusTracking';
import { createPath, Path } from '../../utils';
import { isShallowEqual } from '../../utils/isShallowEqual';
import { FieldError } from '../../validation';
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
  /** Update the field everytime the form is updated. This may be necessary if the render depends on other fields. */
  updateOnEveryFormChange?: boolean;
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

    const { value, status, error } = getInputValuesFromContext(this.context, this.props);
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

  public shouldComponentUpdate(nextProps: FieldProps<Value, CustomProps>, nextState: any, nextContext: any) {
    const excludedKeys: Array<keyof typeof nextProps> = ['inner', 'updateOnEveryFormChange'];
    const comparableProps = removeKeysFromObject(this.props, excludedKeys);
    const comparableNextProps = removeKeysFromObject(nextProps, excludedKeys);
    return !isShallowEqual(comparableProps, comparableNextProps)
      || !isShallowEqual(this.props.inner, nextProps.inner)
      || (this.props.updateOnEveryFormChange && !isShallowEqual(this.context, nextContext))
      || !isShallowEqual(
        getInputValuesFromContext(this.context, this.props),
        getInputValuesFromContext(nextContext, nextProps)
      );
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

function getInputValuesFromContext(context: Field['context'], props: Field['props']): { value: any, status: FieldStatus, error: FieldError } {
  const { form } = context;
  const path = createPath(context.path, props.name);
  const fieldId = createPath(context.namespace, props.name);
  const value = form.getFieldValue(path);
  const status = form.getFieldStatus(fieldId);
  const error = form.getFieldError(path);
  return { value, status, error };
}

function removeKeysFromObject(object: any, excluded: string[]): any {
  const result: any = {};
  Object.keys(object)
    .forEach(key => {
      if (!excluded.includes(key)) {
        result[key] = object[key];
      }
    });
  return result;
}
