import { selectAll } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';

import Base from '../base/base.js';

const REVEAL_CLIP_PATH = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

export default class ImageWipeReveal extends Base {
  constructor(selector, options = {}, debug = false) {
    super(debug);
    this.log(`class instantiated with: ${selector}`);

    if (!selector) return;

    // Set default options
    this.options = {
      direction: 'left', // Default direction is left-to-right
      ...options
    };

    this.elements = selectAll(selector);
    this.images = Array.from(this.elements);
    this.init();
  }

  init() {
    if (this.images) {
      this.log(`Initialized with: `, this.images);

      this.images.forEach((image, i) => {
        this.log(`configuring image ${i} with direction: ${this.options.direction}`);
        
        gsap.set(image, { clipPath: REVEAL_CLIP_PATH }); // Set final state first
        
        if (this.options.direction === 'right') {
          // For right-to-left animation
          // Use fromTo to clearly define both states
          gsap.fromTo(image, 
            { clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)' },
            { 
              clipPath: REVEAL_CLIP_PATH,
              duration: 1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: image,
                start: 'top 75%'
              }
            }
          );
        } else {
          // For left-to-right animation
          gsap.fromTo(image, 
            { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' },
            { 
              clipPath: REVEAL_CLIP_PATH,
              duration: 1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: image,
                start: 'top 75%'
              }
            }
          );
        }
      });
    }
  }
}