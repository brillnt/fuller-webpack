import { select, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';

const REVEAL_CLIP_PATH = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
const CONCEAL_LEFT_CLIP_PATH = 'polygon(0 0, 0 0, 0 100%, 0 100%)';
const CONCEAL_RIGHT_CLIP_PATH = 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)';

export default class SimpleImageSlider {
  constructor(selector) {
    if (!selector) return;

    this.selector = selector;
    this.element = select(this.selector);
    this.images = this.element.querySelectorAll('img');
    this.init();
  }

  init() {
    console.log(`SimpleImageSlider initialized with: ${this.selector} ${this.element}`);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.element,
        start: 'top 60%',
        toggleActions: 'play reverse play reverse',
      },
      repeat: -1,
      repeatDelay: 2,
    });

    const moves = {
      ready: { clipPath: CONCEAL_LEFT_CLIP_PATH },
      show:  { clipPath: REVEAL_CLIP_PATH, duration: 1, ease: 'expo.out' },
      hide:  { clipPath: CONCEAL_RIGHT_CLIP_PATH, duration: 1, delay: 2, ease: 'expo.out' }
    }

    tl.set(this.images, moves.ready)
      .to(this.images[0], moves.show)
      .to(this.images[0], moves.hide)
      .to(this.images[1], moves.show, '-=1')
      .to(this.images[1], moves.hide)
      .to(this.images[2], moves.show)
      .to(this.images[2], moves.hide);
  }
}