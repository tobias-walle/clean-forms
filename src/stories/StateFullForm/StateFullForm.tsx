import { action } from '@storybook/addon-actions';
import * as React from 'react';
import { Form } from '../../lib/components';
import { FormProps, FormState, OnChange } from '../../lib/components/Form/Form';
import { StateWrapper } from '../StateWrapper/StateWrapper';

export interface StateFullFormProps<Model> extends Partial<FormProps<Model>> {
  initialState: FormState<Model>;
}

export class StateFullForm extends React.Component<StateFullFormProps<any>, {}> {
  public render() {
    const { initialState, children, ...other } = this.props;
    return (
      <StateWrapper
        initialState={initialState}
        render={({ state, setState }) =>
          <Form state={state} onChange={(newState) => this.onChange(newState, setState)} {...other}>
            {children}
          </Form>
        }
      />
    );
  }

  private onChange = (state: FormState<any>, setState: (state: FormState<any>) => void) => {
    setState(state);
  };
}
