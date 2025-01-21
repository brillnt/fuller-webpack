import '../modules/base/base.css';

import { onReady } from '../utils/helpers.js';
import ThreeDSlider from '../modules/three-d-slider/three-d-slider.js';
import FullscreenMenu from '../modules/fullscreen-menu/fullscreen-menu.js';


onReady(() => {
  new FullscreenMenu({ navId: 'nav', menuId: 'menu-fullscreen' });
  new ThreeDSlider('process-slider');
});