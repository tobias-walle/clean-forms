import * as React from 'react';
import { Field } from '../components';
import { FieldPropsWithoutRender, FieldRenderFunction } from '../components/Field/Field';
import { Omit } from '../types';
import { createStandaloneField, StandaloneFieldComponent } from './createStandaloneField';

export type FieldComponentProps<CustomProps> = Omit<CustomProps, 'name'> & FieldPropsWithoutRender;

export type FieldComponent<Value, CustomProps> = React.StatelessComponent<FieldComponentProps<CustomProps>>
  & { standalone: StandaloneFieldComponent<Value, CustomProps> };

export interface CreateFieldOptions {
  /** Update the field everytime the form is updated. This may be necessary if the render depends on other fields. */
  updateOnEveryFormChange?: boolean;
}

export function createField<Value, CustomProps = {}>(
  render: FieldRenderFunction<Value, CustomProps>,
  options: CreateFieldOptions = {}
): FieldComponent<Value, CustomProps> {
  const result: FieldComponent<Value, CustomProps> = (
    ({ name, ...inner }: any) => <Field name={name} render={render} inner={inner} {...options}/>
  ) as any;
  result.displayName = `createField(${render.displayName || 'Component'})`;
  result.standalone = createStandaloneField(render);
  return result;
}
