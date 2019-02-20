import * as React from 'react';
import { memo, MutableRefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { FormApi, FormState } from '../api';
import {
  FormContext,
  OnFieldBlur,
  OnFieldChange,
  OnFieldFocus,
  OnFieldMount,
  OnFieldUnmount,
  SetArrayGetKey
} from '../contexts/form-context';
import { cloneFieldStatus, FieldStatusMapping } from '../statusTracking';
import { FieldStatusUpdater } from '../statusTracking/FieldStatusUpdater';
import { FieldRegister, FieldRegisterChanges, Path } from '../utils';
import { StateUpdater } from '../utils/StateUpdater';
import { FieldErrorMapping, validateModel, ValidationDefinition } from '../validation';

import { GetKey } from './FieldArrayItems';

export type OnChange<Model> = (state: FormState<Model>) => void;
export type OnSubmit<Model> = (form: FormApi<Model>) => void;

export type RenderForm<Model> = React.FunctionComponent<FormApi<Model>>;

export interface FormProps<Model> {
  state: FormState<Model>;
  onChange?: OnChange<Model>;
  onSubmit?: OnSubmit<Model>;
  onValidSubmit?: OnSubmit<Model>;
  onInValidSubmit?: OnSubmit<Model>;
  validation?: ValidationDefinition<Model>;
  render?: RenderForm<Model>;
  formProps?: JSX.IntrinsicElements['form'];
  children?: React.ReactNode;
}

function useIsMounted(): Readonly<MutableRefObject<boolean>> {
  const mounted = useRef(false);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
}

function _Form<Model = any>(props: FormProps<Model>) {
  const {
    state,
    validation,
    render,
    formProps,
    onChange,
    onSubmit,
    onInValidSubmit,
    onValidSubmit
  } = props;
  const { model } = state;
  const stateRef = useRef(state);
  stateRef.current = state;

  useLayoutEffect(() => {
  }, [state.status]);

  // PropsStateUpdaterRef
  const propsStateUpdaterRef = useRef(new StateUpdater<FormState<Model>>(
    () => stateRef.current,
    () => isMountedRef.current
  ));
  useEffect(() => {
    propsStateUpdaterRef.current.registerOnChange(onChange);
  }, [onChange]);

  // ArrayGetKeyMapping
  const arrayGetKeyMappingRef = useRef<Map<string, GetKey<any>>>(new Map());
  const setArrayGetKey: SetArrayGetKey = useCallback((path, getKey) => {
    arrayGetKeyMappingRef.current.set(path, getKey);
  }, []);
  const removeArrayGetKeyFunction = useCallback((path: Path) => {
    arrayGetKeyMappingRef.current.delete(path);
  }, []);

  // FieldRegisterRef
  const handleFieldRegisterChanges = useCallback((changes: FieldRegisterChanges): void => {
    let status = state.status || {};

    changes.registered.forEach((newPath) => {
      status = fieldStatusUpdaterRef.current.addIfFieldNotExists(status, newPath);
    });

    changes.unregistered.forEach((removedPath) => {
      status = fieldStatusUpdaterRef.current.removeIfFieldExists(status, removedPath);
      removeArrayGetKeyFunction(removedPath);
    });

    propsStateUpdaterRef.current.patch({ status });
  }, [state.status]);

  const fieldsRegisterRef = useRef(new FieldRegister());
  useLayoutEffect(() => {
    fieldsRegisterRef.current.addListener(handleFieldRegisterChanges);
    return () => fieldsRegisterRef.current.removeListener(handleFieldRegisterChanges);
  }, []);
  // FieldRegisterRef END

  const fieldStatusUpdaterRef = useRef(new FieldStatusUpdater(fieldsRegisterRef.current));

  const isMountedRef = useIsMounted();

  // API
  const fieldErrorMapping = useMemo<FieldErrorMapping>(
    () => validation
      ? validateModel({ model, validationDefinition: validation })
      : {},
    [model, validation]
  );

  const api = useMemo(() => new FormApi<Model>(
    state,
    validation,
    fieldErrorMapping
  ), [state, validation, fieldErrorMapping]);
  // API End

  // Callbacks
  const handleFieldMount: OnFieldMount = useCallback((path) => {
    fieldsRegisterRef.current.register(path);
  }, []);

  const handleFieldUnmount: OnFieldUnmount = useCallback((path) => {
    if (!isMountedRef.current) {
      // Cancel if the form is not mounted anymore
      return;
    }
    fieldsRegisterRef.current.unregister(path);
  }, []);

  const handleFieldFocus: OnFieldFocus = useCallback((path) => {
    // Ignore for now
  }, []);

  const handleFieldBlur: OnFieldBlur = useCallback((path) => {
    const newStatus = cloneFieldStatus(api.getFieldStatus(path), { touched: true });
    propsStateUpdaterRef.current.update((oldState) => ({
      ...oldState,
      status: {
        ...oldState.status,
        [path]: newStatus
      }
    }));
  }, [api]);

  const handleFieldChange: OnFieldChange<Model> = useCallback((id, path, value) => {
    propsStateUpdaterRef.current.updateDeep(`model.${path}`, value, true);

    let status: FieldStatusMapping = api.status;
    status = fieldStatusUpdaterRef.current.markAsDirty(status, id);

    propsStateUpdaterRef.current.patch({ status });
  }, [api]);
  // Callbacks End

  const markAllAsTouched = useCallback(() => {
    const status = fieldStatusUpdaterRef.current.markAllAsTouched(api.status);
    propsStateUpdaterRef.current.patch({ status });
  }, [api]);

  const submit = useCallback(() => {
    markAllAsTouched();
    onSubmit && onSubmit(api);
    if (api.valid) {
      onValidSubmit && onValidSubmit(api);
    } else {
      onInValidSubmit && onInValidSubmit(api);
    }
  }, [api, onSubmit, onValidSubmit, onInValidSubmit, markAllAsTouched]);

  const handleSubmit = useCallback((event: React.FormEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();

    formProps && formProps.onSubmit && formProps.onSubmit(event);

    submit();
  }, [submit, formProps]);

  const formContext = useMemo(() => ({
    form: api,
    onFieldBlur: handleFieldBlur,
    onFieldChange: handleFieldChange,
    onFieldFocus: handleFieldFocus,
    onFieldMount: handleFieldMount,
    onFieldUnmount: handleFieldUnmount,
    setArrayGetKey
  }), [api]);

  return (
    <FormContext.Provider value={formContext}>
      <form {...formProps} onSubmit={handleSubmit}>
        {props.children}
        {render && render(api)}
      </form>
    </FormContext.Provider>
  );
}

export const Form: typeof _Form = memo(_Form) as any;
