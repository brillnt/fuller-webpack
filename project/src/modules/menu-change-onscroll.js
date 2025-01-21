import { on, select, selectId } from '../utils/helpers.js';

// This class changes the navigation bar style when scrolling past a certain point
export default class MenuChangeOnScroll {
  constructor(navId) {
    if (!navId) return;

    // find the element that triggers the change, or exit.
    this.triggerElement = select('[data-id="triggerMenuChange"]');
    if (!this.triggerElement) return;

    this.navElement = selectId(navId);
    this.triggerPoint = this.triggerElement.offsetTop;
    this.belowFoldClass = 'compact';
    this.init();
  }

  init() {
    on(window, 'scroll', () => {
      if (window.scrollY > this.triggerPoint) {
        this.navElement.classList.add(this.belowFoldClass);
      } else {
        this.navElement.classList.remove(this.belowFoldClass);
      }
    });
  }
}
