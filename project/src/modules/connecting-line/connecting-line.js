import { select, selectId } from '../../utils/helpers.js';
import Base from '../base/base.js';

export default class ConnectingLine extends Base {
  constructor(elementId, debug = false) {
    super(debug);

    if (!elementId) return;

    this.log(`initialized with elementId: ${elementId}`);

    this.element = selectId(elementId);
    this.pathLength = this.getLength(); // Use a method to determine length
    this.init();
  }

  getLength() {
    if (this.element.tagName === 'path') {
      return this.element.getTotalLength();
    } else if (this.element.tagName === 'line') {
      // Calculate line length using distance formula
      const x1 = parseFloat(this.element.getAttribute('x1') || 0); // Default to 0 if attribute is missing
      const y1 = parseFloat(this.element.getAttribute('y1') || 0);
      const x2 = parseFloat(this.element.getAttribute('x2') || 0);
      const y2 = parseFloat(this.element.getAttribute('y2') || 0);
      return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    }
    return 0; // Default length if element is not path or line
  }

  init() {
    // Initialize your module here
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.element.style.transition = this.element.style.WebkitTransition = 'none';
            this.element.style.strokeDasharray = this.pathLength + ' ' + this.pathLength;
            this.element.style.strokeDashoffset = this.pathLength;
            this.element.getBoundingClientRect();
            this.element.style.transition = this.element.style.WebkitTransition =
              'stroke-dashoffset 4s ease-in-out';
            this.element.style.strokeDashoffset = '0';

            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null, // Observe relative to the viewport
        rootMargin: "0px",
        threshold: 0.5 // Trigger when 50% of the element is visible
      }
    );

    // Start observing your element
    observer.observe(this.element);
  }
}