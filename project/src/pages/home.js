import { onReady, init_array } from '../utils/helpers.js';
import ThreeDSlider from '../modules/three-d-slider/three-d-slider.js';
import SwipeMediaBlock from '../modules/swipe-media-block/swipe-media-block.js';
import TextAnimateSections from '../modules/text-animate-sections/text-animate-sections.js';
import SimpleImageSlider from '../modules/simple-image-slider/simple-image-slider.js';
import ConnectingLine from '../modules/connecting-line/connecting-line.js';


onReady(() => {
  const swiper = new SwipeMediaBlock('home-learn');
  new ThreeDSlider('process-slider');
  // const connectline = new ConnectingLine(
  //   init_array(2, i => `.benefits-content .bc-list .bc-item:nth-child(${i+1}) .bci-media`)
  // );
  new TextAnimateSections([
    'first-reveal',
    'home-model-reveal',
    'benefit-header-reveal',
    'bci-0', 'bci-1', 'bci-2',
    {
      id: 'swipe-copy-1',
      gsap: { delay: 0.5 },
      scrollTrigger: {
        trigger: swiper.container,
        start: '0% top',
        toggleActions: 'play reverse play reverse',
      },
    },
    {
      id: 'swipe-copy-2',
      gsap: { delay: 0.5 },
      scrollTrigger: {
        trigger: swiper.container,
        start: '50% top',
        toggleActions: 'play reverse play reverse',
      },
    }
  ]);
  new SimpleImageSlider('.benefits-content .bc-list .bc-item:nth-child(1) .bci-media');
});