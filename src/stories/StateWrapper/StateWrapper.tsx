import * as React from 'react';

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
    const {render: Component} = this.props;
    return <Component state={this.state} setState={this.bindedSetState}/>;
  }
}
