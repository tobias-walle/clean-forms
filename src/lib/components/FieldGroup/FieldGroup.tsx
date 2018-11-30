import * as React from 'react';
import { FieldGroupContext, FieldGroupContextValue } from '../../contexts/field-group-context';
import { createPath } from '../../utils';
import { isShallowEqual } from '../../utils/isShallowEqual';

export interface FieldGroupProps {
  name: string;
  accessor?: string;
}

export class FieldGroup extends React.Component<FieldGroupProps, {}> {
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

  public shouldComponentUpdate(nextProps: FieldGroupProps) {
    return isShallowEqual(this.props, nextProps);
  }

  private createContext(parentContext: FieldGroupContextValue): FieldGroupContextValue {
    const { name, accessor } = this.props;
    return {
      path: createPath(parentContext.path, accessor || name),
      namespace: createPath(parentContext.namespace, name)
    };
  }
}
