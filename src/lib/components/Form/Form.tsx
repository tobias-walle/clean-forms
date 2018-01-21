import * as PropTypes from 'prop-types';
import * as React from 'react';

export type OnValueChange<Model> = <K extends keyof Model>(name: K, value: Model[K]) => void;

export interface FormContext<Model> {
  model: Model;
  onValueChange: OnValueChange<Model>;
}

export const formContextTypes = {
  model: PropTypes.object,
  onValueChange: PropTypes.func,
};

export interface FormProps<Model> {
  model: Model;
  onChange?: (model: Model) => void;
}

export class Form<Model = any> extends React.Component<FormProps<Model>, {}> {
  static childContextTypes = formContextTypes;

  public render() {
    return (
      <form>
        {this.props.children}
      </form>
    );
  }

  public getChildContext(): FormContext<Model> {
    return {
      model: this.props.model,
      onValueChange: this.onValueChange
    };
  }

  private onValueChange: OnValueChange<Model> = (name, value) => {
    const { onChange, model } = this.props;
    onChange && onChange({
      ...(model as any),
      [name]: value
    });
  };
}
