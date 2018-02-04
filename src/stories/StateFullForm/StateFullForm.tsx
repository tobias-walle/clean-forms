import { action } from '@storybook/addon-actions';
import * as React from 'react';
import { FormState } from '../../lib/api/FormApi';
import { Form } from '../../lib/components';
import { FormProps } from '../../lib/components/Form/Form';
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
          <Form
            state={state}
            onChange={wrapWithAction('onChange', setState)}
            onSubmit={action('onSubmit')}
            {...other}
          >
            {children}
          </Form>
        }
      />
    );
  }
}

function wrapWithAction<Func extends Function>(name: string, implementation: Func): Func {
  const triggerAction = action(name);
  const result: any =  (...args: any[]) => {
    triggerAction(...args);
    return implementation(...args);
  };
  return result;
}
