import * as React from 'react';
import {
  FormEventHandler,
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FieldContext, FieldContextValue } from '../contexts/field-context';
import {
  FormContext,
  FormContextValue,
  OnFieldBlur,
  OnFieldChange,
  OnFieldMount,
  OnFieldUnmount,
  SetArrayGetKey,
} from '../contexts/form-context';
import { useAsRef } from '../hooks/useAsRef';
import { useFormReadApi } from '../hooks/useFormReadApi';
import { useShallowMemo } from '../hooks/useShallowMemo';
import { FormState } from '../models';
import { cloneFieldStatus } from '../statusTracking';
import { FieldStatusUpdater } from '../statusTracking/FieldStatusUpdater';
import { FieldRegister, FieldRegisterChanges, Path } from '../utils';
import { StateUpdater } from '../utils/StateUpdater';
import { FieldErrorMapping, validateModel, ValidationDefinition } from '../validation';

import { GetKey } from './FieldArrayItems';

export type OnChange<Model> = (state: FormState<Model>) => void;
export type OnSubmit = FormEventHandler<HTMLFormElement>;

export interface FormProps<Model> {
  state: FormState<Model>;
  onChange?: OnChange<Model>;
  onSubmit?: OnSubmit;
  onValidSubmit?: OnSubmit;
  onInValidSubmit?: OnSubmit;
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
    onValidSubmit,
  } = props;
  const { model, status = {} } = state;

  const setModel = useCallback(
    (newModel: Model) => onChange && onChange({ model: newModel }),
    [onChange],
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  // PropsStateUpdaterRef
  const propsStateUpdaterRef = useRef(new StateUpdater<FormState<Model>>(
    () => stateRef.current,
    () => isMountedRef.current,
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

  const [fieldRegister] = useState(new FieldRegister());
  useLayoutEffect(() => {
    fieldRegister.addListener(handleFieldRegisterChanges);
    return () => fieldRegister.removeListener(handleFieldRegisterChanges);
  }, [fieldRegister, handleFieldRegisterChanges]);
  // FieldRegisterRef END

  const fieldStatusUpdaterRef = useRef(new FieldStatusUpdater(fieldRegister));

  const isMountedRef = useIsMounted();

  // API
  const fieldErrorMapping = useMemo<FieldErrorMapping>(
    () => validation
      ? validateModel({ model, validationDefinition: validation })
      : {},
    [model, validation],
  );

  const {
    valid,
    invalid,
    getFieldStatus,
    getFieldError,
    getFieldValue,
  } = useFormReadApi({ state, validationDefinition: validation, fieldErrorMapping });

  // Callbacks
  const handleFieldMount: OnFieldMount = useCallback((path) => {
    fieldRegister.register(path);
  }, [fieldRegister]);

  const handleFieldUnmount: OnFieldUnmount = useCallback((path) => {
    if (!isMountedRef.current) {
      // Cancel if the form is not mounted anymore
      return;
    }
    fieldRegister.unregister(path);
  }, [fieldRegister, isMountedRef]);

  const getFieldStatusRef = useAsRef(getFieldStatus);
  const handleFieldBlur: OnFieldBlur = useCallback((path) => {
    const newStatus = cloneFieldStatus(getFieldStatusRef.current(path), { touched: true });
    propsStateUpdaterRef.current.update((oldState) => ({
      ...oldState,
      status: {
        ...oldState.status,
        [path]: newStatus,
      },
    }));
  }, [getFieldStatusRef]);

  const statusRef = useAsRef(status);
  const handleFieldChange: OnFieldChange<Model> = useCallback((id, path, value) => {
    propsStateUpdaterRef.current.updateDeep(`model.${path}`, value, true);

    const updatedStatus = fieldStatusUpdaterRef.current.markAsDirty(statusRef.current, id);

    propsStateUpdaterRef.current.patch({ status: updatedStatus });
  }, [statusRef]);
  // Callbacks End

  const markAllAsTouched = useCallback(() => {
    const updatedStatus = fieldStatusUpdaterRef.current.markAllAsTouched(statusRef.current);
    propsStateUpdaterRef.current.patch({ status: updatedStatus });
  }, [statusRef]);

  const submit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    markAllAsTouched();
    onSubmit && onSubmit(event);
    if (valid) {
      onValidSubmit && onValidSubmit(event);
    } else {
      onInValidSubmit && onInValidSubmit(event);
    }
  }, [markAllAsTouched, onSubmit, valid, onValidSubmit, onInValidSubmit]);

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    event.preventDefault();

    formProps && formProps.onSubmit && formProps.onSubmit(event);

    submit(event);
  }, [submit, formProps]);

  const formContext: FormContextValue<Model> = useShallowMemo({
    valid,
    invalid,
    getFieldStatus,
    getFieldError,
    getFieldValue,
    onFieldBlur: handleFieldBlur,
    onFieldChange: handleFieldChange,
    onFieldMount: handleFieldMount,
    onFieldUnmount: handleFieldUnmount,
    setArrayGetKey,
  });

  const error = getFieldError('');
  const markAsTouched = useCallback(() => handleFieldBlur(''), [handleFieldBlur]);

  const rootFieldContext: FieldContextValue<Model> = useShallowMemo({
    fieldPath: '',
    modelPath: '',
    name: '',
    value: model,
    setValue: setModel,
    markAsTouched,
    error,
    valid: !error,
    invalid: !!error,
    ...getFieldStatus(''),
  });

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

export type Form = typeof _Form;
export const Form: Form = memo(_Form) as any;
