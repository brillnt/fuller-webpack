import { select, selectId } from '../../utils/helpers.js';
import { gsap, SplitType } from '../../utils/animation.js';

export default class TextAnimateLines {
  constructor(elementId, options = {}) {
    this.container = selectId(elementId);
    this.options = {
      types: 'lines',
      scrollTrigger: {
        trigger: this.container,
        start: "top 60%",
        once: true,
        ...options.scrollTrigger
      },
      ...options
    };
    
    // Store all SplitType instances
    this.splitInstances = [];
    
    // Store ScrollTrigger instance
    this.scrollTrigger = null;
    
    // Store all lines in order
    this.allLines = [];
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    
    this.init();
  }

  init() {
    this.setInitialStyles();
    this.splitRevealElements();
    this.createScrollTriggerAnimation();
    window.addEventListener('resize', this.handleResize);
  }

  setInitialStyles() {
    if (!document.querySelector('#text-animate-lines-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'text-animate-lines-styles';
      styleSheet.textContent = `
        .line {
          overflow: hidden;
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }

  splitRevealElements() {
    // Clear previous instances
    this.splitInstances.forEach(instance => instance.revert());
    this.splitInstances = [];
    this.allLines = [];

    // Find all elements with data-reveal="true"
    const revealElements = this.container.querySelectorAll('[data-reveal]');
    
    // Process each reveal element in DOM order
    revealElements.forEach(element => {
      const splitInstance = new SplitType(element, {
        types: this.options.types
      });
      
      this.splitInstances.push(splitInstance);
      
      // Add lines from this instance to our ordered collection
      if (splitInstance.lines) {
        this.allLines.push(...splitInstance.lines);
      }
    });

    // Set initial state for all lines
    gsap.set(this.allLines, {
      yPercent: 100,
      opacity: 0
    });
  }

  createScrollTriggerAnimation() {
    // Kill previous ScrollTrigger if it exists
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        ...this.options.scrollTrigger,
        onEnter: () => {
          if (typeof this.options?.onEnter === 'function') {
            this.options.onEnter();
          }
        },
        onComplete: () => {
          if (typeof this.options?.onComplete === 'function') {
            this.options.onComplete();
          }
        }
      }
    });

    // Animate all lines in sequence
    tl.to(this.allLines, {
      duration: 1,
      yPercent: 0,
      opacity: 1,
      stagger: 0.2,
      ease: "expo.out"
    });

    // Store the ScrollTrigger instance
    this.scrollTrigger = tl.scrollTrigger;
  }

  handleResize() {
    // Kill existing ScrollTrigger
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    // Re-split all text elements
    this.splitRevealElements();
    
    // Create new scroll-triggered animation
    this.createScrollTriggerAnimation();
  }

  replay() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    gsap.set(this.allLines, {
      yPercent: 50,
      opacity: 0
    });

    this.createScrollTriggerAnimation();
  }

  destroy() {
    // Kill ScrollTrigger
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    // Kill any active GSAP animations
    gsap.killTweensOf(this.allLines);
    
    // Revert all split instances
    this.splitInstances.forEach(instance => instance.revert());
    
    // Remove resize listener
    window.removeEventListener('resize', this.handleResize);
    
    // Clear arrays
    this.splitInstances = [];
    this.allLines = [];
    
    // Remove style tag if no other instances exist
    if (document.querySelectorAll('.line').length === 0) {
      const styleTag = document.querySelector('#text-animate-lines-styles');
      if (styleTag) {
        styleTag.remove();
      }
    }
  }
}