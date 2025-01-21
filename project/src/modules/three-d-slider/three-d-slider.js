import { select, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';
import './three-d-slider.css';

export default class ThreeDSlider {
  constructor(elementId) {
    if (!elementId) return;

    this.element = selectId(elementId);
    this.indicators = this.element.querySelectorAll('.tds-indicators .tds-indicator');
    this.slides = this.element.querySelectorAll('.tds-slides .tds-slide');
    this.slides = Array.from(this.slides).reverse();
    this.init();
  }

  init() {
    // make first indicator active
    let firstIndicator = this.indicators.item(0).querySelector('.tdsi-active');
    if (firstIndicator) {
      firstIndicator.classList.add('tds--active');
    } 

    this.indicators.forEach((indicator, index) => {
      
      indicator.addEventListener('click', () => {
        this.indicators.forEach(ind => ind.querySelector('.tdsi-active').classList.remove('tds--active'));
        indicator.querySelector('.tdsi-active').classList.add('tds--active');
        let step = +indicator.getAttribute('data-step-indicator-num');
        step = step - 1;

        // make the slides move forward along the z-axis so it looks like the slides are moving toward the user.
        gsap.to(this.slides, {
          duration: 1,
          opacity: (i) => `${step === i ? 1 : 0}`,
          z: (i) => `${step === i ? 0 : 750}px`,
          y: 0,
          scale: (i) => `${step === i ? 1 : 0.5}`,
          ease: 'power4.inOut',
          stagger: {
            each: 0.1, // Adjust the stagger duration as needed
            from: 'start'
          }
        });
      });
    });
  }
}