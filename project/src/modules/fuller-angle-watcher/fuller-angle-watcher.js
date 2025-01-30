import { selectAll } from '../../utils/helpers.js';
import './fuller-angle-watcher.css';

export default class FullerAngleWatcher {
  constructor(fullerCubesSelector) {
    if (!fullerCubesSelector) return;

    this.fullerCubes = selectAll(fullerCubesSelector);
    this.baseXCut = 0.067;
    this.baseYCut = this.baseXCut * Math.tan(33.7 * Math.PI / 180);

    this.init();
  }

  init() {
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => this.updateCubeClipPath(entry.target));
    });

    this.fullerCubes.forEach(cube => {
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
    const xCutPct = `${(xCut * 100).toFixed(4)}%`;
    const yCutPct = `${(yCut * 100).toFixed(4)}%`;

    const clipPath = `polygon(
      0 0,
      calc(100% - ${xCutPct}) 0,
      100% ${yCutPct},
      100% 100%,
      ${xCutPct} 100%,
      0 calc(100% - ${yCutPct})
    )`;

    element.style.clipPath = clipPath;
    element.style.webkitClipPath = clipPath;
    element.style.setProperty('--dynamic-clip', clipPath);

  }
}