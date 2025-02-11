import { select, selectId } from '../../utils/helpers.js';

export default class AnimateGridRows {
  constructor(elementId) {
    if (!elementId) return;

    this.selectorId = elementId;
    this.element = selectId(this.selectorId);
    this.init();
  }

  init() {
    // Initialize your module here
    console.log(`AnimateGridRows initialized with: ${this.selectorId} ${this.element}`);
  }
}