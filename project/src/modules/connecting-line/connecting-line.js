import { select } from '../../utils/helpers.js';
  // const connectline = new ConnectingLine(
  //   init_array(2, i => `.benefits-content .bc-list .bc-item:nth-child(${i+1}) .bci-media`)
  // );

export default class ConnectingLine {
  constructor(elements, options = {}) {
    this.elements = this._resolveElements(elements);
    this.options = {
      strokeColor: '#000',
      strokeWidth: 2,
      curveOffset: 50,
      container: document.body,
      ...options
    };
    this.svg = null;
    this.paths = [];
    this._init();
  }

  _resolveElements(elements) {
    return elements.map(el => 
      typeof el === 'string' ? select(el) : el
    );
  }

  _init() {
    this._createSVG();
    this._drawPaths();
    this._setupEventListeners();
  }

  _createSVG() {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.style.position = 'absolute';
    this.svg.style.top = '0';
    this.svg.style.left = '0';
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    this.svg.style.pointerEvents = 'none';
    this.options.container.appendChild(this.svg);
  }

  _drawPaths() {
    this.svg.innerHTML = '';
    for (let i = 0; i < this.elements.length - 1; i++) {
      const path = this._createPath(
        this.elements[i],
        this.elements[i + 1]
      );
      this.svg.appendChild(path);
    }
  }

  _createPath(startEl, endEl) {
    const startPoint = this._getExitPoint(startEl, endEl);
    const endPoint = this._getEntryPoint(endEl, startEl);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    const pathData = `M ${startPoint.x} ${startPoint.y} 
                     C ${startPoint.cx} ${startPoint.cy}, 
                       ${endPoint.cx} ${endPoint.cy}, 
                       ${endPoint.x} ${endPoint.y}`;
    
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.options.strokeColor);
    path.setAttribute('stroke-width', this.options.strokeWidth);
    path.setAttribute('stroke-linecap', 'round');
    return path;
  }

  _getExitPoint(el, targetEl) {
    const rect = el.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    // Remove scrollX/Y from calculations since getBoundingClientRect is relative to viewport
    const center = {
        x: rect.left + rect.width/2,
        y: rect.top + rect.height/2
    };
    
    const targetCenter = {
        x: targetRect.left + targetRect.width/2,
        y: targetRect.top + targetRect.height/2
    };

    const dx = targetCenter.x - center.x;
    const dy = targetCenter.y - center.y;
    const direction = Math.abs(dx) > Math.abs(dy) 
      ? (dx > 0 ? 'right' : 'left') 
      : (dy > 0 ? 'bottom' : 'top');

    return this._calculatePoint(rect, scrollX, scrollY, direction, 'exit');
  }

  _getEntryPoint(el, sourceEl) {
    const rect = el.getBoundingClientRect();
    const sourceRect = sourceEl.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    const center = {
      x: rect.left + rect.width/2 + scrollX,
      y: rect.top + rect.height/2 + scrollY
    };
    
    const sourceCenter = {
      x: sourceRect.left + sourceRect.width/2 + scrollX,
      y: sourceRect.top + sourceRect.height/2 + scrollY
    };

    const dx = sourceCenter.x - center.x;
    const dy = sourceCenter.y - center.y;
    const direction = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'bottom' : 'top');

    return this._calculatePoint(rect, scrollX, scrollY, direction, 'entry');
  }

  _calculatePoint(rect, scrollX, scrollY, direction, type) {
    const offset = this.options.curveOffset;
    let x, y, cx, cy;

    switch (direction) {
      case 'right':
        x = rect.right;  // Remove scrollX
        y = rect.top + rect.height/2;  // Remove scrollY
        cx = x + (type === 'exit' ? offset : -offset);
        cy = y;
        break;
      case 'left':
        x = rect.left;
        y = rect.top + rect.height/2;
        cx = x - (type === 'exit' ? offset : -offset);
        cy = y;
        break;
      case 'bottom':
        x = rect.left + rect.width/2;
        y = rect.bottom;
        cx = x;
        cy = y + (type === 'exit' ? offset : -offset);
        break;
      case 'top':
        x = rect.left + rect.width/2;
        y = rect.top;
        cx = x;
        cy = y - (type === 'exit' ? offset : -offset);
        break;
    }

    return { x, y, cx, cy };
  }

  _setupEventListeners() {
    this._onResize = () => this._drawPaths();
    window.addEventListener('resize', this._onResize);
    window.addEventListener('scroll', this._onResize, { passive: true });
  }

  update() {
    this._drawPaths();
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('scroll', this._onResize);
    this.svg.remove();
  }
}