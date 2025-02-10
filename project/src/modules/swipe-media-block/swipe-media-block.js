import { select, selectId } from '../../utils/helpers.js';
import { gsap, ScrollTrigger } from '../../utils/animation.js';

export default class SwipeMediaBlock {
  constructor(elementId) {
    if (!elementId) return;

    this.container = selectId(elementId);
    this.mediaWrapper = this.container.querySelector('.swipe-media');
    this.mediaFirst = this.mediaWrapper.querySelector('.sc-media:nth-child(1)');
    this.mediaSecond = this.mediaWrapper.querySelector('.sc-media:nth-child(2)');
    this.contentFirst = this.container.querySelector('.swipe-content .sc-block:nth-child(1)');
    this.contentSecond = this.container.querySelector('.swipe-content .sc-block:nth-child(2)');

    gsap.to(this.mediaFirst, {
      x: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: {
        trigger: this.container,
        start: 'top 0%',
        toggleActions: 'play reverse play reverse',
      },
      onComplete: () => {
        console.log('Animation 1 complete');
      },
    });

    gsap.to(this.mediaWrapper, {
      x: "100%", duration: 1, ease: 'expo.out',
      scrollTrigger: {
        trigger: this.container,
        start: '50% top',
        toggleActions: 'play reverse play reverse',
      },
      onComplete: () => {
        console.log('Animation 2 complete');
      },
    });
  }

  init() {
    this.firstBlockSetup();
    this.secondBlockSetup();
  }

  firstBlockSetup() {
  }

  secondBlockSetup() {
  }
}