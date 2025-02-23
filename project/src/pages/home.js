import { onReady, init_array } from '../utils/helpers.js';
import SwipeMediaBlock from '../modules/swipe-media-block/swipe-media-block.js';
import TextAnimateSections from '../modules/text-animate-sections/text-animate-sections.js';
import ConnectingLine from '../modules/connecting-line/connecting-line.js';
import ThreePillars from '../modules/three-pillars/three-pillars.js';

onReady(() => {
  const swiper = new SwipeMediaBlock('home-learn');
  new ThreePillars('benefits-content');
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
  new ConnectingLine('fuller-hero-brandmark', true);
  new ConnectingLine('abstract-line-0', true);
  new ConnectingLine('abstract-line-1', true);
  new ConnectingLine('abstract-line-2', true);
  new ConnectingLine('abstract-line-3', true);
  new ConnectingLine('abstract-line-4', true);
  new ConnectingLine('abstract-line-5', true);
  new ConnectingLine('abstract-line-6', true);
});