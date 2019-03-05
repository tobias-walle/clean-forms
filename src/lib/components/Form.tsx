import * as React from 'react';
import { memo, MutableRefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { FieldContext, FieldContextValue } from '../contexts/field-context';
import {
  FormContext,
  FormContextValue,
  OnFieldBlur,
  OnFieldChange,
  OnFieldFocus,
  OnFieldMount,
  OnFieldUnmount,
  SetArrayGetKey
} from '../contexts/form-context';
import { useFormReadApi } from '../hooks/useFormReadApi';
import { FormState } from '../models';
import { cloneFieldStatus } from '../statusTracking';
import { FieldStatusUpdater } from '../statusTracking/FieldStatusUpdater';
import { FieldRegister, FieldRegisterChanges, Path } from '../utils';
import { StateUpdater } from '../utils/StateUpdater';
import { FieldErrorMapping, validateModel, ValidationDefinition } from '../validation';

import { GetKey } from './FieldArrayItems';

export type OnChange<Model> = (state: FormState<Model>) => void;
export type OnSubmit<Model> = () => void;

export interface FormProps<Model> {
  state: FormState<Model>;
  onChange?: OnChange<Model>;
  onSubmit?: OnSubmit<Model>;
  onValidSubmit?: OnSubmit<Model>;
  onInValidSubmit?: OnSubmit<Model>;
  validation?: ValidationDefinition<Model>;
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
    formProps,
    onChange,
    onSubmit,
    onInValidSubmit,
    onValidSubmit
  } = props;
  const { model, status = {} } = state;

  const setModel = useCallback(
    (newModel: Model) => onChange && onChange({ model: newModel }),
    [onChange]
  );

  const stateRef = useRef(state);
  stateRef.current = state;

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
    let updatedStatus = status;
    changes.registered.forEach((newPath) => {
      updatedStatus = fieldStatusUpdaterRef.current.addIfFieldNotExists(updatedStatus, newPath);
    });

    changes.unregistered.forEach((removedPath) => {
      updatedStatus = fieldStatusUpdaterRef.current.removeIfFieldExists(updatedStatus, removedPath);
      removeArrayGetKeyFunction(removedPath);
    });

    propsStateUpdaterRef.current.patch({ status: updatedStatus });
  }, [status, removeArrayGetKeyFunction]);

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

  const {
    valid,
    invalid,
    getFieldStatus,
    getFieldError,
    getFieldValue
  } = useFormReadApi({ state, validationDefinition: validation, fieldErrorMapping });

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
    const newStatus = cloneFieldStatus(getFieldStatus(path), { touched: true });
    propsStateUpdaterRef.current.update((oldState) => ({
      ...oldState,
      status: {
        ...oldState.status,
        [path]: newStatus
      }
    }));
  }, [getFieldStatus]);

  const handleFieldChange: OnFieldChange<Model> = useCallback((id, path, value) => {
    propsStateUpdaterRef.current.updateDeep(`model.${path}`, value, true);

    const updatedStatus = fieldStatusUpdaterRef.current.markAsDirty(status, id);

    propsStateUpdaterRef.current.patch({ status: updatedStatus });
  }, [status]);
  // Callbacks End

  const markAllAsTouched = useCallback(() => {
    const updatedStatus = fieldStatusUpdaterRef.current.markAllAsTouched(status);
    propsStateUpdaterRef.current.patch({ status: updatedStatus });
  }, [status]);

  const submit = useCallback(() => {
    markAllAsTouched();
    onSubmit && onSubmit();
    if (valid) {
      onValidSubmit && onValidSubmit();
    } else {
      onInValidSubmit && onInValidSubmit();
    }
  }, [markAllAsTouched, onSubmit, valid, onValidSubmit, onInValidSubmit]);

  const handleSubmit = useCallback((event: React.FormEvent<any>) => {
    event.stopPropagation();
    event.preventDefault();

    formProps && formProps.onSubmit && formProps.onSubmit(event);

    submit();
  }, [submit, formProps]);

  const formContext: FormContextValue<Model> = {
    valid,
    invalid,
    getFieldStatus,
    getFieldError,
    getFieldValue,
    onFieldBlur: handleFieldBlur,
    onFieldChange: handleFieldChange,
    onFieldFocus: handleFieldFocus,
    onFieldMount: handleFieldMount,
    onFieldUnmount: handleFieldUnmount,
    setArrayGetKey
  };

  const error = getFieldError('');
  const markAsTouched = useCallback(() => handleFieldBlur(''), [handleFieldBlur]);

  const rootFieldContext: FieldContextValue<Model> = {
    fieldPath: '',
    modelPath: '',
    name: '',
    value: model,
    setValue: setModel,
    markAsTouched,
    error,
    valid: !error,
    invalid: !!error,
    ...getFieldStatus('')
  };

  return (
    <FormContext.Provider value={formContext}>
      <FieldContext.Provider value={rootFieldContext}>
        <form {...formProps} onSubmit={handleSubmit}>
          {props.children}
        </form>
      </FieldContext.Provider>
    </FormContext.Provider>
  );
}

export const Form: typeof _Form = memo(_Form) as any;
