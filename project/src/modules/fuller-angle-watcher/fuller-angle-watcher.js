import { selectAll } from '../../utils/helpers.js';
import './fuller-angle-watcher.css';
import Base from '../base/base.js';

export default class FullerAngleWatcher extends Base {
  constructor(fullerCubesSelector, options = {}) {
    // Handle the case where options is a boolean (for backward compatibility)
    const debug = typeof options === 'boolean' ? options : options.debug || false;
    super(debug);
    if (!fullerCubesSelector) return;

    // Set options based on the input
    if (typeof options === 'boolean') {
      this.options = { debug: options, inset: 0 };
    } else {
      this.options = {
        debug: false,
        inset: 0, // Default inset value is 0
        ...options
      };
    }

    this.fullerCubes = selectAll(fullerCubesSelector);
    this.baseXCut = 0.067;
    this.baseYCut = this.baseXCut * Math.tan(33.7 * Math.PI / 180);

    this.init();
  }

  init() {
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => this.updateCubeClipPath(entry.target));
    });

    // check if fullerCubes exist and are not empty
    if (!this.fullerCubes || this.fullerCubes.length === 0) {
      this.log('No cubes found');
      return;
    }

    this.fullerCubes.forEach(cube => {
      // Add the fuller-angle-watch class to each element
      cube.classList.add('fuller-angle-watch');
      
      this.updateCubeClipPath(cube);
      resizeObserver.observe(cube);
    });
  }

  updateCubeClipPath(element) {
    // Update cube clip path logic here
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const aspectRatio = width / height;

    // Adjust cuts for aspect ratio
    const xCut = this.baseXCut;
    const yCut = this.baseYCut * aspectRatio; // Maintain 2:3 ratio relative to aspect
    
    // Calculate percentage values
    const xCutPct = `${(xCut * 100).toFixed(4)}%`;
    const yCutPct = `${(yCut * 100).toFixed(4)}%`;
    
    // Apply inset value if provided
    const inset = this.options.inset;
    
    let clipPath;
    
    if (inset === 0) {
      // Original clip path without inset
      clipPath = `polygon(
        0 0,
        calc(100% - ${xCutPct}) 0,
        100% ${yCutPct},
        100% 100%,
        ${xCutPct} 100%,
        0 calc(100% - ${yCutPct})
      )`;
    } else {
      // Convert inset to percentage of dimensions
      const insetXPct = `${((inset / width) * 100).toFixed(4)}%`;
      const insetYPct = `${((inset / height) * 100).toFixed(4)}%`;
      
      // Create clip path with inset adjustment
      clipPath = `polygon(
        ${insetXPct} ${insetYPct},
        calc(100% - ${xCutPct} - ${insetXPct}) ${insetYPct},
        calc(100% - ${insetXPct}) calc(${yCutPct} + ${insetYPct}),
        calc(100% - ${insetXPct}) calc(100% - ${insetYPct}),
        calc(${xCutPct} + ${insetXPct}) calc(100% - ${insetYPct}),
        ${insetXPct} calc(100% - ${yCutPct} - ${insetYPct})
      )`;
    }

    element.style.clipPath = clipPath;
    element.style.webkitClipPath = clipPath;
    element.style.setProperty('--dynamic-clip', clipPath);
  }
}