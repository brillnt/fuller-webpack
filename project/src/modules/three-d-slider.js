import { select, selectId } from '../utils/helpers.js';
import './three-d-slider.css';

export default class ThreeDSlider {
  constructor(elementId) {
    if (!elementId) return;

    this.element = selectId(elementId);
    this.indicators = this.element.querySelectorAll('.tds-indicators .tds-indicator');
    this.init();
  }

  init() {
    // Initialize your module here
    let firstIndicator = this.indicators.firstElementChild.querySelector('.tdsi-active');
    if (firstIndicator) {
      firstIndicator.classList.add('tds--active');
    } 
  }
}