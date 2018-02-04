import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FormApi, FormState } from '../../api/FormApi';
import { updateDeep } from '../../utils';
import { FieldRegister, FieldRegisterChanges, Path } from '../../utils/FieldRegister';
import { FieldStatusMapping } from '../../utils/statusTracking/FieldStatusMapping';
import { FieldStatusUpdater } from '../../utils/statusTracking/FieldStatusUpdater';
import { FieldErrorMapping, FieldValidator, ValidationDefinition } from '../../utils/validation';

import { GetKey } from '../FieldArrayItems/FieldArrayItems';

export type OnFieldMount = (id: string) => void;

export type OnFieldUnmount = (id: string) => void;

export type OnFieldFocus = (id: string) => void;

export type OnFieldBlur = (id: string) => void;

export type OnFieldChange<Model> = (id: string, path: Path, value: any) => void;

export type SetArrayGetKey = (id: Path, getKey: GetKey<any>) => void;

export interface FormContext<Model> {
  form: FormApi<Model>;
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

export type OnChange<Model> = (state: FormState<Model>) => void;
export type OnSubmit<Model> = (form: FormApi<Model>) => void;

export type RenderForm<Model> = React.StatelessComponent<FormApi<Model>>;

export interface FormProps<Model> {
  state: FormState<Model>;
  onChange?: OnChange<Model>;
  onSubmit?: OnSubmit<Model>;
  validation?: ValidationDefinition<Model>;
  render?: RenderForm<Model>;
}

export interface FormComponentState {
  fieldErrorMapping: FieldErrorMapping;
}

export class Form<Model = any> extends React.Component<FormProps<Model>, FormComponentState> {
  public static childContextTypes = formContextTypes;
  public state: FormComponentState;
  private fieldsRegister: FieldRegister;
  private fieldValidator: FieldValidator<Model>;
  private fieldStatusUpdater: FieldStatusUpdater;
  private arrayGetKeyMapping: Map<string, GetKey<any>> = new Map();
  private api: FormApi<Model>;

  constructor(props: FormProps<Model>, context: any) {
    super(props, context);
    this.fieldsRegister = new FieldRegister();
    this.fieldValidator = new FieldValidator();
    this.fieldStatusUpdater = new FieldStatusUpdater(this.fieldsRegister);
    this.state = {
      fieldErrorMapping: this.validate(this.props.state.model)
    };
    this.handlePropsUpdate(this.props, this.state);
  }

  public render() {
    const { render } = this.props;
    return (
      <form onSubmit={this.handleSubmit}>
        {this.props.children}
        {render && render(this.api)}
      </form>
    );
  }

  public getChildContext(): FormContext<Model> {
    return {
      form: this.api,
      onFieldMount: this.onFieldMount,
      onFieldUnmount: this.onFieldUnmount,
      onFieldFocus: this.onFieldFocus,
      onFieldBlur: this.onFieldBlur,
      onFieldChange: this.onFieldChange,
      setArrayGetKey: this.setArrayGetKey,
    };
  }

  public componentDidMount() {
    this.fieldsRegister.addListener(this.onFieldRegisterChanges);
  }

  public componentWillReceiveProps(newProps: FormProps<Model>) {
    let state = this.state;
    if (newProps.state.model !== this.props.state.model) {
      state = this.updateValidationResult(newProps.state.model);
      this.setState(state);
    }
    this.handlePropsUpdate(newProps, state);
  }

  private handlePropsUpdate(props: FormProps<Model>, state: FormComponentState): void {
    this.updateFormApi(props, state);
  }

  private updateFormApi(props: FormProps<Model>, state: FormComponentState) {
    this.api = new FormApi<Model>(
      props.state,
      props.validation,
      state.fieldErrorMapping
    );
  }

  private updateValidationResult(model: Model): FormComponentState {
    const result = this.validate(model);
    return { ...this.state, fieldErrorMapping: result };
  }

  private validate(model: Model): FieldErrorMapping {
    const { validation = {} } = this.props;
    return this.fieldValidator.validateModel({ model, validationDefinition: validation });
  }

  private onFieldMount: OnFieldMount = (path) => {
    this.fieldsRegister.register(path);
  };

  private onFieldUnmount: OnFieldMount = (path) => {
    this.fieldsRegister.unregister(path);
  };

  private onFieldFocus: OnFieldFocus = (path) => {
  };

  private onFieldBlur: OnFieldBlur = (path) => {
    const status = this.fieldStatusUpdater.markAsTouched(this.api.status, path);

    const state = this.createState({ status });
    this.triggerChange(state);
  };

  private onFieldChange: OnFieldChange<Model> = (id, path, value) => {
    const model = this.updateModel(path, value);

    let status: FieldStatusMapping = this.api.status;
    status = this.fieldStatusUpdater.markAsDirty(status, id);

    const state = this.createState({ model, status });
    this.triggerChange(state);
  };

  private handleSubmit = (event: React.FormEvent<any>) => {
    const { onSubmit } = this.props;
    event.stopPropagation();
    event.preventDefault();

    onSubmit && onSubmit(this.api);
  };

  private setArrayGetKey: SetArrayGetKey = (path, getKey) => {
    this.arrayGetKeyMapping.set(path, getKey);
  };

  private removeArrayGetKeyFunction(path: Path): void {
    this.arrayGetKeyMapping.delete(path);
  }

  private onFieldRegisterChanges = (changes: FieldRegisterChanges): void => {
    let status = this.props.state.status || {};

    changes.registered.forEach((newPath) => {
      status = this.fieldStatusUpdater.addIfFieldNotExists(status, newPath);
    });

    changes.unregistered.forEach((removedPath) => {
      status = this.fieldStatusUpdater.removeIfFieldExists(status, removedPath);
      this.removeArrayGetKeyFunction(removedPath);
    });

    const state = this.createState({ status });
    this.triggerChange(state);
  };

  private updateModel(path: Path, value: any): Model {
    return updateDeep({ object: this.props.state.model, path, value });
  }

  private triggerChange(state: FormState<Model>): void {
    const { onChange } = this.props;
    onChange && onChange(state || this.props.state);
  }

  private createState(state: Partial<FormState<Model>>): FormState<Model> {
    return { ...this.props.state, ...state };
  }
}
