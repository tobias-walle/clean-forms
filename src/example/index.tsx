import React from 'react';
import { render } from 'react-dom';
import { LoginForm } from './LoginForm';

import './styles.css';

function App() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}

const rootElement = document.getElementById('root');
render(<App />, rootElement);
