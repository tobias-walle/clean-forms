import * as PropTypes from 'prop-types';
import * as React from 'react';
import { updateDeep } from '../../utils';
import { FieldStatusMapping } from '../../utils/statusTracking/FieldStatusMapping';
import { Errors, ValidationDefinition, Validator } from '../../utils/validation';

export type OnFieldMount = (path: string[]) => void;

export type OnFieldUnmount = (path: string[]) => void;

export type OnFieldFocus = (path: string[]) => void;

export type OnFieldBlur = (path: string[]) => void;

export type OnFieldChange<Model> = (path: string[], value: any) => void;

export interface FormContext<Model> {
  form: FormInfo<Model>;
  onFieldMount: OnFieldMount;
  onFieldUnmount: OnFieldUnmount;
  onFieldFocus: OnFieldFocus;
  onFieldBlur: OnFieldBlur;
  onFieldChange: OnFieldChange<Model>;
}

export const formContextTypes = {
  form: PropTypes.object,
  onFieldMount: PropTypes.func,
  onFieldUnmount: PropTypes.func,
  onFieldFocus: PropTypes.func,
  onFieldBlur: PropTypes.func,
  onFieldChange: PropTypes.func,
};

export interface FormState<Model> {
  model: Model;
  status?: FieldStatusMapping<Model>;
}

export interface FormMeta<Model> {
  errors: Errors<Model> | undefined;
}

export interface FormInfo<Model> {
  state: FormState<Model>;
  meta: FormMeta<Model>;
}

export type OnChange<Model> = (state: FormState<Model>, meta: FormMeta<Model>) => void;

export interface FormProps<Model, FormValidation extends ValidationDefinition<Model> = ValidationDefinition<Model>> {
  state: FormState<Model>;
  onChange?: OnChange<Model>;
  validation?: FormValidation;
}

export class Form<Model = any, FormValidation extends ValidationDefinition<Model> = any> extends React.Component<FormProps<Model, FormValidation>, {}> {
  public static childContextTypes = formContextTypes;
  private meta: FormMeta<Model>;

  public render() {
    return (
      <form>
        {this.props.children}
      </form>
    );
  }

  public getChildContext(): FormContext<Model> {
    return {
      form: this.getFormInfo(),
      onFieldMount: this.onFieldMount,
      onFieldUnmount: this.onFieldUnmount,
      onFieldFocus: this.onFieldFocus,
      onFieldBlur: this.onFieldBlur,
      onFieldChange: this.onFieldChange
    };
  }

  private onFieldMount: OnFieldMount = (path) => {
  }

  private onFieldUnmount: OnFieldMount = (path) => {
  }

  private onFieldFocus: OnFieldFocus = (path) => {
  }

  private onFieldBlur: OnFieldBlur = (path) => {
  }

  private onFieldChange: OnFieldChange<Model> = (path, value) => {
    this.updateModel(path, value);
  }

  private updateModel: OnFieldChange<Model> = (path, value) => {
    const { onChange, state } = this.props;
    const newModel: Model = updateDeep(state.model, path, value);

    const newState = this.createState(newModel, state.status);
    this.meta = this.createMetaData(newModel);
    onChange && onChange(newState, this.meta);
  }

  private createState(model: Model, status: FieldStatusMapping<Model> | undefined): FormState<Model> {
    return {model, status};
  }

  private createMetaData(model: Model): FormMeta<Model> {
    return {
      errors: this.validate(model)
    };
  }

  private validate(model: Model): Errors<Model> | undefined {
    const { validation = {} } = this.props;
    const validator = new Validator<Model>();
    return validator.validate(model, validation);
  }

  private getFormInfo(): FormInfo<Model> {
    return {
      state: this.props.state,
      meta: this.meta
    };
  }
}
