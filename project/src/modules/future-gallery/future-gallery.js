import { select, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';

import Base from '../base/base.js';
import FullerAngleWatcher from '../fuller-angle-watcher/fuller-angle-watcher.js';
import './future-gallery.css';

const CONTROL_CLASS = 'fuller-gallery-control';
const HEADER_LIST_CLASS = 'fuller-gallery__header-list';
const HEADER_CLASS = 'fuller-gallery__header';
const HEADER_HEIGHT = 50;
const ACTIVE_CLASS = 'fgc-active';
const PREV_BUTTON_CLASS = 'fuller-gallery-prev'; // Placeholder for previous button class
const NEXT_BUTTON_CLASS = 'fuller-gallery-next'; // Placeholder for next button class

export default class FutureGallery extends Base {
  constructor(elementId, debug = false) {
    super(debug);

    if (!elementId) return;

    this.log(`initialized with elementId: ${elementId}`);

    this.element = selectId(elementId);
    this.controls = this.element.querySelectorAll(`.${CONTROL_CLASS}`);
    this.headerList = this.element.querySelector(`.${HEADER_LIST_CLASS}`);
    this.headers = this.headerList.querySelectorAll(`.${HEADER_CLASS}`);
    this.prevButton = this.element.querySelector(`.${PREV_BUTTON_CLASS}`);
    this.nextButton = this.element.querySelector(`.${NEXT_BUTTON_CLASS}`);
    this.log(`controls:`, this.controls);
    this.log(`element:`, this.element);
    this.init();
  }

  init() {
    new FullerAngleWatcher(`.${CONTROL_CLASS}`);
    gsap.set(this.controls, { opacity: 0, x: -20 });
    gsap.to(this.controls, {
      opacity: 1,
      x: 0,
      stagger: 0.2,
      scrollTrigger: {
        trigger: select('.fuller-gallery-controls'),
        start: 'top 86%',
        toggleActions: 'play none none reverse',
      },
    });

    this.controls.forEach(control => {
      control.addEventListener('click', () => {
        const layoutId = control.getAttribute('data-layout-id');
        this.log(`Control clicked: ${layoutId}`);
        this.animateToLayout(layoutId);
        this.updateActiveControl(control);
      });
    });

    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => {
        this.navigateToPrevious();
      });
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        this.navigateToNext();
      });
    }
  }

  animateToLayout(layoutId) {
    const targetHeader = Array.from(this.headers).find(header => header.getAttribute('data-layout-id') === layoutId);
    if (targetHeader) {
      const index = Array.from(this.headers).indexOf(targetHeader);
      const offset = -index * HEADER_HEIGHT;
      gsap.to(this.headerList, { y: offset, duration: 0.5, ease: 'expo.out' });
    }
  }

  updateActiveControl(activeControl) {
    this.log(`updateActiveControl:`, activeControl);
    this.controls.forEach(control => {
      control.classList.remove(ACTIVE_CLASS);
    });
    activeControl.classList.add(ACTIVE_CLASS);
  }

  navigateToPrevious() {
    const activeControl = this.element.querySelector(`.${CONTROL_CLASS}.${ACTIVE_CLASS}`);
    if (activeControl) {
      const currentIndex = Array.from(this.controls).indexOf(activeControl);
      const previousIndex = (currentIndex - 1 + this.controls.length) % this.controls.length;
      const previousControl = this.controls[previousIndex];
      const layoutId = previousControl.getAttribute('data-layout-id');
      this.animateToLayout(layoutId);
      this.updateActiveControl(previousControl);
    }
  }

  navigateToNext() {
    const activeControl = this.element.querySelector(`.${CONTROL_CLASS}.${ACTIVE_CLASS}`);
    if (activeControl) {
      const currentIndex = Array.from(this.controls).indexOf(activeControl);
      const nextIndex = (currentIndex + 1) % this.controls.length;
      const nextControl = this.controls[nextIndex];
      const layoutId = nextControl.getAttribute('data-layout-id');
      this.animateToLayout(layoutId);
      this.updateActiveControl(nextControl);
    }
  }
}