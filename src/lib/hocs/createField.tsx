import * as React from 'react';
import { Field } from '../components';
import { FieldPropsWithoutRender, FieldRenderFunction } from '../components/Field/Field';
import { Omit } from '../types';

export interface CreateFieldOptions {
  /** Update the field everytime the form is updated. This may be necessary if the render depends on other fields. */
  updateOnEveryFormChange?: boolean;
}

export function createField<Value, CustomProps = {}>(
  render: FieldRenderFunction<Value, CustomProps>,
  options: CreateFieldOptions = {}
): React.StatelessComponent<Omit<CustomProps, 'name'> & FieldPropsWithoutRender> {
  const result: React.StatelessComponent<any> =
    ({ name, ...inner }) => <Field name={name} render={render} inner={inner} {...options}/> as any;
  result.displayName = `createField(${render.displayName || 'Component'})`;
  return result;
}
