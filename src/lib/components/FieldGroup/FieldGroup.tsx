import * as React from 'react';
import { FieldGroupContext, FieldGroupContextValue } from '../../contexts/field-group-context';
import { createPath } from '../../utils';

export interface FieldGroupProps {
  name: string;
  accessor?: string;
}

export interface FieldGroupState {
}

export class FieldGroup extends React.Component<FieldGroupProps, FieldGroupState> {
  public render() {
    return (
      <FieldGroupContext.Consumer>
        {parentContext => (
          <FieldGroupContext.Provider value={this.createContext(parentContext)}>
            {this.props.children}
          </FieldGroupContext.Provider>
        )}
      </FieldGroupContext.Consumer>
    );
  }

  private createContext(parentContext: FieldGroupContextValue): FieldGroupContextValue {
    const { name, accessor } = this.props;
    return {
      path: createPath(parentContext.path, accessor || name),
      namespace: createPath(parentContext.namespace, name)
    };
  }
}
