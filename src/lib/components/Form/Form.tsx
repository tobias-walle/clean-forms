import * as PropTypes from 'prop-types';
import * as React from 'react';
import { updateDeep } from '../../utils';
import { FieldRegister, FieldRegisterChanges, Path } from '../../utils/FieldRegister';
import { FieldStatusMapping } from '../../utils/statusTracking/FieldStatusMapping';
import { FieldStatusUpdater } from '../../utils/statusTracking/FieldStatusUpdater';
import {
  FieldValidator, ValidationDefinition,
  ValidationResultMapping
} from '../../utils/validation';

import { GetKey } from '../FieldArrayItems/FieldArrayItems';

export type OnFieldMount = (id: string) => void;

export type OnFieldUnmount = (id: string) => void;

export type OnFieldFocus = (id: string) => void;

export type OnFieldBlur = (id: string) => void;

export type OnFieldChange<Model> = (id: string, path: Path, value: any) => void;

export type SetArrayGetKey = (id: Path, getKey: GetKey<any>) => void;

export interface FormContext<Model> {
  form: FormInfo<Model>;
  onFieldMount: OnFieldMount;
  onFieldUnmount: OnFieldUnmount;
  onFieldFocus: OnFieldFocus;
  onFieldBlur: OnFieldBlur;
  onFieldChange: OnFieldChange<Model>;
  setArrayGetKey: SetArrayGetKey;
}

export const formContextTypes: Record<keyof FormContext<any>, PropTypes.Requireable<any>> = {
  form: PropTypes.object,
  onFieldMount: PropTypes.func,
  onFieldUnmount: PropTypes.func,
  onFieldFocus: PropTypes.func,
  onFieldBlur: PropTypes.func,
  onFieldChange: PropTypes.func,
  setArrayGetKey: PropTypes.func,
};

export interface FormState<Model> {
  model: Model;
  status?: FieldStatusMapping;
}

export interface FormMeta<Model> {
  validation: ValidationResultMapping;
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
  private fieldsRegister: FieldRegister;
  private fieldValidator: FieldValidator<Model>;
  private fieldStatusUpdater: FieldStatusUpdater;
  private arrayGetKeyMapping: Map<string, GetKey<any>> = new Map();

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
      onFieldChange: this.onFieldChange,
      setArrayGetKey: this.setArrayGetKey,
    };
  }

  public componentWillMount() {
    this.fieldsRegister = new FieldRegister();
    this.fieldValidator = new FieldValidator();
    this.fieldStatusUpdater = new FieldStatusUpdater(this.fieldsRegister);
  }

  public componentDidMount() {
    this.fieldsRegister.addListener(this.onFieldRegisterChanges);
  }

  private onFieldMount: OnFieldMount = (path) => {
    this.fieldsRegister.register(path);
  };

  private onFieldUnmount: OnFieldMount = (path) => {
    this.fieldsRegister.unregister(path);
  };

  private onFieldFocus: OnFieldFocus = (path) => {
    const status = this.fieldStatusUpdater.markAsTouched(this.getStatus(), path);

    const state = this.createState(this.getModel(), status);
    this.triggerChange(state);
  };

  private onFieldBlur: OnFieldBlur = (path) => {
  };

  private onFieldChange: OnFieldChange<Model> = (id, path, value) => {
    const model = this.updateModel(path, value);

    let status: FieldStatusMapping = this.getStatus();
    status = this.fieldStatusUpdater.markAsDirty(status, id);

    const state = this.createState(model, status);

    this.triggerChange(state);
  };

  private setArrayGetKey: SetArrayGetKey = (path, getKey) => {
    this.arrayGetKeyMapping.set(path, getKey);
  };

  private removeArrayGetKeyFunction(path: Path): void {
    this.arrayGetKeyMapping.delete(path);
  }

  private getArrayGetKey(path: Path): GetKey<any> | undefined {
    return this.arrayGetKeyMapping.get(path);
  }

  private onFieldRegisterChanges = (changes: FieldRegisterChanges): void => {
    let status = this.props.state.status || {};
    const model = this.getModel();

    changes.registered.forEach((newPath) => {
      status = this.fieldStatusUpdater.addIfFieldNotExists(status, newPath);
    });

    changes.unregistered.forEach((removedPath) => {
      status = this.fieldStatusUpdater.removeIfFieldExists(status, removedPath);
      this.removeArrayGetKeyFunction(removedPath);
    });

    const state = this.createState(model, status);
    this.triggerChange(state);
  };

  private updateModel(path: Path, value: any): Model {
    return updateDeep({ object: this.props.state.model, path, value });
  }

  private triggerChange(state: FormState<Model>): void {
    const { onChange } = this.props;
    const meta = this.createMetaData(state.model);
    onChange && onChange(state || this.props.state, meta);
  }

  private createState(model: Model, status: FieldStatusMapping | undefined): FormState<Model> {
    return { model, status };
  }

  private createMetaData(model: Model): FormMeta<Model> {
    const validationResult = this.validate(model);
    return {
      validation: validationResult
    };
  }

  private validate(model: Model): ValidationResultMapping {
    const validationDefinition = this.getValidationDefinition();
    return this.fieldValidator.validateModel({ model, validationDefinition });
  }

  private getFormInfo(): FormInfo<Model> {
    return {
      state: this.props.state,
      meta: this.createMetaData(this.props.state.model)
    };
  }

  private getStatus(): FieldStatusMapping {
    return this.props.state.status || {};
  }

  private getValidationDefinition(): ValidationDefinition<Model> {
    return this.props.validation || {};
  }

  private getModel(): Model {
    return this.props.state.model;
  }
}
