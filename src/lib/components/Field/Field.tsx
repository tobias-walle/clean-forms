import * as React from 'react';
import { FormApi } from '../../api';
import { FieldGroupContext, FieldGroupContextValue } from '../../contexts/field-group-context';
import { FormContext, FormContextValue } from '../../contexts/form-context';
import { FieldStatus } from '../../statusTracking';
import { assertNotNull, createPath, Path } from '../../utils';
import { isShallowEqual } from '../../utils/isShallowEqual';
import { FieldError } from '../../validation';

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

export class Field<Value = any, CustomProps = any> extends React.Component<FieldProps<Value, CustomProps>> {
  public render() {
    return (
      <FormContext.Consumer>
        {formContext => (
          <FieldGroupContext.Consumer>
            {groupContext => (
              <FieldWithoutContext
                {...this.props}
                formContext={assertNotNull(formContext, 'You cannot use the Field Component outside a form.')}
                groupContext={groupContext}
              />
            )}
          </FieldGroupContext.Consumer>
        )}
      </FormContext.Consumer>
    );
  }
}

type FieldPropsWithoutContext<Value, CustomProps = {}> = FieldProps<Value, CustomProps> & {
  formContext: FormContextValue<any>;
  groupContext: FieldGroupContextValue;
};

class FieldWithoutContext<Value = any, CustomProps = any> extends React.Component<FieldPropsWithoutContext<Value, CustomProps>> {
  private fieldId: FieldId;
  private path: Path;

  public render() {
    const { name, render, inner: custom } = this.props;
    const { form } = this.props.formContext;
    this.updatePathAndId();

    const { value, status, error } = getInputValuesFromContext(this.props);
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

  public shouldComponentUpdate(nextProps: FieldPropsWithoutContext<Value, CustomProps>, nextState: any) {
    const excludedKeys: Array<keyof typeof nextProps> = ['inner', 'updateOnEveryFormChange', 'groupContext'];
    const comparableProps = removeKeysFromObject(this.props, excludedKeys);
    const comparableNextProps = removeKeysFromObject(nextProps, excludedKeys);
    return !isShallowEqual(comparableProps, comparableNextProps)
      || !isShallowEqual(this.props.inner, nextProps.inner)
      || !isShallowEqual(this.props.groupContext, nextProps.groupContext)
      || (this.props.updateOnEveryFormChange && !isShallowEqual(this.props.formContext, nextProps.formContext))
      || !isShallowEqual(
        getInputValuesFromContext(this.props),
        getInputValuesFromContext(nextProps)
      );
  }

  private updatePathAndId(): void {
    this.path = createPath(this.props.groupContext.path, this.props.name);
    this.fieldId = createPath(this.props.groupContext.namespace, this.props.name);
  }

  public componentDidMount() {
    this.props.formContext.onFieldMount(this.fieldId);
  }

  public componentWillUnmount() {
    this.props.formContext.onFieldUnmount(this.fieldId);
  }

  private onFocus = () => {
    this.props.formContext.onFieldFocus(this.fieldId);
  };

  private onBlur = () => {
    this.props.formContext.onFieldBlur(this.fieldId);
  };

  private onChange = (value: any) => {
    this.props.formContext.onFieldChange(this.fieldId, this.path, value);
  };
}

function getInputValuesFromContext(props: FieldWithoutContext['props']): { value: any, status: FieldStatus, error: FieldError } {
  const { form } = props.formContext;
  const { groupContext  } = props;
  const path = createPath(groupContext.path, props.name);
  const fieldId = createPath(groupContext.namespace, props.name);
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
