import { configure } from '@storybook/react';

function loadStories() {
  require('../dist/stories');
}

configure(loadStories, module);
