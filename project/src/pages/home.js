import { onReady, init_array } from '../utils/helpers.js';
import SwipeMediaBlock from '../modules/swipe-media-block/swipe-media-block.js';
import TextAnimateSections from '../modules/text-animate-sections/text-animate-sections.js';
import SimpleImageSlider from '../modules/simple-image-slider/simple-image-slider.js';
// import AnimatePath from '../modules/animate-path/animate-path.js';
import ConnectingLine from '../modules/connecting-line/connecting-line.js';

onReady(() => {
  const swiper = new SwipeMediaBlock('home-learn');
  new TextAnimateSections([
    {
      id: 'first-reveal',
      handleResizeOnMobile: false
    },
    'home-model-reveal',
    'benefit-header-reveal',
    'bci-0', 'bci-1', 'bci-2',
    {
      id: 'swipe-copy-1',
      scrollTrigger: {
        trigger: swiper.container,
        start: 'top 75%',
        toggleActions: 'play reverse play reverse',
      },
    },
    {
      id: 'swipe-copy-2',
      scrollTrigger: {
        trigger: swiper.container,
        start: '25% top',
        toggleActions: 'play reverse play reverse',
      },
    }
  ]);
  new SimpleImageSlider('.benefits-content .bc-list .bc-item:nth-child(1) .bci-media');
  new ConnectingLine('fuller-hero-brandmark');
  new ConnectingLine('abstract-line-0');
  new ConnectingLine('abstract-line-1');
  new ConnectingLine('abstract-line-2');
  new ConnectingLine('abstract-line-3');
  new ConnectingLine('abstract-line-4');
  new ConnectingLine('abstract-line-5');
  new ConnectingLine('abstract-line-6');
  // new AnimatePath('hero-abstract', { delay: 5 });
});