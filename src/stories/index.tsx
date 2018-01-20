import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Form } from '../lib';

storiesOf('Form', module)
  .add('with no arguments', () => (
    <Form/>
  ));
