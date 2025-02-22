import { select, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';

import Base from '../base/base.js';
import FullerAngleWatcher from '../fuller-angle-watcher/fuller-angle-watcher.js';
import './future-gallery.css';

const CONTROL_CLASS = 'fuller-gallery-control';

export default class FutureGallery extends Base {
  constructor(elementId, debug = false) {
    super(debug);

    if (!elementId) return;

    this.log(`initialized with elementId: ${elementId}`);

    this.element = selectId(elementId);
    this.controls = this.element.querySelectorAll(`.${CONTROL_CLASS}`);
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
  }
}