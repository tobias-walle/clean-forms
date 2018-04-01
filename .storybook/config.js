import { configure } from '@storybook/react';

function loadStories() {
  require('../out/storybook/stories/index');
}

configure(loadStories, module);
