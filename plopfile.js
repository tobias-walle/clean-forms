'use strict';

module.exports = (plop) => {
  plop.setHelper('camelCase', toCamelCase);
  plop.setHelper('lCamelCase', toLowerCamelCase);
  plop.setHelper('toState', toState);
  plop.setHelper('toProps', toProps);

  plop.setGenerator('component', {
    description: 'Create a React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'The name of the component'
      },
      {
        type: 'confirm',
        name: 'stateless',
        default: true,
        message: 'Should the component be stateless'
      },
    ],
    actions: data => {
      const basePath = 'src/lib/components/{{camelCase name}}/{{camelCase name}}';
      return [
        {
          type: 'add',
          path: `${basePath}.tsx`,
          templateFile: data.stateless ? 'plop-templates/stateless-component.hbs' : 'plop-templates/class-component.hbs'
        },
        {
          type: 'add',
          path: `${basePath}.spec.tsx`,
          templateFile: 'plop-templates/component-test.hbs'
        },
      ];
    }
  });
};

// Helpers
function toCamelCase(name) {
  return name
    .split('-')
    .map((word, i) =>
      word.length > 0
        ? `${word[0].toUpperCase()}${word.substr(1)}`
        : word
    )
    .join('');
}

function toLowerCamelCase(name) {
  const camelCase = toCamelCase(name);
  if (camelCase.length === 0) {
    return '';
  }
  return camelCase[0].toLowerCase() + camelCase.substr(1);
}

function toState(name) {
  return `${toCamelCase(name)}State`;
}

function toProps(name) {
  return `${toCamelCase(name)}Props`;
}
