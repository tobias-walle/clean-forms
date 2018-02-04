import * as React from 'react';
import { Field } from '../components';
import { FieldPropsWithoutRender, FieldRenderFunction } from '../components/Field/Field';
import { Omit } from '../types';

export function createField<Value, CustomProps = {}>(
  render: FieldRenderFunction<Value, CustomProps>
): React.StatelessComponent<Omit<CustomProps, 'name'> & FieldPropsWithoutRender> {
  const result: React.StatelessComponent<any> =
    ({ name, ...inner }) => <Field name={name} render={render} inner={inner}/> as any;
  result.displayName = `createField(${render.displayName || 'Component'})`;
  return result;
}
