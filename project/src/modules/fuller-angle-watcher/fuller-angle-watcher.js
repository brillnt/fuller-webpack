import { selectAll } from '../../utils/helpers.js';
import './fuller-angle-watcher.css';

export default class FullerAngleWatcher {
  constructor(fullerCubesSelector) {
    if (!fullerCubesSelector) return;

    this.fullerCubes = selectAll(fullerCubesSelector);
    this.baseXCut = 0.067; // 6.7%
    this.baseYCut = 0.0447; // 4.47%

    this.init();
  }

  init() {
    this.fullerCubes.forEach(cube => this.updateCubeClipPath(cube));

    // Responsive update
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => this.updateCubeClipPath(entry.target));
    });

    this.fullerCubes.forEach(cube => resizeObserver.observe(cube));
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

    console.log('Editing: ', element, 'with cuts:', xCut, yCut);

    element.style.clipPath = `polygon(
      0 0,
      ${(1 - xCut) * 100}% 0,
      100% ${yCut * 100}%,
      100% 100%,
      ${xCut * 100}% 100%,
      0 ${(1 - yCut) * 100}%
    )`;
  }
}