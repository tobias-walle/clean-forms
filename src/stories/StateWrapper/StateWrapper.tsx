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

export class StateWrapper extends React.Component<StateWrapperProps<any>, any> {
  public state: any = this.props.initialState;
  private bindedSetState = this.setState.bind(this);

  public render() {
    const { render } = this.props;

    const channel = addons.getChannel();
    // send the notes to the channel.
    channel.emit(SET_STATE, this.state);

    return render({state: this.state, setState: this.bindedSetState});
  }
}
