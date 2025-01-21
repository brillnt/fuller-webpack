import { select, selectId } from '../utils/helpers.js';
import { gsap } from '../utils/animation.js';
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

        gsap.to(this.slides, {
          duration: 1,
          ease: 'power3.inOut',
          opacity: 0,
          y: -50,
          stagger: 0.1,
          onComplete: () => {
            this.element.querySelector('.tds-slides').innerHTML = '';
            this.element.querySelector('.tds-slides').appendChild(this.slides[index]);
            gsap.to(this.slides[index], {
              duration: 1,
              ease: 'power3.inOut',
              opacity: 1,
              y: 0
            });
          }
        });
      });
    });
  }
}