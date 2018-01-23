import { configure } from '@storybook/react';

function loadStories() {
  require('../out/storybook/stories');
}

configure(loadStories, module);
