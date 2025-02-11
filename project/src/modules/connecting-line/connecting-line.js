import { select, selectId } from '../../utils/helpers.js';

export default class ConnectingLine {
  constructor(startElement, endElement, options = {}) {
      this.startElement = typeof startElement === 'string' ? select(startElement) : startElement;
      this.endElement = typeof endElement === 'string' ? select(endElement) : endElement;

      if (!this.startElement || !this.endElement) {
        console.warn('ConnectingLine: startElement or endElement not found');
        return;
      }
      this.options = {
          stroke: options.stroke || '#94a3b8',
          strokeWidth: options.strokeWidth || 2,
          dashArray: options.dashArray || '4 4',
          curveOffset: options.curveOffset || 40,
          svg: options.svg || this.createSVGLayer(),
          ...options
      };
      
      this.path = null;
      this.init();
  }

  createSVGLayer() {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '1';
      document.body.appendChild(svg);
      return svg;
  }

  init() {
      this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.path.setAttribute('fill', 'none');
      this.path.setAttribute('stroke', this.options.stroke);
      this.path.setAttribute('stroke-width', this.options.strokeWidth);
      this.path.setAttribute('stroke-dasharray', this.options.dashArray);
      
      this.options.svg.appendChild(this.path);
      
      // Initial draw
      this.draw();
      
      // Set up resize observer
      this.resizeObserver = new ResizeObserver(() => this.draw());
      this.resizeObserver.observe(this.startElement);
      this.resizeObserver.observe(this.endElement);
      
      // Set up mutation observer for position changes
      this.mutationObserver = new MutationObserver(() => this.draw());
      const observerConfig = { 
          attributes: true, 
          attributeFilter: ['style', 'class']
      };
      this.mutationObserver.observe(this.startElement, observerConfig);
      this.mutationObserver.observe(this.endElement, observerConfig);
      
      // Handle scroll events
      window.addEventListener('scroll', () => this.draw(), true);
  }

  getElementCenter(element) {
      const rect = element.getBoundingClientRect();
      return {
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY,
          left: rect.left + window.scrollX,
          right: rect.right + window.scrollX,
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          width: rect.width,
          height: rect.height
      };
  }

  draw() {
      const start = this.getElementCenter(this.startElement);
      const end = this.getElementCenter(this.endElement);
      
      // Determine the best connection points
      let startX, startY, endX, endY;
      
      // If elements are more horizontal than vertical
      if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
          startX = start.x < end.x ? start.right : start.left;
          endX = start.x < end.x ? end.left : end.right;
          startY = start.y;
          endY = end.y;
      } else {
          startX = start.x;
          endX = end.x;
          startY = start.y < end.y ? start.bottom : start.top;
          endY = start.y < end.y ? end.top : end.bottom;
      }
      
      // Calculate control points for the curve
      const { curveOffset } = this.options;
      let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;
      
      if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
          // Horizontal curve
          controlPoint1X = startX + curveOffset;
          controlPoint1Y = startY;
          controlPoint2X = endX - curveOffset;
          controlPoint2Y = endY;
      } else {
          // Vertical curve
          controlPoint1X = startX;
          controlPoint1Y = startY + curveOffset;
          controlPoint2X = endX;
          controlPoint2Y = endY - curveOffset;
      }
      
      // Create the path
      const path = `M ${startX} ${startY} 
                   C ${controlPoint1X} ${controlPoint1Y},
                     ${controlPoint2X} ${controlPoint2Y},
                     ${endX} ${endY}`;
      
      this.path.setAttribute('d', path);
  }

  setOptions(options) {
      this.options = { ...this.options, ...options };
      if (this.path) {
          this.path.setAttribute('stroke', this.options.stroke);
          this.path.setAttribute('stroke-width', this.options.strokeWidth);
          this.path.setAttribute('stroke-dasharray', this.options.dashArray);
      }
      this.draw();
  }

  destroy() {
      if (this.path) {
          this.path.remove();
      }
      if (this.resizeObserver) {
          this.resizeObserver.disconnect();
      }
      if (this.mutationObserver) {
          this.mutationObserver.disconnect();
      }
      window.removeEventListener('scroll', () => this.draw());
  }
}