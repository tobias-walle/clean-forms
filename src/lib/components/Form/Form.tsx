import * as PropTypes from 'prop-types';
import * as React from 'react';
import { updateDeep } from '../../utils';
import { Errors, ValidationDefinition, Validator } from '../../validation';

export type OnValueChange<Model> = (path: string[], value: any) => void;

export interface FormContext<Model> {
  model: Model;
  onValueChange: OnValueChange<Model>;
}

export const formContextTypes = {
  model: PropTypes.object,
  onValueChange: PropTypes.func,
};

export interface FormMeta<Model> {
  errors: Errors<Model> | undefined;
}

export interface FormProps<Model, FormValidation extends ValidationDefinition<Model> = ValidationDefinition<Model>> {
  model: Model;
  validation?: FormValidation;
  onChange?: (model: Model, meta: FormMeta<Model>) => void;
}

export class Form<Model = any, FormValidation extends ValidationDefinition<Model> = any> extends React.Component<FormProps<Model, FormValidation>, {}> {
  public static childContextTypes = formContextTypes;

  public render() {
    return (
      <form>
        {this.props.children}
      </form>
    );
  }

  public getChildContext(): FormContext<Model> {
    return {
      model: this.props.model,
      onValueChange: this.onValueChange
    };
  }

  private onValueChange: OnValueChange<Model> = (name, value) => {
    this.updateModel(name, value);
  }

  private updateModel: OnValueChange<Model> = (path, value) => {
    const { onChange, model } = this.props;
    const newModel: Model = updateDeep(model, path, value);

    const meta = this.getMetaData(newModel);
    onChange && onChange(newModel, meta);
  }

  private getMetaData(model: Model): FormMeta<Model> {
    return {
      errors: this.validate(model)
    };
  }

  private validate(model: Model): Errors<Model> | undefined {
    const {
      validation = {}
    } = this.props;
    const validator = new Validator<Model>();
    return validator.validate(model, validation);
  }
}
