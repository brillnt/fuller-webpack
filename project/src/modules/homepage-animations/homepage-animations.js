import { onReady, isMobile } from '../../utils/helpers.js';

import Base from '../base/base.js';
import TextAnimateSections from '../text-animate-sections/text-animate-sections.js';
import ConnectingLine from '../connecting-line/connecting-line.js';
import ThreePillars from '../three-pillars/three-pillars.js';
import SwipeMediaBlock from '../swipe-media-block/swipe-media-block.js';

export default class HomepageAnimations extends Base {
  constructor(device, debug) {
    super(debug);
    this.debug = debug;
    this.device = device;

    // run animations when the page is loaded
    onReady(() => {
      this.init();
    });
  }

  init() {
    if (isMobile()) {
      const defaultScrollTrigger = {
        start: 'top 75%',
        once: true
      };

      new TextAnimateSections([
        'home-model-reveal',
        'benefit-header-reveal',
        'home-partner-content',
        'bci-0', 'bci-1', 'bci-2',
        { 
          id: 'first-reveal', 
          handleResizeOnMobile: false
        },
        {
          id: 'swipe-copy-1',
          scrollTrigger: { trigger: '#swipe-copy-1', ...defaultScrollTrigger },
        },
        {
          id: 'swipe-copy-2',
          scrollTrigger: { trigger: '#swipe-copy-2', ...defaultScrollTrigger },
        },
      ], this.debug);
    } else {
      const swiper = new SwipeMediaBlock('home-learn');
      
      const toggleActions = 'play reverse play reverse';
      new TextAnimateSections([
        {
          id: 'first-reveal',
          handleResizeOnMobile: false
        },
        'home-model-reveal',
        'home-partner-content',
        'benefit-header-reveal',
        'bci-0', 'bci-1', 'bci-2',
        {
          id: 'swipe-copy-1',
          scrollTrigger: {
            trigger: swiper.container,
            start: 'top 75%',
            toggleActions
          },
        },
        {
          id: 'swipe-copy-2',
          scrollTrigger: {
            trigger: swiper.container,
            start: '25% top',
            toggleActions
          },
        }
      ], this.debug);
    }
    new ConnectingLine('fuller-hero-brandmark', this.debug);
    new ConnectingLine('abstract-line-0', this.debug);
    new ConnectingLine('abstract-line-1', this.debug);
    new ConnectingLine('abstract-line-2', this.debug);
    new ConnectingLine('abstract-line-3', this.debug);
    new ConnectingLine('abstract-line-4', this.debug);
    new ConnectingLine('abstract-line-5', this.debug);
    new ConnectingLine('abstract-line-6', this.debug);

    if (this.device?.browser.name !== 'Safari') {
      new ThreePillars('benefits-content');
    }
  }
}