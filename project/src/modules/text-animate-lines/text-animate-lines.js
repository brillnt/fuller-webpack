import { selectId } from '../../utils/helpers.js';
import { gsap, SplitType } from '../../utils/animation.js';

const TEXT_REVEAL_SELECTOR = '[data-reveal]';

export default class TextAnimateLines {
  constructor(elementId, options = {}) {
    // console.log(`TextAnimateLines called with elementId: ${elementId}`);
    this.elementId = elementId;
    this.container = selectId(elementId);
    this.options = {
      types: 'lines',
      scrollTrigger: {
        trigger: this.container,
        start: "top 60%",
        once: true,
        ...options.scrollTrigger
      },
      gsap : { ease: 'power4.out' },
      handleResizeOnMobile: true,
      ...options
    };
    
    this.splitInstances = [];
    this.scrollTrigger = null;
    this.allLinesCopy = [];
    
    this.handleResize = this.handleResize.bind(this);
    
    this.init();
  }

  init() {
    this.setInitialStyles();
    this.splitRevealElements();
    this.createScrollTriggerAnimation();

    if (this.options.handleResizeOnMobile && window.innerWidth < 768) {
      window.addEventListener('resize', this.handleResize);
    } else {
      window.addEventListener('resize', this.handleResize);
    }
  }

  setInitialStyles() {
    if (!document.querySelector('#text-animate-lines-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'text-animate-lines-styles';
      styleSheet.textContent = `
        .line {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          overflow: hidden;
        }
        .line__copy {
          transform: translateY(100%);
        }
        .line__copy span {
          display: inline;
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }

  wrapLineContents() {
    this.allLinesCopy = [];
    
    this.splitInstances.forEach((instance) => {
      if (instance.lines) {
        instance.lines.forEach((line, lineIndex) => {
          // fix trailing periods...
          if (line.textContent.trim() === '.' && lineIndex > 0) {
            const previousCopyWrapper = this.allLinesCopy[this.allLinesCopy.length - 1];
            if (previousCopyWrapper) {
              const span = document.createElement('span');
              span.textContent = '.';
              previousCopyWrapper.appendChild(span);

              // hide original line
              line.style = 'display: none;';
            }
          } else {
            // Create wrapper for line content
            const copyWrapper = document.createElement('div');
            copyWrapper.className = 'line__copy';

            // Move line's content into wrapper
            while (line.firstChild) {
              line.firstChild.style = '';
              copyWrapper.appendChild(line.firstChild);
            }
            
            // Add wrapper back to line
            line.appendChild(copyWrapper);
            
            // Store reference to copy wrapper
            this.allLinesCopy.push(copyWrapper);
          }
        });
      }
    });
  }

  splitRevealElements() {
    // Clear previous instances
    this.splitInstances.forEach(instance => instance.revert());
    this.splitInstances = [];
    this.allLinesCopy = [];

    // [data-reveal] elements
    const revealElements = this.container.querySelectorAll(TEXT_REVEAL_SELECTOR);
    
    revealElements.forEach(element => {
      const splitInstance = new SplitType(element, {
        types: this.options.types
      });
      
      this.splitInstances.push(splitInstance);
    });

    this.wrapLineContents();
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
          // console.log('onEnter', this.elementId);
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

    // Animate all line contents in sequence
    // console.log(this.allLinesCopy);
    tl.to(this.allLinesCopy, {
      duration: 1.2,
      y: 0,
      stagger: 0.1,
      ease: "expo.out",
      ...this.options.gsap
    });

    // Store the ScrollTrigger instance
    this.scrollTrigger = tl.scrollTrigger;
  }

  handleResize() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    this.splitRevealElements();
    this.createScrollTriggerAnimation();
  }

  replay() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    gsap.set(this.allLinesCopy, {
      yPercent: 100
    });

    this.createScrollTriggerAnimation();
  }

  destroy() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }

    gsap.killTweensOf(this.allLinesCopy);
    
    this.splitInstances.forEach(instance => instance.revert());
    
    window.removeEventListener('resize', this.handleResize);
    
    this.splitInstances = [];
    this.allLinesCopy = [];
    
    if (document.querySelectorAll('.line').length === 0) {
      const styleTag = document.querySelector('#text-animate-lines-styles');
      if (styleTag) {
        styleTag.remove();
      }
    }
  }
}