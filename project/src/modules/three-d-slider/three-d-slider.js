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
    
    // Track active animations to cancel them when needed
    this.activeAnimations = [];
    this.animationInProgress = false;
    this.pendingAnimationIndex = null;
    
    // Track the current animating slide to prevent duplicate animations
    this.currentlyAnimatingToIndex = null;

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
    
    // Create IntersectionObserver with optimized settings
    this.observer = new IntersectionObserver((entries) => {
      if (this.scrollLocked) return;
      
      // Sort entries by timestamp to process the latest ones first
      // This helps when multiple waypoints trigger at once during fast scrolling
      entries.sort((a, b) => b.time - a.time);
      
      let processedWaypoint = false;
      
      entries.forEach(entry => {
        // Only process the first intersecting entry in a batch to avoid conflicts
        if (entry.isIntersecting && !processedWaypoint) {
          processedWaypoint = true;
          
          const waypointIndex = parseInt(entry.target.dataset.waypointIndex);
          this.log(`Waypoint ${waypointIndex} is intersecting`);
          
          // Check if this is a different waypoint than the one currently animating
          if (waypointIndex !== this.currentScrollIndex && waypointIndex !== this.currentlyAnimatingToIndex) {
            // For fast scrolling, if another animation is in progress, cancel it
            if (this.animationInProgress) {
              this.cancelActiveAnimations();
              this.animationInProgress = false;
            }
            
            this.currentScrollIndex = waypointIndex;
            this.navigateToSlide(waypointIndex);
          } else {
            this.log(`Ignoring waypoint ${waypointIndex} - already current or animating`);
          }
        }
      });
    }, {
      // More responsive settings for fast scrolling
      threshold: 0.2, // Trigger earlier
      rootMargin: '-5% 0px -5% 0px' // Smaller margins for faster detection
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
    if (now - this.lastScrollTime < 50) return; // Reduced throttle to 50ms for more responsive scrolling
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
    
    // Only update if we're moving to a new slide AND not currently animating to this index
    if (targetIndex !== this.currentScrollIndex && 
        !this.scrollLocked && 
        targetIndex !== this.currentlyAnimatingToIndex) {
      
      this.log(`Scroll progress: ${scrollProgress.toFixed(2)}, targeting slide ${targetIndex}`);
      this.currentScrollIndex = targetIndex;
      
      // For rapid scrolling, if we're several slides away, we might want to skip intermediate animations
      if (Math.abs(targetIndex - this.currentScrollIndex) > 2 && this.animationInProgress) {
        this.cancelActiveAnimations();
        this.animationInProgress = false;
        this.currentlyAnimatingToIndex = null;
      }
      
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
    
    // Check if we're already animating to this index to prevent duplicate animations
    if (this.currentlyAnimatingToIndex === index) {
      this.log(`Already animating to slide ${index}, ignoring duplicate request`);
      return;
    }
    
    // If we're currently animating to a different index and a new animation is requested
    if (this.animationInProgress) {
      this.log(`Animation in progress to slide ${this.currentlyAnimatingToIndex}, queueing slide ${index}`);
      this.pendingAnimationIndex = index;
      return;
    }
    
    this.currentlyAnimatingToIndex = index;
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
    
    // Track the request
    const requestedStep = parseInt(indicator.getAttribute(STEP_ATTR_INDICATOR));
    this.log(`Indicator click for step ${requestedStep}, fromScroll: ${fromScroll}`);

    // If this was triggered by a click (not scroll), temporarily lock scroll navigation
    if (!fromScroll) {
      // Kill any ongoing animations first
      this.cancelActiveAnimations();
      
      this.scrollLocked = true;
      this.log('Scroll navigation locked due to click');
      
      // Scroll to appropriate position
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
    // Mark animation as in progress
    this.animationInProgress = true;
    this.log(`Starting animation to slide index ${activeSlideIndex}`);
    
    // Cancel all active animations first
    this.cancelActiveAnimations();
    
    // Store the new animations
    this.activeAnimations = [];
    
    // Determine the max animation duration for completion tracking
    let maxDuration = 0;
    
    liveSlides.forEach((slide, slideIndex) => {
      let offset = slideIndex - activeSlideIndex;
      // Reduce delays for smoother rapid transitions
      let delay = movingForward ? (slideIndex * 0.05) : ((this.slides.length - slideIndex - 1) * 0.05);
      
      // Always ensure slides are visible initially
      gsap.set(slide, { display: 'flex' });

      let animation;
      
      if (offset === 0) {
        // active slide
        animation = gsap.to(slide, { 
          z: 0, 
          y: 0, 
          opacity: 1, 
          ease: EASE_FUNCTION, 
          duration: 0.5, // Slightly faster for smoother transitions
          delay 
        });
        
        maxDuration = Math.max(maxDuration, 0.5 + delay);
      } else {
        // non-active slides
        // offset > 0 ? behind active : in front of active slide
        let z = offset > 0 ? offset * -50 : null;
        let y = offset > 0 ? offset * -25 : offset * -100;
        let opacity = offset > 0 ? (0.7 - (offset * 0.1)) : 0;
        let duration = offset > 0 ? 0.5 : 0.4; // Faster for smoother transitions
        
        // slides that animate offscreen
        animation = gsap.to(slide, { 
          z, 
          y, 
          opacity, 
          duration, 
          delay, 
          ease: EASE_FUNCTION,
          onComplete: offset > 0 ? () => {} : () => { 
            gsap.set(slide, { display: 'none' }); 
          }
        });
        
        maxDuration = Math.max(maxDuration, duration + delay);
      }
      
      // Store the animation for later cancellation if needed
      this.activeAnimations.push(animation);
    });
    
    // Set a timeout to mark animation as complete
    setTimeout(() => {
      this.animationInProgress = false;
      this.currentlyAnimatingToIndex = null; // Clear the animating index
      this.log('Animation sequence complete');
      
      // Process any pending animations that came in while we were animating
      if (this.pendingAnimationIndex !== null) {
        const pendingIndex = this.pendingAnimationIndex;
        this.pendingAnimationIndex = null;
        this.log(`Processing pending animation to slide ${pendingIndex}`);
        this.navigateToSlide(pendingIndex);
      }
    }, maxDuration * 1000 + 50); // Add a small buffer
  }
  
  /**
   * Cancel any currently active animations
   */
  cancelActiveAnimations() {
    if (this.activeAnimations.length > 0) {
      this.log(`Cancelling ${this.activeAnimations.length} active animations`);
      this.activeAnimations.forEach(animation => {
        if (animation && animation.kill) {
          animation.kill();
        }
      });
      this.activeAnimations = [];
    }
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
