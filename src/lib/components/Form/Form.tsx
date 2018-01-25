import * as PropTypes from 'prop-types';
import * as React from 'react';
import { DELETE, selectDeep, updateDeep } from '../../utils';
import { FieldRegister, FieldRegisterChanges, Path } from '../../utils/FieldRegister';
import { DEFAULT_FIELD_STATUS, FieldStatus } from '../../utils/statusTracking/FieldStatus';
import { FieldStatusMapping } from '../../utils/statusTracking/FieldStatusMapping';
import { FieldValidator, ValidationDefinition } from '../../utils/validation';

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

  public componentWillMount() {
    this.fieldsRegister = new FieldRegister();
  }

  public componentDidMount() {
    this.fieldsRegister.addListener(this.onFieldRegisterChanges);
  }

  private onFieldMount: OnFieldMount = (path) => {
    this.fieldsRegister.register(path);
  }

  private onFieldUnmount: OnFieldMount = (path) => {
    this.fieldsRegister.unregister(path);
  }

  private onFieldFocus: OnFieldFocus = (path) => {
    const status = this.updateFieldStatus(this.getStatus(), path, {
      touched: true,
      untouched: false
    });
    const state = this.createState(this.getModel(), status);
    this.triggerChange({ state });
  }

  private onFieldBlur: OnFieldBlur = (path) => {
  }

  private onFieldChange: OnFieldChange<Model> = (path, value) => {
    const model = this.updateModel(path, value);

    const status = this.updateFieldStatusBasedOnValue(this.getStatus(), path, value, model);
    const state = this.createState(model, status);
    const meta = this.createMetaData(model);

    this.triggerChange({ state, meta });
  }

  private updateFieldStatusBasedOnValue(
    status: FieldStatusMapping<Model>, path: string[], value: any, model: Model
  ): FieldStatusMapping<Model> {
    if (value === DELETE) {
      return this.removeFieldStatus(status, path);
    } else {
      const fieldStatusUpdate = this.applyValidationToFieldStatusUpdate({ pristine: false, dirty: true }, path, model);
      status = this.updateFieldStatus(status, path, fieldStatusUpdate);
      return status;
    }
  }

  private onFieldRegisterChanges = (changes: FieldRegisterChanges): void => {
    let status = this.props.state.status || {};
    const model = this.getModel();
    changes.registered.forEach((newPath) => {
      const fieldStatusUpdate = this.applyValidationToFieldStatusUpdate(DEFAULT_FIELD_STATUS, newPath, model);
      status = this.updateFieldStatus(status, newPath, fieldStatusUpdate);
    });
    changes.unregistered.forEach((removedPath) => {
      status = this.removeFieldStatus(status, removedPath);
    });
    const state = this.createState(model, status);
    this.triggerChange({ state });
  }

  private applyValidationToFieldStatusUpdate(baseFieldStatus: Partial<FieldStatus>, path: Path, model: Model): Partial<FieldStatus> {
    const validationStatus = this.getValidationStatus(path, model);
    return {
      ...baseFieldStatus,
      ...validationStatus
    };
  }

  private getValidationStatus(path: Path, model: Model): Partial<FieldStatus> {
    const validationDefinition = this.props.validation;
    if (!validationDefinition) {
      return {};
    }
    return FieldValidator.getValidationStatus<Model>({path, model, validationDefinition });
  }

  private updateFieldStatus(
    status: FieldStatusMapping<Model>, path: string[], statusUpdate: Partial<FieldStatus>): FieldStatusMapping<Model> {
    if (!this.fieldsRegister.includesPath(path)) {
      return status;
    }
    const currentFieldStatus = selectDeep({ object: status, path, assert: false }) || DEFAULT_FIELD_STATUS;
    const newFieldStatus = { ...currentFieldStatus, ...statusUpdate };

    return updateDeep({ object: status, path, value: newFieldStatus, assert: false });
  }

  private removeFieldStatus(status: FieldStatusMapping<Model>, path: string[]): FieldStatusMapping<Model> {
    return updateDeep({ object: status, path, value: DELETE, assert: false });
  }

  private updateModel(path: string[], value: any): Model {
    return updateDeep({ object: this.props.state.model, path, value });
  }

  private triggerChange({ state, meta }: { state?: FormState<Model>, meta?: FormMeta<Model> }): void {
    const { onChange } = this.props;
    this.meta = meta || this.meta;
    onChange && onChange(state || this.props.state, meta || this.meta);
  }

  private createState(model: Model, status: FieldStatusMapping<Model> | undefined): FormState<Model> {
    return { model, status };
  }

  private createMetaData(model: Model): FormMeta<Model> {
    return {
    };
  }

  private getFormInfo(): FormInfo<Model> {
    return {
      state: this.props.state,
      meta: this.meta
    };
  }

  private getStatus(): FieldStatusMapping<Model> {
    return this.props.state.status || {};
  }

  private getModel(): Model {
    return this.props.state.model;
  }
}
