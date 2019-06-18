import * as React from 'react';
import {
  FormEvent,
  forwardRef,
  memo,
  MutableRefObject,
  Ref,
  RefAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FieldContext, FieldContextValue } from '../contexts/fieldContext';
import {
  FormContext,
  FormContextValue,
  OnFieldBlur,
  OnFieldChange,
  OnFieldMount,
  OnFieldUnmount,
  SetArrayGetKey,
} from '../contexts/formContext';
import { useMemorizedPath } from '../hooks';
import { useAsRef } from '../hooks/useAsRef';
import { useFormReadApi } from '../hooks/useFormReadApi';
import { useShallowMemo } from '../hooks/useShallowMemo';
import {
  fieldPath as createFieldPath,
  FormState,
  getPathAsString,
  Path,
  path as createPath,
} from '../models';
import { cloneFieldStatus } from '../statusTracking';
import { FieldStatusUpdater } from '../statusTracking/FieldStatusUpdater';
import { FieldRegister, FieldRegisterChanges } from '../utils';
import { StateUpdater } from '../utils/StateUpdater';
import {
  FieldErrorMapping,
  validateModel,
  ValidationDefinition,
} from '../validation';

import { GetKey } from './FieldArrayItems';

export type OnChange<Model> = (state: FormState<Model>) => void;
export type OnSubmit = (event?: FormEvent<HTMLFormElement>) => void;
export type OnErrorsChange = (errors: FieldErrorMapping) => void;

export interface FormRef {
  /** Trigger a form submit */
  submit: () => void;
}

export type FormProps<Model> = {
  state: FormState<Model>;
  onChange?: OnChange<Model>;
  onSubmit?: OnSubmit;
  onValidSubmit?: OnSubmit;
  onInValidSubmit?: OnSubmit;
  onErrorsChange?: OnErrorsChange;
  validation?: ValidationDefinition<Model>;
  formProps?: JSX.IntrinsicElements['form'];

  /** Strictly check if the name structure matches the form model. Default is true. */
  strict?: boolean;

  children?: React.ReactNode;
} & RefAttributes<FormRef>;

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

function _Form<Model = any>(props: FormProps<Model>, ref: Ref<FormRef>) {
  const {
    state,
    validation,
    formProps,
    onChange,
    onSubmit,
    onErrorsChange,
    onInValidSubmit,
    onValidSubmit,
    strict,
  } = props;
  const { model, status = {} } = state;

  const setModel = useCallback(
    (newModel: Model) => onChange && onChange({ model: newModel }),
    [onChange]
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  // PropsStateUpdaterRef
  const propsStateUpdaterRef = useRef(
    new StateUpdater<FormState<Model>>(
      () => stateRef.current,
      () => isMountedRef.current
    )
  );
  useEffect(() => {
    propsStateUpdaterRef.current.registerOnChange(onChange);
  }, [onChange]);

  // ArrayGetKeyMapping
  const arrayGetKeyMappingRef = useRef<Map<string, GetKey<any>>>(new Map());

  const setArrayGetKey: SetArrayGetKey<Model> = useCallback((path, getKey) => {
    arrayGetKeyMappingRef.current.set(getPathAsString(path), getKey);
  }, []);

  const removeArrayGetKeyFunction = useCallback((path: Path<Model>) => {
    arrayGetKeyMappingRef.current.delete(getPathAsString(path));
  }, []);

  // FieldRegisterRef
  const handleFieldRegisterChanges = useCallback(
    (changes: FieldRegisterChanges): void => {
      let updatedStatus = status;
      changes.registered.forEach(newPath => {
        updatedStatus = fieldStatusUpdaterRef.current.addIfFieldNotExists(
          updatedStatus,
          newPath
        );
      });

      changes.unregistered.forEach(removedPath => {
        updatedStatus = fieldStatusUpdaterRef.current.removeIfFieldExists(
          updatedStatus,
          removedPath
        );
        removeArrayGetKeyFunction(removedPath);
      });

      propsStateUpdaterRef.current.patch({ status: updatedStatus });
    },
    [status, removeArrayGetKeyFunction]
  );

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
    () =>
      validation
        ? validateModel({ model, validationDefinition: validation })
        : {},
    [model, validation]
  );

  useEffect(() => {
    onErrorsChange && onErrorsChange(fieldErrorMapping);
  }, [fieldErrorMapping, onErrorsChange]);

  const {
    valid,
    invalid,
    getFieldStatus,
    getFieldError,
    getFieldValue,
  } = useFormReadApi({
    state,
    validationDefinition: validation,
    fieldErrorMapping,
    strict,
  });

  // Callbacks
  const handleFieldMount: OnFieldMount<Model> = useCallback(
    path => {
      fieldRegister.register(path);
    },
    [fieldRegister]
  );

  const handleFieldUnmount: OnFieldUnmount<Model> = useCallback(
    path => {
      if (!isMountedRef.current) {
        // Cancel if the form is not mounted anymore
        return;
      }
      fieldRegister.unregister(path);
    },
    [fieldRegister, isMountedRef]
  );

  const getFieldStatusRef = useAsRef(getFieldStatus);
  const handleFieldBlur: OnFieldBlur<Model> = useCallback(
    path => {
      const newStatus = cloneFieldStatus(getFieldStatusRef.current(path), {
        touched: true,
      });
      propsStateUpdaterRef.current.update(oldState => ({
        ...oldState,
        status: {
          ...oldState.status,
          [getPathAsString(path)]: newStatus,
        },
      }));
    },
    [getFieldStatusRef]
  );

  const statusRef = useAsRef(status);
  const handleFieldChange: OnFieldChange<Model> = useCallback(
    (id, path, value) => {
      propsStateUpdaterRef.current.updateDeep(
        `model.${getPathAsString(path)}`,
        value,
        true
      );

      const updatedStatus = fieldStatusUpdaterRef.current.markAsDirty(
        statusRef.current,
        id
      );

      propsStateUpdaterRef.current.patch({ status: updatedStatus });
    },
    [statusRef]
  );
  // Callbacks End

  const markAllAsTouched = useCallback(() => {
    const updatedStatus = fieldStatusUpdaterRef.current.markAllAsTouched(
      statusRef.current
    );
    propsStateUpdaterRef.current.patch({ status: updatedStatus });
  }, [statusRef]);

  const submit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      markAllAsTouched();
      onSubmit && onSubmit(event);
      if (valid) {
        onValidSubmit && onValidSubmit(event);
      } else {
        onInValidSubmit && onInValidSubmit(event);
      }
    },
    [markAllAsTouched, onSubmit, valid, onValidSubmit, onInValidSubmit]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.stopPropagation();
      event.preventDefault();

      formProps && formProps.onSubmit && formProps.onSubmit(event);

      submit(event);
    },
    [submit, formProps]
  );

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

  const error = getFieldError();
  const markAsTouched = useCallback(() => handleFieldBlur(createPath()), [
    handleFieldBlur,
  ]);

  const rootFieldContext: FieldContextValue<Model> = useShallowMemo({
    fieldPath: useMemorizedPath(createFieldPath<Model>()),
    modelPath: useMemorizedPath(createPath<Model>()),
    name: '',
    value: model,
    setValue: setModel,
    markAsTouched,
    error,
    valid: !error,
    invalid: !!error,
    ...getFieldStatus(),
  });

  useImperativeHandle(ref, () => ({ submit }), [submit]);

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
export const Form: Form = memo(forwardRef(_Form)) as any;
