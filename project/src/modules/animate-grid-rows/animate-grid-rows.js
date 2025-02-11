import { select, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';
import './animate-grid-rows.css';

export default class AnimateGridRows {
  constructor(elementId, prefix, anchorLeft = true) {
    if (!elementId) return;

    this.selectorId = elementId;
    this.prefix = prefix;
    this.anchorLeft = anchorLeft;
    this.element = selectId(this.selectorId);

    this.gridRows = this.element.querySelectorAll(`.${prefix}-block-row`);

    this.init();
  }

  init() {
    console.log(`AnimateGridRows initialized with: ${this.selectorId} ${this.element}`);
    console.log(`Grid rows: ${this.gridRows}`);

    // Set initial positions for even rows
    this.gridRows.forEach((row, index) => {
      if (index % 2 === 0) {
        gsap.set(row, { xPercent: -25 });
      }
    });

    // Create the animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.element,
        start: 'top 50%',
        toggleActions: 'play pause resume pause',
        onEnter: () => tl.play(),
        onLeave: () => tl.pause(),
        onEnterBack: () => tl.play(),
        onLeaveBack: () => tl.pause(),
      },
      repeat: -1,
      yoyo: true,
      repeatDelay: 0,
    });

    // Add animations for each row
    this.gridRows.forEach((row, index) => {
      const direction = index % 2 === 0 ? 0 : (25 * (this.anchorLeft ? -1 : 1));
      tl.to(row, {
        xPercent: direction,
        duration: 20,
        ease: 'linear',
      }, 0); // Start all animations at the same time
    });
  }
}