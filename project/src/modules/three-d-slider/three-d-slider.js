import { selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';
import Base from '../base/base.js';

import './three-d-slider.css';

// Class selectors
const SELECTORS = {
  INDICATORS_CONTAINER: '.tds-indicators',
  INDICATOR: '.tds-indicator',
  INDICATOR_ACTIVE: '.tdsi-active',
  ACTIVE_STATE: 'tds--active',
  BACK_STATE: 'tds--back',
  FORWARD_STATE: 'tds--forward',
  SLIDES_CONTAINER: '.tds-slides',
  SLIDE: '.tds-slide',
  NAV_BTN: '.tdss__nav-btn',
  NAV_BTN_PREV: '.tdss__nav-btn--prev',
  NAV_BTN_NEXT: '.tdss__nav-btn--next',
  SECTION_CONTAINER: '.how-it-works-section',
  WAYPOINT: '.slide-waypoint'
};

// Data attributes
const DATA_ATTRS = {
  STEP_INDICATOR: 'data-step-indicator-num',
  STEP_SLIDE: 'data-step-num',
  WAYPOINT_INDEX: 'data-waypoint-index'
};

// Animation and timing configuration
const CONFIG = {
  // Animation settings
  EASE_FUNCTION: 'expo.out',
  ACTIVE_SLIDE_DURATION: 0.5,
  INACTIVE_SLIDE_DURATION_BEHIND: 0.5, // Slides behind active
  INACTIVE_SLIDE_DURATION_FRONT: 0.4,  // Slides in front
  DELAY_MULTIPLIER: 0.05,
  
  // 3D effect settings
  Z_OFFSET_PER_SLIDE: -50,
  Y_OFFSET_BEHIND: -25,
  Y_OFFSET_FRONT: -100,
  OPACITY_BASE: 0.7,
  OPACITY_DECREMENT: 0.1,
  
  // Scroll settings
  SCROLL_THROTTLE: 100, // ms
  ANIMATION_COOLDOWN: 600, // ms
  WAYPOINT_COOLDOWN: 800, // ms
  SCROLL_HYSTERESIS: 0.2, // 20% threshold for backward movement
  
  // IntersectionObserver settings
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_ROOT_MARGIN: '-20% 0px -80% 0px', // Trigger at top 20% of viewport
  
  // Click handling
  CLICK_LOCK_DURATION: 1000 // ms
};

export default class ThreeDSlider extends Base {
  constructor(elementId, debug = false, customConfig = {}) {
    super(debug);

    if (!elementId) return;

    this.log(`instantiated with ${elementId}`);

    // Merge custom configuration if provided
    this.config = { ...CONFIG, ...customConfig };

    this.element = selectId(elementId);
    this.indicators = this.element.querySelectorAll(`${SELECTORS.INDICATORS_CONTAINER} ${SELECTORS.INDICATOR}`);
    this.slides = this.element.querySelectorAll(`${SELECTORS.SLIDES_CONTAINER} ${SELECTORS.SLIDE}`);

    if (this.slides && this.slides.length !== 0) {
      this.slides = Array.from(this.slides).reverse();
    }

    this.prevBtns = this.element.querySelectorAll(`${SELECTORS.NAV_BTN}${SELECTORS.NAV_BTN_PREV}`);
    this.nextBtns = this.element.querySelectorAll(`${SELECTORS.NAV_BTN}${SELECTORS.NAV_BTN_NEXT}`);

    // Initialize scroll-based navigation properties
    this.scrollEnabled = true;
    this.currentScrollIndex = 0;
    this.scrollLocked = false;
    
    // Track active animations to cancel them when needed
    this.activeAnimations = [];
    this.animationInProgress = false;
    this.pendingAnimationIndex = null;
    
    // Track the current animating slide to prevent duplicate animations
    this.currentlyAnimatingToIndex = null;
    
    // Flag to disable scroll handling during animation
    this.scrollHandlerDisabled = false;
    
    // Direction of navigation - helps prevent bounce-back
    this.lastNavigationDirection = null; // 'forward' or 'backward'
    
    // Record last waypoint timestamp to prevent immediate scroll handler override
    this.lastWaypointTime = 0;
    
    // Record animation completion time for bounce-back prevention
    this.lastAnimationCompleteTime = 0;
    this.lastCompletedSlideIndex = undefined;
    
    // Debug flag - can be set to true to show more visual debugging
    this.debugVisuals = false;

    this.init();
  }

  init() {
    this.addListeners();
    this.setupScrollNavigation();
  }

  addListeners() {
    this.indicators.forEach((indicator, index) => {
      // set active indicator
      let activeIndicator = indicator.querySelector(SELECTORS.INDICATOR_ACTIVE);
      activeIndicator.classList.add(index === 0 ? SELECTORS.ACTIVE_STATE : SELECTORS.BACK_STATE);

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
    const section = this.element.closest(SELECTORS.SECTION_CONTAINER);
    if (!section) {
      this.log('Could not find parent section');
      return;
    }
    
    this.waypoints = section.querySelectorAll(SELECTORS.WAYPOINT);
    
    if (!this.waypoints || this.waypoints.length === 0) {
      this.log('No waypoints found');
      return;
    }
    
    this.log(`Found ${this.waypoints.length} waypoints`);
    
    // DEBUGGING: Log the exact position of each waypoint
    this.waypoints.forEach((waypoint, index) => {
      const rect = waypoint.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const relativeTop = rect.top - sectionRect.top;
      const percentageInSection = (relativeTop / sectionRect.height) * 100;
      
      this.log(`Waypoint ${index} position: ${percentageInSection.toFixed(2)}% from section top, 
               rect: top=${rect.top}, bottom=${rect.bottom}, height=${rect.height}`);
      
      // Check waypoint CSS positioning
      const computedStyle = window.getComputedStyle(waypoint);
      this.log(`Waypoint ${index} CSS: position=${computedStyle.position}, 
               top=${computedStyle.top}, left=${computedStyle.left}`);
    });
    
    // Add visual debugging markers if enabled
    if (this.debugVisuals) {
      this.waypoints.forEach((waypoint) => {
        waypoint.style.height = '10px';
        waypoint.style.background = 'red';
        waypoint.style.opacity = '0.5';
        waypoint.style.pointerEvents = 'none';
        waypoint.style.zIndex = '9999';
      });
    }
    
    // Create IntersectionObserver with settings to trigger at top portion of viewport
    const observerSettings = {
      threshold: this.config.INTERSECTION_THRESHOLD,
      rootMargin: this.config.INTERSECTION_ROOT_MARGIN
    };
    
    this.log(`Creating IntersectionObserver with settings:
              threshold: ${observerSettings.threshold}
              rootMargin: ${observerSettings.rootMargin}`);
    
    this.observer = new IntersectionObserver((entries) => {
      if (this.scrollLocked || this.scrollHandlerDisabled) {
        this.log(`IntersectionObserver triggered but handler disabled`);
        return;
      }
      
      // Sort entries by timestamp to process the latest ones first
      entries.sort((a, b) => b.time - a.time);
      
      // Log all entries for debugging
      entries.forEach(entry => {
        const waypointIndex = parseInt(entry.target.dataset[DATA_ATTRS.WAYPOINT_INDEX.replace('data-', '')]);
        const ratio = entry.intersectionRatio;
        const rect = entry.boundingClientRect;
        const rootRect = entry.rootBounds;
        
        this.log(`IntersectionObserver entry: 
                 waypoint=${waypointIndex}, 
                 isIntersecting=${entry.isIntersecting}, 
                 ratio=${ratio.toFixed(2)},
                 rect: top=${rect.top}, bottom=${rect.bottom},
                 rootRect: top=${rootRect.top}, bottom=${rootRect.bottom},
                 viewport position: ${((rect.top / window.innerHeight) * 100).toFixed(2)}% from top of viewport`);
      });
      
      let processedWaypoint = false;
      
      entries.forEach(entry => {
        // Only process entries that are intersecting
        if (entry.isIntersecting && !processedWaypoint) {
          processedWaypoint = true;
          
          const waypointIndex = parseInt(entry.target.dataset[DATA_ATTRS.WAYPOINT_INDEX.replace('data-', '')]);
          const viewportPosition = ((entry.boundingClientRect.top / window.innerHeight) * 100).toFixed(2);
          
          this.log(`Waypoint ${waypointIndex} triggered at ${viewportPosition}% from viewport top`);
          
          // Check if this is a different waypoint than the one currently animating
          if (waypointIndex !== this.currentScrollIndex && waypointIndex !== this.currentlyAnimatingToIndex) {
            // If previous animation is in progress, cancel it
            if (this.animationInProgress) {
              this.cancelActiveAnimations();
              this.animationInProgress = false;
              this.currentlyAnimatingToIndex = null;
            }
            
            // Update current index and prevent bounce-back
            this.currentScrollIndex = waypointIndex;
            this.lastWaypointTime = Date.now();
            
            // IMPORTANT: Log the current scroll position for comparison
            const section = this.element.closest(SELECTORS.SECTION_CONTAINER);
            if (section) {
              const sectionRect = section.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              const scrollProgress = Math.max(0, Math.min(1, -sectionRect.top / (sectionRect.height - viewportHeight)));
              this.log(`At waypoint trigger, scroll progress = ${scrollProgress.toFixed(4)}`);
            }
            
            this.navigateToSlide(waypointIndex);
          } else {
            this.log(`Ignoring waypoint ${waypointIndex} - already current or animating`);
          }
        }
      });
    }, observerSettings);
    
    // Observe all waypoints
    this.waypoints.forEach(waypoint => {
      this.observer.observe(waypoint);
      this.log(`Observing waypoint ${waypoint.dataset[DATA_ATTRS.WAYPOINT_INDEX.replace('data-', '')]}`);
    });
    
    // Add throttled scroll handler for smoother transitions between waypoints
    this.lastScrollTime = Date.now();
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  /**
   * Throttled scroll handler for smooth progress between waypoints
   */
  handleScroll() {
    // Skip if locked or animation in progress
    if (this.scrollLocked || this.scrollHandlerDisabled) return;
    
    // Apply throttling
    const now = Date.now();
    if (now - this.lastScrollTime < this.config.SCROLL_THROTTLE) return;
    this.lastScrollTime = now;
    
    // Calculate scroll progress within section
    const section = this.element.closest(SELECTORS.SECTION_CONTAINER);
    if (!section) return;
    
    const sectionRect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate how far we've scrolled into the section
    const scrollProgress = Math.max(0, Math.min(1, -sectionRect.top / (sectionRect.height - viewportHeight)));
    
    // DEBUGGING: Log more detailed scroll information
    this.log(`Scroll handler:
             section rect: top=${sectionRect.top}, bottom=${sectionRect.bottom}, height=${sectionRect.height}
             viewport height: ${viewportHeight}
             raw progress: ${(-sectionRect.top / (sectionRect.height - viewportHeight)).toFixed(4)}
             clamped progress: ${scrollProgress.toFixed(4)}
             viewport %: ${((Math.abs(sectionRect.top) / viewportHeight) * 100).toFixed(2)}% scrolled into section`);
    
    // Check if last animation just completed (happens when animation completes and scroll handling re-enables)
    const timeSinceAnimationComplete = now - (this.lastAnimationCompleteTime || 0);
    if (timeSinceAnimationComplete < this.config.WAYPOINT_COOLDOWN) {
      this.log(`Recent animation completed ${timeSinceAnimationComplete}ms ago, 
               at index ${this.currentScrollIndex}, current progress: ${scrollProgress.toFixed(4)}`);
      
      // If we just completed an animation and scroll progress is close to a waypoint,
      // don't immediately override it with a different slide
      if (this.lastCompletedSlideIndex !== undefined) {
        // Calculate what the "expected" scroll progress should be for this slide
        const expectedProgress = this.lastCompletedSlideIndex / (this.indicators.length - 1);
        const progressDifference = Math.abs(scrollProgress - expectedProgress);
        
        this.log(`Progress difference: ${progressDifference.toFixed(4)}, 
                 expected: ${expectedProgress.toFixed(4)}, 
                 actual: ${scrollProgress.toFixed(4)}`);
        
        // If we're reasonably close to where we should be, don't override
        if (progressDifference < 0.2) {
          this.log(`Skipping scroll handler shortly after animation - progress is close enough`);
          return;
        }
      }
    }
    
    // Map progress to slide index
    const numSlides = this.indicators.length;
    const targetIndex = Math.min(Math.floor(scrollProgress * numSlides), numSlides - 1);
    
    // Add hysteresis for backward movement to prevent bounce-back
    if (targetIndex < this.currentScrollIndex) {
      const hysteresisThreshold = this.config.SCROLL_HYSTERESIS;
      const requiredProgress = (targetIndex / numSlides) + hysteresisThreshold;
      
      if (scrollProgress > requiredProgress) {
        this.log(`Ignoring small backward movement: ${scrollProgress.toFixed(4)} > ${requiredProgress.toFixed(4)}`);
        return;
      }
    }
    
    // Log current position for debugging
    this.log(`Scroll progress: ${scrollProgress.toFixed(4)}, mapped to slide ${targetIndex}, current slide: ${this.currentScrollIndex}`);
    
    // Only update if we're moving to a new slide AND not currently animating to this index
    if (targetIndex !== this.currentScrollIndex && 
        targetIndex !== this.currentlyAnimatingToIndex) {
      
      this.log(`Scroll handler triggering slide ${targetIndex} from ${this.currentScrollIndex}`);
      
      // Check time since last waypoint trigger
      const timeSinceWaypoint = now - (this.lastWaypointTime || 0);
      this.log(`Time since last waypoint: ${timeSinceWaypoint}ms`);
      
      // If a waypoint was recently triggered, don't override it
      if (timeSinceWaypoint < this.config.WAYPOINT_COOLDOWN) {
        this.log(`Skipping scroll handler - waypoint was triggered recently (${timeSinceWaypoint}ms ago)`);
        return;
      }
      
      if (this.animationInProgress) {
        this.cancelActiveAnimations();
        this.animationInProgress = false;
        this.currentlyAnimatingToIndex = null;
      }
      
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
    
    // Check if we're already animating to this index to prevent duplicate animations
    if (this.currentlyAnimatingToIndex === index) {
      this.log(`Already animating to slide ${index}, ignoring duplicate request`);
      return;
    }
    
    // Determine direction of navigation
    const direction = index > this.currentScrollIndex ? 'forward' : 'backward';
    
    // If we're currently animating to a different index and a new animation is requested
    if (this.animationInProgress) {
      // If we changed direction while animating, ignore the request to prevent bounce-back
      if (this.lastNavigationDirection && direction !== this.lastNavigationDirection) {
        this.log(`Ignoring ${direction} navigation during ${this.lastNavigationDirection} animation`);
        return;
      }
      
      this.log(`Animation in progress to slide ${this.currentlyAnimatingToIndex}, queueing slide ${index}`);
      this.pendingAnimationIndex = index;
      return;
    }
    
    this.lastNavigationDirection = direction;
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
    let isActive = indicator.querySelector(SELECTORS.INDICATOR_ACTIVE).classList.contains(SELECTORS.ACTIVE_STATE);
    if (isActive) return;
    
    // Track the request
    const requestedStep = parseInt(indicator.getAttribute(DATA_ATTRS.STEP_INDICATOR));
    this.log(`Indicator click for step ${requestedStep}, fromScroll: ${fromScroll}`);

    // If this was triggered by a click (not scroll), temporarily lock scroll navigation
    if (!fromScroll) {
      // Kill any ongoing animations first
      this.cancelActiveAnimations();
      
      this.scrollLocked = true;
      this.log('Scroll navigation locked due to click');
      
      // Scroll to appropriate position
      const newStep = parseInt(indicator.getAttribute(DATA_ATTRS.STEP_INDICATOR));
      const section = this.element.closest(SELECTORS.SECTION_CONTAINER);
      
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
        this.currentScrollIndex = parseInt(indicator.getAttribute(DATA_ATTRS.STEP_INDICATOR)) - 1;
        this.log('Scroll navigation unlocked');
      }, this.config.CLICK_LOCK_DURATION);
    }

    // store last active indicator
    let prevActiveIndicator = this.element.querySelector(`${SELECTORS.INDICATORS_CONTAINER} .${SELECTORS.ACTIVE_STATE}`);
    let prevActiveStep = +prevActiveIndicator.parentElement.parentElement.getAttribute(DATA_ATTRS.STEP_INDICATOR);

    // update active indicator
    this.indicators.forEach(ind => ind.querySelector(SELECTORS.INDICATOR_ACTIVE).classList.remove(SELECTORS.ACTIVE_STATE));
    let currentActiveIndicator = indicator.querySelector(SELECTORS.INDICATOR_ACTIVE);
    currentActiveIndicator.classList.remove(SELECTORS.BACK_STATE);
    currentActiveIndicator.classList.remove(SELECTORS.FORWARD_STATE);
    currentActiveIndicator.classList.add(SELECTORS.ACTIVE_STATE);

    // get updated list of slides
    let liveSlides = this.element.querySelectorAll(`${SELECTORS.SLIDES_CONTAINER} ${SELECTORS.SLIDE}`);
    liveSlides = Array.from(liveSlides).reverse();

    // get new active step number & index
    let newActiveStep = +indicator.getAttribute(DATA_ATTRS.STEP_INDICATOR);
    let activeSlideIndex = Array.from(liveSlides).findIndex((slide) => newActiveStep === +slide.getAttribute(DATA_ATTRS.STEP_SLIDE));
    let movingForward = newActiveStep > prevActiveStep;

    if (movingForward) {
      prevActiveIndicator.classList.add(SELECTORS.FORWARD_STATE);
    } else {
      prevActiveIndicator.classList.add(SELECTORS.BACK_STATE);
    }

    // animate all slides
    this.animateSlides(liveSlides, activeSlideIndex, movingForward);
    this.updateButtonStates();
  }

  handlePrevClick(btn) {
    let currentStep = +btn.getAttribute(DATA_ATTRS.STEP_SLIDE);
    let prevStep = currentStep - 1;

    if (prevStep < 1) return;

    let prevIndicator = this.indicators[prevStep - 1];
    this.handleIndicatorClick(prevIndicator);
  }

  handleNextClick(btn) {
    let currentStep = +btn.getAttribute(DATA_ATTRS.STEP_SLIDE);
    let nextStep = currentStep + 1;

    if (nextStep > this.slides.length) return;

    let nextIndicator = this.indicators[nextStep - 1];
    this.handleIndicatorClick(nextIndicator);
  }

  animateSlides(liveSlides, activeSlideIndex, movingForward) {
    // Mark animation as in progress
    this.animationInProgress = true;
    
    // Disable scroll handling during animation to prevent bounce-back
    this.scrollHandlerDisabled = true;
    
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
      let delay = movingForward 
        ? (slideIndex * this.config.DELAY_MULTIPLIER) 
        : ((this.slides.length - slideIndex - 1) * this.config.DELAY_MULTIPLIER);
      
      // Always ensure slides are visible initially
      gsap.set(slide, { display: 'flex' });

      let animation;
      
      if (offset === 0) {
        // active slide
        animation = gsap.to(slide, { 
          z: 0, 
          y: 0, 
          opacity: 1, 
          ease: this.config.EASE_FUNCTION, 
          duration: this.config.ACTIVE_SLIDE_DURATION, 
          delay 
        });
        
        maxDuration = Math.max(maxDuration, this.config.ACTIVE_SLIDE_DURATION + delay);
      } else {
        // non-active slides
        // offset > 0 ? behind active : in front of active slide
        let z = offset > 0 ? offset * this.config.Z_OFFSET_PER_SLIDE : null;
        let y = offset > 0 ? offset * this.config.Y_OFFSET_BEHIND : this.config.Y_OFFSET_FRONT;
        let opacity = offset > 0 ? (this.config.OPACITY_BASE - (offset * this.config.OPACITY_DECREMENT)) : 0;
        let duration = offset > 0 
          ? this.config.INACTIVE_SLIDE_DURATION_BEHIND
          : this.config.INACTIVE_SLIDE_DURATION_FRONT;
        
        // slides that animate offscreen
        animation = gsap.to(slide, { 
          z, 
          y, 
          opacity, 
          duration, 
          delay, 
          ease: this.config.EASE_FUNCTION,
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
      
      // Store the current scroll position when animation completes
      const section = this.element.closest(SELECTORS.SECTION_CONTAINER);
      
      // Initialize these variables outside the conditional block
      let scrollProgress = 0;
      let currentScrollPosition = 0;
      const currentSlide = activeSlideIndex;
      
      if (section) {
        const sectionRect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        currentScrollPosition = sectionRect.top;
        
        // Log the scroll position at animation completion
        scrollProgress = Math.max(0, Math.min(1, -sectionRect.top / (sectionRect.height - viewportHeight)));
        
        this.log(`Animation complete: slide ${currentSlide}, scroll position ${currentScrollPosition}, 
               scroll progress ${scrollProgress.toFixed(4)}`);
      }
      
      // Record animation completion time and slide index for bounce-back prevention
      this.lastAnimationCompleteTime = Date.now();
      this.lastCompletedSlideIndex = currentSlide;
      
      this.log('Animation sequence complete');
      
      // Add a longer delay before re-enabling scroll handling
      // This prevents scroll measurements from happening during animation settling
      setTimeout(() => {
        // Get current scroll position
        const newScrollPosition = section ? section.getBoundingClientRect().top : 0;
        const scrollDelta = Math.abs(newScrollPosition - currentScrollPosition);
        
        // Set important time marker for bounce-back prevention
        this.lastWaypointTime = Date.now();
        
        // Re-enable scroll handling
        this.scrollHandlerDisabled = false;
        
        this.log(`Scroll handling re-enabled after animation, scroll delta: ${scrollDelta}px`);
      }, this.config.ANIMATION_COOLDOWN); // Delay to ensure stability
      
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
      let currentStep = +btn.getAttribute(DATA_ATTRS.STEP_SLIDE);
      if (currentStep === 1) {
        btn.disabled = true;
        btn.style.opacity = 0.5;
      } else {
        btn.disabled = false;
        btn.style.opacity = 1;
      }
    });

    this.nextBtns.forEach((btn) => {
      let currentStep = +btn.getAttribute(DATA_ATTRS.STEP_SLIDE);
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
