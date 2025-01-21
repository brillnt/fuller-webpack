import { select, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';
import './three-d-slider.css';

const COLOR_SERENITY = '#8fb8b9';
const COLOR_LIGHT_GRAY = 'rga(191, 192, 192, 0.502)';
const COLOR_SALMON = '#b9908f';
const COLOR_STARK_WHITE = '#ffffff';
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
        // store last active indicator
        let lastActiveIndicator = this.element.querySelector('.tds-indicators .tds--active');
        let lastActiveStep = +lastActiveIndicator.parentElement.parentElement.getAttribute('data-step-indicator-num');

        // update active indicator
        this.indicators.forEach(ind => ind.querySelector('.tdsi-active').classList.remove('tds--active'));
        indicator.querySelector('.tdsi-active').classList.add('tds--active');

        // get updated list of slides
        let liveSlides = this.element.querySelectorAll('.tds-slides .tds-slide');

        // get new active step number & index
        let newActiveStep = +indicator.getAttribute('data-step-indicator-num');
        let activeSlideIndex = Array.from(liveSlides).findIndex((slide) => newActiveStep === +slide.getAttribute('data-step-num'));

        // animating foward
        liveSlides.forEach((slide, slideIndex) => {
          let indexDiff = Math.abs(slideIndex - activeSlideIndex);
          let indexStep = +slide.getAttribute('data-step-num');

          if (newActiveStep > lastActiveStep) {
            console.log('moving forward...');
            // make active slide front and center
            if (slideIndex === activeSlideIndex) {
              gsap.to(slide, { duration: 1, z: 0, y: 0, ease: 'power4.inOut' });
              return;
            }

            // slides in the front zoom toward the camera, then disappear, and reappear in the back.
            if(slideIndex > activeSlideIndex) {
              let slideWrap = slide.parentElement;

              gsap.to(slide, {
                duration: 1,
                z: 50 * indexDiff,
                y: 100 * indexDiff, 
                opacity: 0,
                ease: 'power4.inOut',
                onComplete: () => {
                  // send slides to back...
                  slideWrap.removeChild(slide);
                  gsap.set(slide, { opacity: 0, y: -25 * slideIndex, z: -50 * slideIndex, borderColor: COLOR_LIGHT_GRAY });
                  console.log(slide);
                  slideWrap.prepend(slide);
                  gsap.to(slide, { duration: 1, opacity: 1, ease: 'power4.inOut' });
                }
              });
              return;
            }

            // slides in the back zoom forward.
            if(slideIndex < activeSlideIndex) {
              gsap.to(slide, {
                duration: 1,
                z: -50 * indexDiff,
                y: -25 * indexDiff, 
                ease: 'power4.inOut'
              });
              return;
            }
          } else /* moving backward */ {
            console.log('moving backward...');

            if (slideIndex === activeSlideIndex) {
              gsap.set(slide, { borderColor: COLOR_STARK_WHITE });
              return;
            }

            if (slideIndex < activeSlideIndex) {
              gsap.set(slide, { borderColor: COLOR_SALMON });
              return;
            }

            if (slideIndex > activeSlideIndex) {
              gsap.set(slide, { borderColor: COLOR_SERENITY })
              console.log('slideIndex', slideIndex, 'indexDiff', indexDiff, 'indexStep', indexStep);
              console.log(`newIndex: ${this.slides.length + activeSlideIndex - indexDiff}`);
              return;
            }
          }
        });
      });
    });
  }

  slideConcealState() {

  }
}