import { select, selectId } from '../../utils/helpers.js';

export default class AnimatePath {
  constructor(elementId, options = {}) { // Add options parameter with default empty object
    if (!elementId) return;

    console.log(`${this.constructor.name}: id - '${elementId}'`)

    this.element = selectId(elementId);
    console.log(this.element);

    this.options = { // Default options
      viewportThreshold: 1.0, // 100% viewport top at the very top
      delay: 0,
      stagger: 0,
      easing: 'ease-in-out',
      duration: 4,
      ...options // Override defaults with user-provided options
    };
    this.elementsToAnimate = []; // Array to hold elements to animate

    this.prepareElements(); // Prepare elements based on element type
    this.init();
  }

  prepareElements() {
    console.log('PREPARING ELEMENTS');
    const tagName = this.element.tagName.toLowerCase();

    if (tagName === 'svg') {
      // Find animatable children within SVG
      const children = Array.from(this.element.querySelectorAll('path, line, rect, circle'));
      this.elementsToAnimate = children.map((child, index) => {
        const pathLength = this.getLength(child);
        // SETUP STYLES HERE
        child.style.transition = child.style.WebkitTransition = 'none';
        child.style.strokeDasharray = pathLength + ' ' + pathLength;
        child.style.strokeDashoffset = pathLength;

        return {
          element: child,
          pathLength: pathLength,
          delay: this.options.delay + (this.options.stagger * index) // Stagger delay
        }
      });
    } else if (['path', 'line', 'rect', 'circle'].includes(tagName)) {
      // Animate single element
      const pathLength = this.getLength(this.element);
      // SETUP STYLES HERE
      this.element.style.transition = this.element.style.WebkitTransition = 'none';
      this.element.style.strokeDasharray = pathLength + ' ' + pathLength;
      this.element.style.strokeDashoffset = pathLength;

      this.elementsToAnimate = [{
        element: this.element,
        pathLength: pathLength,
        delay: this.options.delay
      }];
    }
  }


  getLength(element) {
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'path') {
      return element.getTotalLength();
    } else if (tagName === 'line') {
      // Calculate line length using distance formula
      const x1 = parseFloat(element.getAttribute('x1') || 0);
      const y1 = parseFloat(element.getAttribute('y1') || 0);
      const x2 = parseFloat(element.getAttribute('x2') || 0);
      const y2 = parseFloat(element.getAttribute('y2') || 0);
      return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    } else if (tagName === 'rect') {
      // Calculate rectangle perimeter
      const width = parseFloat(element.getAttribute('width') || 0);
      const height = parseFloat(element.getAttribute('height') || 0);
      return 2 * (width + height);
    } else if (tagName === 'circle') {
      // Calculate circle circumference
      const radius = parseFloat(element.getAttribute('r') || 0);
      return 2 * Math.PI * radius;
    }
    return 0; // Default length if element is not supported
  }

  init() {
    // const threshold = 1 - (this.options.viewportThreshold / 100); // Calculate threshold

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log(`animating ${entry.target.id}`);
            // Find the corresponding element in elementsToAnimate
            const animationData = this.elementsToAnimate.find(item => item.element === entry.target);

            if (animationData) {
              const { element, pathLength, delay } = animationData;

              element.getBoundingClientRect(); // Trigger reflow

              // Apply delay and easing and START animation
              element.style.transition = element.style.WebkitTransition =
                `stroke-dashoffset ${this.options.duration}s ${this.options.easing} ${delay}ms`; // Apply delay and easing
              element.style.strokeDashoffset = '0';

              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.5 // Use calculated threshold
      }
    );

    // Observe each element to animate
    this.elementsToAnimate.forEach(item => observer.observe(item.element));
  }
}
