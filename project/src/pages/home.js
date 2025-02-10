import { onReady } from '../utils/helpers.js';
import ThreeDSlider from '../modules/three-d-slider/three-d-slider.js';
import SwipeMediaBlock from '../modules/swipe-media-block/swipe-media-block.js';
import TextAnimateLines from '../modules/text-animate-lines/text-animate-lines.js';


onReady(() => {
  new ThreeDSlider('process-slider');
  new SwipeMediaBlock('home-learn');
  new TextAnimateLines('first-reveal');
});