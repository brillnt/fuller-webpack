import '../modules/base/base.css';

import { onReady } from '../utils/helpers.js';
import MenuChangeOnScroll from '../modules/menu-change-onscroll.js';
import ThreeDSlider from '../modules/three-d-slider.js';


onReady(() => {
  new MenuChangeOnScroll('nav');
  new ThreeDSlider('process-slider');
});