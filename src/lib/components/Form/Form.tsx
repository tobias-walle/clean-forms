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

export interface FormInfo<Model> {
  state: FormState<Model>;
  validationResult: ValidationResultMapping;
}

export type OnChange<Model> = (state: FormState<Model>) => void;
export type OnSubmit<Model> = (form: FormInfo<Model>) => void;

export type RenderForm<Model> = React.StatelessComponent<FormInfo<Model>>;

export interface FormProps<Model> {
  state: FormState<Model>;
  onChange?: OnChange<Model>;
  onSubmit?: OnSubmit<Model>;
  validation?: ValidationDefinition<Model>;
  render?: RenderForm<Model>;
}

export interface FormComponentState {
  validationResult: ValidationResultMapping;
}

export class Form<Model = any> extends React.Component<FormProps<Model>, FormComponentState> {
  public static childContextTypes = formContextTypes;
  public state: FormComponentState = {
    validationResult: {}
  };
  private fieldsRegister: FieldRegister;
  private fieldValidator: FieldValidator<Model>;
  private fieldStatusUpdater: FieldStatusUpdater;
  private arrayGetKeyMapping: Map<string, GetKey<any>> = new Map();

  public render() {
    const { render } = this.props;
    const formInfo = this.getFormInfo();
    return (
      <form onSubmit={this.handleSubmit}>
        {this.props.children}
        {render && render(formInfo)}
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
    this.updateValidationResult(this.getModel());
    this.fieldsRegister.addListener(this.onFieldRegisterChanges);
  }

  public componentWillReceiveProps(newProps: FormProps<Model>) {
    if (newProps.state.model !== this.props.state.model) {
      this.updateValidationResult(newProps.state.model);
    }
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

  private handleSubmit = (event: React.FormEvent<any>) => {
    const { onSubmit } = this.props;
    event.stopPropagation();
    event.preventDefault();

    onSubmit && onSubmit(this.getFormInfo());
  };

  private setArrayGetKey: SetArrayGetKey = (path, getKey) => {
    this.arrayGetKeyMapping.set(path, getKey);
  };

  private removeArrayGetKeyFunction(path: Path): void {
    this.arrayGetKeyMapping.delete(path);
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
    onChange && onChange(state || this.props.state);
  }

  private createState(model: Model, status: FieldStatusMapping | undefined): FormState<Model> {
    return { model, status };
  }

  private updateValidationResult(model: Model): void {
    const result = this.validate(model);
    this.setState({validationResult: result});
  }

  private validate(model: Model): ValidationResultMapping {
    const validationDefinition = this.getValidationDefinition();
    return this.fieldValidator.validateModel({ model, validationDefinition });
  }

  private getFormInfo(): FormInfo<Model> {
    return {
      state: this.props.state,
      validationResult: this.state.validationResult
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
