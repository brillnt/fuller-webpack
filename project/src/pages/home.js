import { onReady, init_array } from '../utils/helpers.js';
import SwipeMediaBlock from '../modules/swipe-media-block/swipe-media-block.js';
import TextAnimateSections from '../modules/text-animate-sections/text-animate-sections.js';
import SimpleImageSlider from '../modules/simple-image-slider/simple-image-slider.js';
import AnimatePath from '../modules/animate-path/animate-path.js';

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
  new AnimatePath('fuller-hero-brandmark');
  new AnimatePath('abstract-line-0');
  new AnimatePath('abstract-line-1');
  new AnimatePath('abstract-line-2');
  new AnimatePath('abstract-line-3');
  new AnimatePath('abstract-line-4');
  new AnimatePath('abstract-line-5');
  new AnimatePath('abstract-line-6');
});