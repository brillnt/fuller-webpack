import { selectId } from '../../utils/helpers.js';
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

    if (this.slides && this.slides.length !== 0) {
      this.slides = Array.from(this.slides).reverse();
    }

    this.prevBtns = this.element.querySelectorAll('.tdss__nav-btn.tdss__nav-btn--prev');
    this.nextBtns = this.element.querySelectorAll('.tdss__nav-btn.tdss__nav-btn--next');

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

      indicator.addEventListener('click', (e) => {
        this.handleIndicatorClick(e.currentTarget);
      });
    });

    if (this.prevBtns && this.prevBtns.length !== 0 && this.nextBtns && this.nextBtns.length !== 0) {
      this.prevBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handlePrevClick(e.currentTarget);
        });
      });

      this.nextBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleNextClick(e.currentTarget);
        });
      });

      this.updateButtonStates();
    }
  }

  handleIndicatorClick(indicator) {
    let isActive = indicator.querySelector('.tdsi-active').classList.contains('tds--active');
    if (isActive) return;

    // store last active indicator
    let prevActiveIndicator = this.element.querySelector('.tds-indicators .tds--active');
    let prevActiveStep = +prevActiveIndicator.parentElement.parentElement.getAttribute(STEP_ATTR_INDICATOR);

    // update active indicator
    this.indicators.forEach(ind => ind.querySelector('.tdsi-active').classList.remove('tds--active'));
    let currentActiveIndicator = indicator.querySelector('.tdsi-active');
    currentActiveIndicator.classList.remove('tds--back');
    currentActiveIndicator.classList.remove('tds--forward');
    currentActiveIndicator.classList.add('tds--active');

    // get updated list of slides
    let liveSlides = this.element.querySelectorAll('.tds-slides .tds-slide');
    liveSlides = Array.from(liveSlides).reverse();

    // get new active step number & index
    let newActiveStep = +indicator.getAttribute(STEP_ATTR_INDICATOR);
    let activeSlideIndex = Array.from(liveSlides).findIndex((slide) => newActiveStep === +slide.getAttribute(STEP_ATTR_SLIDE));
    let movingForward = newActiveStep > prevActiveStep;

    if (movingForward) {
      prevActiveIndicator.classList.add('tds--forward');
    } else {
      prevActiveIndicator.classList.add('tds--back');
    }

    // animate all slides
    this.animateSlides(liveSlides, activeSlideIndex, movingForward);
    this.updateButtonStates();
  }

  handlePrevClick(btn) {
    let currentStep = +btn.getAttribute(STEP_ATTR_SLIDE);
    let prevStep = currentStep - 1;

    if (prevStep < 1) return;

    let prevIndicator = this.indicators[prevStep - 1];
    this.handleIndicatorClick(prevIndicator);
  }

  handleNextClick(btn) {
    let currentStep = +btn.getAttribute(STEP_ATTR_SLIDE);
    let nextStep = currentStep + 1;

    if (nextStep > this.slides.length) return;

    let nextIndicator = this.indicators[nextStep - 1];
    this.handleIndicatorClick(nextIndicator);
  }

  animateSlides(liveSlides, activeSlideIndex, movingForward) {
    liveSlides.forEach((slide, slideIndex) => {
      let offset = slideIndex - activeSlideIndex;
      let delay = movingForward ? (slideIndex * 0.1) : ((this.slides.length - slideIndex - 1) * 0.1);

      gsap.set(slide, { display: 'flex' });

      if (offset === 0) {
        // active slide
        gsap.to(slide, { z: 0, y: 0, opacity: 1, ease: EASE_FUNCTION, duration: 0.7, delay });
      } else {
        // non-active slides
        // offset > 0 ? behind active : in front of active slide
        let z = offset > 0 ? offset * -50 : null;
        let y = offset > 0 ? offset * -25 : offset * -100;
        let opacity = offset > 0 ? (0.7 - (offset * 0.1)) : 0;
        let duration = offset > 0 ? 0.7 : 0.5;

        // slides that animate offscreen
        gsap.to(slide, { z, y, opacity, duration, delay, ease: EASE_FUNCTION,
          onComplete: offset > 0 ? () => {} : () => { gsap.set(slide, { display: 'none' }); }
        });
      }
    });
  }

  updateButtonStates() {
    this.prevBtns.forEach((btn) => {
      let currentStep = +btn.getAttribute(STEP_ATTR_SLIDE);
      if (currentStep === 1) {
        btn.disabled = true;
        btn.style.opacity = 0.5;
      } else {
        btn.disabled = false;
        btn.style.opacity = 1;
      }
    });

    this.nextBtns.forEach((btn) => {
      let currentStep = +btn.getAttribute(STEP_ATTR_SLIDE);
      if (currentStep === this.slides.length) {
        btn.disabled = true;
        btn.style.opacity = 0.5;
      } else {
        btn.disabled = false;
        btn.style.opacity = 1;
      }
    });
  }
}
