import { select, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';
import './three-d-slider.css';

const EASE_FUNCTION = 'expo.out';
const STEP_ATTR_INDICATOR = 'data-step-indicator-num';
const STEP_ATTR_SLIDE = 'data-step-num';
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
    this.addListeners();
  }

  addListeners() {
    this.indicators.forEach((indicator, index) => {

      // set active indicator
      let activeIndicator = indicator.querySelector('.tdsi-active');
      activeIndicator.classList.add(index === 0 ? 'tds--active' : 'tds--back');

      indicator.addEventListener('click', () => {
        // store last active indicator
        let lastActiveIndicator = this.element.querySelector('.tds-indicators .tds--active');
        let lastActiveStep = +lastActiveIndicator.parentElement.parentElement.getAttribute(STEP_ATTR_INDICATOR);

        // update active indicator
        this.indicators.forEach(ind => ind.querySelector('.tdsi-active').classList.remove('tds--active'));
        let indicatorActiveCircle = indicator.querySelector('.tdsi-active');
        indicatorActiveCircle.classList.remove('tds--back');
        indicatorActiveCircle.classList.remove('tds--forward');
        indicatorActiveCircle.classList.add('tds--active');

        // get updated list of slides
        let liveSlides = this.element.querySelectorAll('.tds-slides .tds-slide');
        liveSlides = Array.from(liveSlides).reverse();

        // get new active step number & index
        let newActiveStep = +indicator.getAttribute(STEP_ATTR_INDICATOR);
        let activeSlideIndex = Array.from(liveSlides).findIndex((slide) => newActiveStep === +slide.getAttribute(STEP_ATTR_SLIDE));
        let movingForward = newActiveStep > lastActiveStep;

        if (movingForward) {
          lastActiveIndicator.classList.add('tds--forward');
        } else {
          lastActiveIndicator.classList.add('tds--back');
        }

        // animating foward
        liveSlides.forEach((slide, slideIndex) => {
          let offset = slideIndex - activeSlideIndex;
          let delay = movingForward ? (slideIndex * 0.1) : ((this.slides.length - slideIndex - 1) * 0.1);

          gsap.set(slide, { display: 'flex' });

          if (offset > 0) {
            // slides in the background
            gsap.to(slide, {
              z: offset * -50,
              y: offset * -25,
              opacity: 1,
              ease: EASE_FUNCTION,
              duration: .7,
              delay,
            });
          } else if (offset === 0) {
            // active slide
            gsap.to(slide, {
              z: 0,
              y: 0,
              opacity: 1,
              ease: EASE_FUNCTION,
              duration: 0.7,
              delay,
            });
          } else {
            // slides that animate offscreen
            gsap.to(slide, {
              // z: offset * -100,
              y: offset * -100,
              opacity: 0,
              ease: EASE_FUNCTION,
              duration: 0.5,
              delay,
              onComplete: () => {
                gsap.set(slide, { display: 'none' });
              }
            });
          }
        });
      });
    });
  }
}