import { selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';
import Base from '../base/base.js';

import './three-d-slider.css';

const EASE_FUNCTION = 'expo.out';
const STEP_ATTR_INDICATOR = 'data-step-indicator-num';
const STEP_ATTR_SLIDE = 'data-step-num';

export default class ThreeDSlider extends Base {
  constructor(elementId, debug = false) {
    super(debug);

    if (!elementId) return;

    this.log(`instantiated with ${elementId}`);

    this.element = selectId(elementId);
    this.indicators = this.element.querySelectorAll('.tds-indicators .tds-indicator');
    this.slides = this.element.querySelectorAll('.tds-slides .tds-slide');

    if (this.slides && this.slides.length !== 0) {
      this.slides = Array.from(this.slides).reverse();
    }

    this.prevBtns = this.element.querySelectorAll('.tdss__nav-btn.tdss__nav-btn--prev');
    this.nextBtns = this.element.querySelectorAll('.tdss__nav-btn.tdss__nav-btn--next');

    // Initialize scroll-based navigation properties
    this.scrollEnabled = true;
    this.currentScrollIndex = 0;
    this.scrollLocked = false;
    this.scrollLockDuration = 1000; // 1 second lock after click navigation

    this.init();
  }

  init() {
    this.addListeners();
    this.setupScrollNavigation();
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

  /**
   * Set up scroll-based navigation using IntersectionObserver
   */
  setupScrollNavigation() {
    this.log('Setting up scroll navigation');
    
    // Find the waypoints
    const section = this.element.closest('.how-it-works-section');
    if (!section) {
      this.log('Could not find parent section');
      return;
    }
    
    this.waypoints = section.querySelectorAll('.slide-waypoint');
    
    if (!this.waypoints || this.waypoints.length === 0) {
      this.log('No waypoints found');
      return;
    }
    
    this.log(`Found ${this.waypoints.length} waypoints`);
    
    // Create IntersectionObserver
    this.observer = new IntersectionObserver((entries) => {
      if (this.scrollLocked) return;
      
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const waypointIndex = parseInt(entry.target.dataset.waypointIndex);
          this.log(`Waypoint ${waypointIndex} is intersecting`);
          
          if (waypointIndex !== this.currentScrollIndex) {
            this.currentScrollIndex = waypointIndex;
            this.navigateToSlide(waypointIndex);
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-10% 0px -10% 0px'
    });
    
    // Observe all waypoints
    this.waypoints.forEach(waypoint => {
      this.observer.observe(waypoint);
      this.log(`Observing waypoint ${waypoint.dataset.waypointIndex}`);
    });
    
    // Add throttled scroll handler for smoother transitions between waypoints
    this.lastScrollTime = Date.now();
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }
  
  /**
   * Throttled scroll handler for smooth progress between waypoints
   */
  handleScroll() {
    if (this.scrollLocked) return;
    
    const now = Date.now();
    if (now - this.lastScrollTime < 100) return; // 100ms throttle
    this.lastScrollTime = now;
    
    // Calculate scroll progress within section
    const section = this.element.closest('.how-it-works-section');
    if (!section) return;
    
    const sectionRect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate how far we've scrolled into the section
    // (sectionRect.top will be negative as we scroll down)
    const scrollProgress = -sectionRect.top / (sectionRect.height - viewportHeight);
    
    if (scrollProgress < 0 || scrollProgress > 1) return;
    
    // Map progress to slide index
    const targetIndex = Math.min(
      Math.floor(scrollProgress * this.indicators.length),
      this.indicators.length - 1
    );
    
    // Only update if we're moving to a new slide
    if (targetIndex !== this.currentScrollIndex && !this.scrollLocked) {
      this.log(`Scroll progress: ${scrollProgress.toFixed(2)}, targeting slide ${targetIndex}`);
      this.currentScrollIndex = targetIndex;
      this.navigateToSlide(targetIndex);
    }
  }
  
  /**
   * Navigate to a specific slide by index
   * @param {number} index - The zero-based index of the slide to navigate to
   */
  navigateToSlide(index) {
    if (index < 0 || index >= this.indicators.length) {
      this.log(`Invalid slide index: ${index}`);
      return;
    }
    
    const indicator = this.indicators[index];
    this.handleIndicatorClick(indicator, true);
  }

  /**
   * Handle click on an indicator
   * @param {HTMLElement} indicator - The clicked indicator
   * @param {boolean} fromScroll - Whether this was triggered by scroll (true) or click (false)
   */
  handleIndicatorClick(indicator, fromScroll = false) {
    let isActive = indicator.querySelector('.tdsi-active').classList.contains('tds--active');
    if (isActive) return;

    // If this was triggered by a click (not scroll), temporarily lock scroll navigation
    if (!fromScroll) {
      this.scrollLocked = true;
      this.log('Scroll navigation locked due to click');
      
      // Optionally: Scroll to appropriate position
      const newStep = parseInt(indicator.getAttribute(STEP_ATTR_INDICATOR));
      const section = this.element.closest('.how-it-works-section');
      
      if (section) {
        const sectionRect = section.getBoundingClientRect();
        const sectionHeight = sectionRect.height;
        const sectionTop = window.scrollY + sectionRect.top;
        const slidePercentage = (newStep - 1) / (this.indicators.length - 1);
        const targetScrollPosition = sectionTop + (slidePercentage * (sectionHeight - window.innerHeight));
        
        window.scrollTo({
          top: targetScrollPosition,
          behavior: 'smooth'
        });
      }
      
      // Unlock scroll navigation after animation completes
      setTimeout(() => {
        this.scrollLocked = false;
        this.currentScrollIndex = parseInt(indicator.getAttribute(STEP_ATTR_INDICATOR)) - 1;
        this.log('Scroll navigation unlocked');
      }, this.scrollLockDuration);
    }

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
