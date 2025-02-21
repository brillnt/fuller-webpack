import { select, selectId } from '../../utils/helpers.js';
import AnimatePath from '../animate-path/animate-path.js';

import './three-pillars.css';

export default class ThreePillars {
  constructor(elementId) {
    if (!elementId) return;

    this.element = selectId(elementId);
    this.init();
  }

  init() {
    // Initialize your module here
    new AnimatePath('light-gear-network', { duration: 1 });
    new AnimatePath('data-chip-icon', { duration: 1 });
    new AnimatePath('home-processing-icon', { duration: 1 });
  }
}