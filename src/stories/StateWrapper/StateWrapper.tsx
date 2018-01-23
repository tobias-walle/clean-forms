import addons from '@storybook/addons';
import * as React from 'react';

export const SET_STATE = 'my/state/set_state';

export interface StateWrapperInnerProps<State> {
  state: State;
  setState: (state: Partial<State>) => void;
}

export interface StateWrapperProps<State> {
  initialState: State;
  render: React.StatelessComponent<StateWrapperInnerProps<State>>;
}

export class StateWrapper<State = any> extends React.Component<StateWrapperProps<State>, State> {
  public state: State = this.props.initialState;
  private bindedSetState = this.setState.bind(this);

  public render() {
    const { render: Component } = this.props;

    const channel = addons.getChannel();
    // send the notes to the channel.
    channel.emit(SET_STATE, this.state);

    return <Component state={this.state} setState={this.bindedSetState}/>;
  }
}
