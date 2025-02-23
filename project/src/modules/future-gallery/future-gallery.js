import { select, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';

import Base from '../base/base.js';
import FullerAngleWatcher from '../fuller-angle-watcher/fuller-angle-watcher.js';
import './future-gallery.css';

const CONTROL_CLASS = 'fuller-gallery-control';
const HEADER_LIST_CLASS = 'fuller-gallery__header-list';
const HEADER_CLASS = 'fuller-gallery__header';
const LIST_COLLECTION_CLASS = 'fuller-gallery__list-collection';
const LIST_ITEM_CLASS = 'fuller-gallery__list';
const MODEL_LIST_CLASS = 'fuller-gallery__model-list';
const MODEL_ITEM_CLASS = 'fuller-gallery__model';
const ACTIVE_CLASS = 'fgc-active';
const FLAT_FROM_LEFT = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
const FULLY_VISIBLE = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const HEADER_HEIGHT = 50;

export default class FutureGallery extends Base {
  constructor(elementId, debug = false) {
    super(debug);
    if (!elementId) return;
    this.element = selectId(elementId);
    this.controls = this.element.querySelectorAll(`.${CONTROL_CLASS}`);
    this.headerList = this.element.querySelector(`.${HEADER_LIST_CLASS}`);
    this.headers = this.headerList.querySelectorAll(`.${HEADER_CLASS}`);
    this.listCollection = this.element.querySelector(`.${LIST_COLLECTION_CLASS}`);
    this.listItems = this.listCollection.querySelectorAll(`.${LIST_ITEM_CLASS}`);
    this.modelList = this.element.querySelector(`.${MODEL_LIST_CLASS}`);
    this.modelItems = this.modelList.querySelectorAll(`.${MODEL_ITEM_CLASS}`);
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
        this.animateToLayout(layoutId);
        this.updateActiveControl(control, layoutId);
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

    const targetListItem = Array.from(this.listItems).find(item => item.getAttribute('data-layout-id') === layoutId);
    if (targetListItem) {
      const index = Array.from(this.listItems).indexOf(targetListItem);
      const offset = -index * this.listCollection.clientWidth;
      gsap.to(this.listCollection, { x: offset, duration: 0.5, ease: 'expo.out' });
    }

    const targetModelItem = Array.from(this.modelItems).find(item => item.getAttribute('data-layout-id') === layoutId);
    if (targetModelItem) {
      const activeModelItem = this.element.querySelector(`.${MODEL_ITEM_CLASS}.active`);
      gsap.set(targetModelItem, { zIndex: 1 });
      if (activeModelItem) {
        gsap.set(activeModelItem, { zIndex: 0 });
        activeModelItem.classList.remove('active');
      }
      targetModelItem.classList.add('active');

      gsap.fromTo(
        targetModelItem,
        { clipPath: FLAT_FROM_LEFT },
        {
          clipPath: FULLY_VISIBLE,
          duration: 0.5,
          ease: 'hop',
        }
      );
    }
  }

  updateActiveControl(activeControl, layoutId) {
    this.controls.forEach(control => {
      control.classList.remove(ACTIVE_CLASS);
    });
    activeControl.classList.add(ACTIVE_CLASS);
    this.modelItems.forEach(modelItem => {
      modelItem.classList.remove('active');
    });
    const targetModelItem = Array.from(this.modelItems).find(item => item.getAttribute('data-layout-id') === layoutId);
    if (targetModelItem) {
      targetModelItem.classList.add('active');
    }
  }

  navigateToPrevious() {
    const activeControl = this.element.querySelector(`.${CONTROL_CLASS}.${ACTIVE_CLASS}`);
    if (activeControl) {
      const currentIndex = Array.from(this.controls).indexOf(activeControl);
      const previousIndex = (currentIndex - 1 + this.controls.length) % this.controls.length;
      const previousControl = this.controls[previousIndex];
      const layoutId = previousControl.getAttribute('data-layout-id');
      this.animateToLayout(layoutId);
      this.updateActiveControl(previousControl, layoutId);
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
      this.updateActiveControl(nextControl, layoutId);
    }
  }
}
