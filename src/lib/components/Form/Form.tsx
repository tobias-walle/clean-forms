import * as React from 'react';
import { FormApi, FormState } from '../../api';
import {
  FormContext,
  FormContextValue,
  OnFieldBlur,
  OnFieldChange,
  OnFieldFocus,
  OnFieldMount,
  SetArrayGetKey
} from '../../contexts/form-context';
import { FieldStatusMapping } from '../../statusTracking';
import { FieldStatusUpdater } from '../../statusTracking/FieldStatusUpdater';
import { FieldRegister, FieldRegisterChanges, Path } from '../../utils';
import { StateUpdater } from '../../utils/StateUpdater';
import { FieldErrorMapping, FieldValidator, ValidationDefinition } from '../../validation';

import { GetKey } from '../FieldArrayItems/FieldArrayItems';

export type OnChange<Model> = (state: FormState<Model>) => void;
export type OnSubmit<Model> = (form: FormApi<Model>) => void;

export type RenderForm<Model> = React.StatelessComponent<FormApi<Model>>;

export interface FormProps<Model> {
  state: FormState<Model>;
  onChange?: OnChange<Model>;
  onSubmit?: OnSubmit<Model>;
  onValidSubmit?: OnSubmit<Model>;
  onInValidSubmit?: OnSubmit<Model>;
  validation?: ValidationDefinition<Model>;
  render?: RenderForm<Model>;
}

export interface FormComponentState {
  fieldErrorMapping: FieldErrorMapping;
}

export class Form<Model = any> extends React.Component<FormProps<Model>, FormComponentState> {
  public state: FormComponentState;
  public propsStateUpdater = new StateUpdater<FormState<Model>>(this.props.state);
  private formContext: FormContextValue<Model>;
  private fieldsRegister: FieldRegister;
  private fieldValidator: FieldValidator<Model>;
  private fieldStatusUpdater: FieldStatusUpdater;
  private arrayGetKeyMapping: Map<string, GetKey<any>> = new Map();
  private mounted: boolean = false;

  constructor(props: FormProps<Model>, context: any) {
    super(props, context);
    this.fieldsRegister = new FieldRegister();
    this.fieldValidator = new FieldValidator();
    this.fieldStatusUpdater = new FieldStatusUpdater(this.fieldsRegister);
    this.state = {
      fieldErrorMapping: this.validate(this.props.state.model)
    };
    this.handlePropsUpdate(this.props, this.state, true);
  }

  public render() {
    const { render } = this.props;
    return (
      <FormContext.Provider value={this.formContext}>
        <form onSubmit={this.handleSubmit}>
          {this.props.children}
          {render && render(this.formContext.form)}
        </form>
      </FormContext.Provider>
    );
  }

  public componentDidMount() {
    this.mounted = true;
    this.fieldsRegister.addListener(this.onFieldRegisterChanges);
  }

  public componentWillUnmount() {
    this.mounted = false;
  }

  public componentWillReceiveProps(newProps: FormProps<Model>) {
    let state = this.state;
    if (newProps.state.model !== this.props.state.model) {
      state = this.updateValidationResult(newProps.state.model);
      this.setState(state);
    }
    this.handlePropsUpdate(newProps, state);
  }

  private handlePropsUpdate(props: FormProps<Model>, state: FormComponentState, initial = false): void {
    if (this.props.onChange !== props.onChange || initial) {
      this.propsStateUpdater.registerOnChange(props.onChange);
    }
    if (this.props.state !== props.state || initial) {
      this.propsStateUpdater.resetWith(props.state);
    }
    this.updateFormApi(props, state);
  }

  private updateFormApi(props: FormProps<Model>, state: FormComponentState) {
    const api = new FormApi<Model>(
      props.state,
      props.validation,
      state.fieldErrorMapping
    );
    this.formContext = {
      form: api,
      onFieldBlur: this.onFieldBlur,
      onFieldChange: this.onFieldChange,
      onFieldFocus: this.onFieldFocus,
      onFieldMount: this.onFieldMount,
      onFieldUnmount: this.onFieldUnmount,
      setArrayGetKey: this.setArrayGetKey
    };
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
    if (!this.mounted) {
      // Cancel if the form is not mounted anymore
      return;
    }
    this.fieldsRegister.unregister(path);
  };

  private onFieldFocus: OnFieldFocus = (path) => {
    // Ignore for now
  };

  private onFieldBlur: OnFieldBlur = (path) => {
    const status = this.fieldStatusUpdater.markAsTouched(this.getApi().status, path);

    this.propsStateUpdater.patch({ status });
  };

  private onFieldChange: OnFieldChange<Model> = (id, path, value) => {
    this.propsStateUpdater.updateDeep(`model.${path}`, value, true);

    let status: FieldStatusMapping = this.getApi().status;
    status = this.fieldStatusUpdater.markAsDirty(status, id);

    this.propsStateUpdater.patch({ status });
  };

  private handleSubmit = (event: React.FormEvent<any>) => {
    const { onSubmit, onValidSubmit, onInValidSubmit } = this.props;
    event.stopPropagation();
    event.preventDefault();

    this.markAllAsTouched();
    onSubmit && onSubmit(this.getApi());
    if (this.getApi().valid) {
      onValidSubmit && onValidSubmit(this.getApi());
    } else {
      onInValidSubmit && onInValidSubmit(this.getApi());
    }
  };

  private markAllAsTouched(): void {
    const status = this.fieldStatusUpdater.markAllAsTouched(this.getApi().status);
    this.propsStateUpdater.patch({ status });
  }

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

    this.propsStateUpdater.patch({ status });
  };

  private getApi(): FormApi<Model> {
    return this.formContext.form;
  }
}
