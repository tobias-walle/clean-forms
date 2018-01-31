import { action } from '@storybook/addon-actions';
import * as React from 'react';
import { Form } from '../../lib/components';
import { FormMeta, FormProps, FormState, OnChange } from '../../lib/components/Form/Form';
import { StateWrapper } from '../StateWrapper/StateWrapper';

export interface StateFullFormProps<Model> extends Partial<FormProps<Model>> {
  initialState: FormState<Model>;
}

export class StateFullForm<Model = any> extends React.Component<StateFullFormProps<Model>, {}> {
  public render() {
    const { initialState, children, ...other } = this.props;
    return (
      <StateWrapper
        initialState={initialState}
        render={({ state, setState }) =>
          <Form state={state} onChange={(newState, meta) => this.onChange(newState, meta, setState)} {...other}>
            {children}
          </Form>
        }
      />
    );
  }

  private onChange = (state: FormState<Model>, meta: FormMeta<Model>, setState: (state: FormState<Model>) => void) => {
    action('onChange')(state, meta);
    setState(state);
  };
}
