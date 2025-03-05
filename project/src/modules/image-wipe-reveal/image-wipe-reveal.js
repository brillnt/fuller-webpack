import { selectAll } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';

import Base from '../base/base.js';

const REVEAL_CLIP_PATH = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
const CONCEAL_CLIP_PATH = 'polygon(0 0, 0 0, 0 100%, 0 100%)';

export default class ImageWipeReveal extends Base {
  constructor(selector, debug = false) {
    super(debug);
    this.log(`class instantiated with: ${selector}`);

    if (!selector) return;

    this.elements = selectAll(selector);
    this.images = Array.from(this.elements);
    this.init();
  }

  init() {
    if (this.images) {
      this.log(`Initialized with: `, this.images);

      this.images.forEach((image, i) => {
        this.log(`configuring image ${i}`);
        gsap.set(image, { clipPath: CONCEAL_CLIP_PATH });
        gsap.to(image, {
          clipPath: REVEAL_CLIP_PATH,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: image,
            start: 'top 75%'
          }
        })
      });
    }
  }
}