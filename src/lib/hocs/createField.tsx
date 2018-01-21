import * as React from 'react';
import { Field } from '../components';
import { FieldPropsWithoutRender, FieldRenderFunction } from '../components/Field/Field';

export function createField<Value, CustomProps>(
  render: FieldRenderFunction<Value, CustomProps>
): React.StatelessComponent<FieldPropsWithoutRender<CustomProps>> {
  return (props) => <Field {...props} render={render}/>;
}