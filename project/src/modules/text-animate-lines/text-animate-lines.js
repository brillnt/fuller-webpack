import { selectId, select, selectAll } from '../../utils/helpers.js';
import { gsap, SplitType } from '../../utils/animation.js';
import Base from '../base/base.js';

const TEXT_REVEAL_SELECTOR = '[data-reveal]';

export default class TextAnimateLines extends Base {
  constructor(selector, options = {}, debug = false) {
    super(debug);
    this.selector = selector;
    
    // Determine if the selector is an ID or a CSS selector
    if (typeof selector === 'string' && !selector.match(/[.#\[\]]/)) {
      // If it doesn't contain ., #, [, or ], assume it's an ID
      const element = selectId(selector);
      if (!element) {
        this.log(`Element with ID ${selector} not found.`);
        return;
      }
      this.containers = [element];
    } else {
      // Otherwise, assume it's a CSS selector
      this.containers = Array.from(selectAll(selector) || []);
      
      if (this.containers.length === 0) {
        this.log(`No elements found with selector "${selector}".`);
        return;
      }
    }

    this.options = {
      types: 'lines',
      scrollTrigger: {
        start: "top 60%",
        once: true,
        ...(options.scrollTrigger || {})
      },
      gsap : { ease: 'power4.out' },
      handleResizeOnMobile: false,
      ...options
    };
    
    this.splitInstances = [];
    this.scrollTriggers = [];
    this.allLinesCopy = [];
    
    this.handleResize = this.handleResize.bind(this);
    
    this.init();
  }

  init() {
    this.setInitialStyles();
    this.splitRevealElements();
    this.createScrollTriggerAnimation();

    if (
      (window.innerWidth < 768 && this.options.handleResizeOnMobile) || 
      (window.innerWidth >= 768)
    ) {
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
          will-change: transform;
        }
        .line__copy span {
          display: inline;
        }
      `;
      document.head.appendChild(styleSheet);
      this.log('Added text-animate-lines styles to document head');
    } else {
      this.log('text-animate-lines styles already exist');
    }
  }

  wrapLineContents() {
    this.allLinesCopy = [];
    
    this.log(`Wrapping line contents for ${this.splitInstances.length} split instances`);
    
    // Count lines that have already been processed to avoid duplicates
    const processedLines = new Set();
    
    this.splitInstances.forEach((instance, instanceIndex) => {
      if (instance.lines && instance.lines.length > 0) {
        this.log(`Instance ${instanceIndex} has ${instance.lines.length} lines`);
        
        instance.lines.forEach((line, lineIndex) => {
          // Skip if this line has already been processed
          if (processedLines.has(line)) {
            this.log(`Skipping already processed line at index ${lineIndex}`);
            return;
          }
          
          // Mark this line as processed
          processedLines.add(line);
          
          // Check if line is a DOM element and has a valid parent
          if (!line || !line.parentNode) {
            this.log(`Invalid line at index ${lineIndex} - skipping`);
            return;
          }
          
          // fix trailing periods...
          if (line.textContent.trim() === '.' && lineIndex > 0) {
            const previousCopyWrapper = this.allLinesCopy[this.allLinesCopy.length - 1];
            if (previousCopyWrapper) {
              const span = document.createElement('span');
              span.textContent = '.';
              previousCopyWrapper.appendChild(span);

              // hide original line
              line.style.display = 'none';
            }
          } else {
            // Verify line has content to wrap
            if (!line.firstChild) {
              this.log(`Line at index ${lineIndex} has no content to wrap - skipping`);
              return;
            }
            
            // Create wrapper for line content
            const copyWrapper = document.createElement('div');
            copyWrapper.className = 'line__copy';

            // Move line's content into wrapper
            while (line.firstChild) {
              if (line.firstChild.style) {
                line.firstChild.style = '';
              }
              copyWrapper.appendChild(line.firstChild);
            }
            
            // Add wrapper back to line
            line.appendChild(copyWrapper);
            
            // Ensure initial transform is applied directly
            copyWrapper.style.transform = 'translateY(100%)';
            
            // Store reference to copy wrapper
            this.allLinesCopy.push(copyWrapper);
          }
        });
      } else {
        this.log(`WARNING: Instance ${instanceIndex} has no lines`);
      }
    });
    
    this.log(`Created ${this.allLinesCopy.length} line copy wrappers in total`);
  }

  splitRevealElements() {
    // Clear previous instances
    this.splitInstances.forEach(instance => instance.revert());
    this.splitInstances = [];
    this.allLinesCopy = [];

    this.log(`Splitting text in ${this.containers.length} containers`);
    
    // Direct DOM check - what do we actually have to start with?
    this.containers.forEach((container, containerIndex) => {
      this.log(`Container ${containerIndex} HTML structure before splitting:`, container.innerHTML.substring(0, 100) + '...');
      
      // Check what reveal elements we're finding
      const revealElements = container.querySelectorAll(TEXT_REVEAL_SELECTOR);
      this.log(`Container ${containerIndex} found ${revealElements.length} [data-reveal] elements`);
      
      // Log each reveal element
      revealElements.forEach((el, i) => {
        this.log(`Reveal element ${i} text: "${el.textContent.substring(0, 50)}..."`);
      });
    });
    
    // Process each container
    this.containers.forEach((container, containerIndex) => {
      // [data-reveal] elements within this container
      const revealElements = container.querySelectorAll(TEXT_REVEAL_SELECTOR);
      
      if (revealElements.length === 0) {
        this.log(`WARNING: Container ${containerIndex} has no [data-reveal] elements!`);
      }
      
      revealElements.forEach((element, elementIndex) => {
        this.log(`Splitting element ${elementIndex} with types: ${this.options.types}`);
        
        // Store the original HTML for debugging
        const originalHTML = element.innerHTML;
        this.log(`Original HTML before split: ${originalHTML.substring(0, 100)}...`);
        
        const splitInstance = new SplitType(element, {
          types: this.options.types
        });
        
        // Log the resulting structure
        this.log(`After split, element now has:`, 
          splitInstance.lines ? `${splitInstance.lines.length} lines` : 'no lines',
          splitInstance.words ? `${splitInstance.words.length} words` : 'no words',
          splitInstance.chars ? `${splitInstance.chars.length} chars` : 'no chars'
        );
        
        // Directly inspect the DOM to see what SplitType did
        this.log(`Element HTML after split: ${element.innerHTML.substring(0, 100)}...`);
        
        // Check if lines were actually created
        if (!splitInstance.lines || splitInstance.lines.length === 0) {
          this.log(`WARNING: SplitType did not create any lines for element ${elementIndex}!`);
          this.log(`Check if element contains actual text content and if CSS is correct.`);
        }
        
        this.splitInstances.push(splitInstance);
      });
    });

    if (this.splitInstances.length === 0) {
      this.log('WARNING: No split instances were created - check your selector and [data-reveal] elements');
      return;
    }

    this.wrapLineContents();
    
    // Verify the results of our wrapping
    this.log(`After wrapping, we have ${this.allLinesCopy.length} .line__copy elements`);
    
    // Check how many are actually in the DOM
    const allLinesCopyInDOM = document.querySelectorAll('.line__copy');
    this.log(`DOM contains ${allLinesCopyInDOM.length} .line__copy elements`);
    
    if (allLinesCopyInDOM.length === 0) {
      this.log('CRITICAL ERROR: No .line__copy elements found in DOM after wrapping!');
    }
  }

  createScrollTriggerAnimation() {
    // Kill previous ScrollTriggers if they exist
    this.scrollTriggers.forEach(trigger => {
      if (trigger) trigger.kill();
    });
    this.scrollTriggers = [];

    // Direct DOM verification - what exists in the DOM right now?
    const allLinesInDOM = document.querySelectorAll('.line');
    const allLinesCopyInDOM = document.querySelectorAll('.line__copy');
    
    this.log(`DIRECT DOM CHECK: Found ${allLinesInDOM.length} .line elements and ${allLinesCopyInDOM.length} .line__copy elements in the DOM`);
    
    // If there are no lines or line copies in the DOM, something is wrong
    if (allLinesCopyInDOM.length === 0) {
      this.log(`CRITICAL ERROR: No .line__copy elements found in DOM! Animation will fail.`);
      
      // Try direct approach
      this.log(`Attempting to create animations by directly finding elements in the DOM instead of relying on stored references...`);
      
      this.containers.forEach((container, index) => {
        // Try to find any line copies directly inside this container
        const directLineCopies = Array.from(container.querySelectorAll('.line__copy'));
        
        if (directLineCopies.length > 0) {
          this.log(`Found ${directLineCopies.length} .line__copy elements directly in container ${index}`);
          
          // Create a simple scroll trigger animation
          const scrollTriggerConfig = {
            trigger: container,
            start: "top 60%",
            once: true,
            markers: this.debug
          };
          
          // Set the initial state directly
          directLineCopies.forEach(copy => {
            copy.style.transform = 'translateY(100%)';
          });
          
          // Create the animation
          const tl = gsap.timeline({ scrollTrigger: scrollTriggerConfig });
          
          tl.to(directLineCopies, {
            duration: 1.2,
            y: '0%',
            stagger: 0.1,
            ease: "expo.out"
          });
          
          this.scrollTriggers.push(tl.scrollTrigger);
          this.log(`Created direct animation for container ${index}`);
        } else {
          this.log(`No .line__copy elements found directly in container ${index}`);
        }
      });
      
      return;
    }
    
    // Debug info
    this.log(`Using stored references: ${this.allLinesCopy.length} line copies`);

    // Check if our stored references are still valid
    const validStoredCopies = this.allLinesCopy.filter(copy => 
      copy && copy.parentNode && document.body.contains(copy));
    
    this.log(`Of our ${this.allLinesCopy.length} stored line copies, ${validStoredCopies.length} are still valid in the DOM`);
    
    // If we've lost references, try to rebuild them
    if (validStoredCopies.length < this.allLinesCopy.length) {
      this.log(`WARNING: Some line copy references are no longer valid. Will use direct DOM selection instead.`);
    }

    // Create a timeline for each container
    this.containers.forEach((container, index) => {
      // Get all line copies within this container by direct DOM query
      const containerLineCopies = Array.from(container.querySelectorAll('.line__copy'));
      
      this.log(`Container ${index} has ${containerLineCopies.length} line copies via direct DOM query`);
      
      // Skip if no line copies
      if (containerLineCopies.length === 0) {
        this.log(`Skipping container ${index} - no line copies found in DOM`);
        return;
      }
      
      // Create ScrollTrigger configuration
      const scrollTriggerConfig = {
        trigger: container,
        start: "top 60%",
        once: true,
        markers: this.debug,
        onEnter: () => {
          this.log(`ScrollTrigger onEnter for container ${index}`);
          if (typeof this.options?.onEnter === 'function') {
            this.options.onEnter(container, index);
          }
        }
      };
      
      // Create the timeline
      const tl = gsap.timeline({ scrollTrigger: scrollTriggerConfig });

      // Ensure proper initial state
      gsap.set(containerLineCopies, { 
        y: '100%'
      });
      
      // Create the animation
      tl.to(containerLineCopies, {
        duration: 1.2,
        y: '0%',
        stagger: 0.1,
        ease: "expo.out",
        ...this.options.gsap
      });
      
      // Store the ScrollTrigger instance
      this.scrollTriggers.push(tl.scrollTrigger);
      this.log(`Created animation for container ${index} with ${containerLineCopies.length} line copies`);
    });
  }

  handleResize() {
    this.scrollTriggers.forEach(trigger => {
      if (trigger) trigger.kill();
    });
    this.scrollTriggers = [];

    this.splitRevealElements();
    this.createScrollTriggerAnimation();
  }

  replay() {
    this.log('Replaying animation');
    
    this.scrollTriggers.forEach(trigger => {
      if (trigger) trigger.kill();
    });

    // Set all line copies back to their initial position
    gsap.set(this.allLinesCopy, {
      y: '100%'  // Use percentage value for consistency
    });

    this.createScrollTriggerAnimation();
  }

  destroy() {
    this.scrollTriggers.forEach(trigger => {
      if (trigger) trigger.kill();
    });

    gsap.killTweensOf(this.allLinesCopy);
    
    this.splitInstances.forEach(instance => instance.revert());
    
    window.removeEventListener('resize', this.handleResize);
    
    this.splitInstances = [];
    this.allLinesCopy = [];
    this.scrollTriggers = [];
    
    if (document.querySelectorAll('.line').length === 0) {
      const styleTag = document.querySelector('#text-animate-lines-styles');
      if (styleTag) {
        styleTag.remove();
      }
    }
  }
}
