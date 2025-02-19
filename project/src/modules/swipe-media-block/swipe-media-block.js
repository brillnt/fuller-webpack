import { pick, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';

const REVEAL_CLIP_PATH = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
export default class SwipeMediaBlock {
  constructor(elementId) {
    if (!elementId) return;

    // don't run on mobile
    if (window.innerWidth < 768) {
      return;
    }

    this.container = selectId(elementId);
    this.mediaWrapper = this.container.querySelector('.swipe-media');
    this.mediaFirst = this.mediaWrapper.querySelector('.sc-media:nth-child(1)');
    this.mediaSecond = this.mediaWrapper.querySelector('.sc-media:nth-child(2)');
    // it's not a typo, visually the 'first' content block is the *second* one
    this.contentFirst = this.container.querySelector('.swipe-content .sc-block:nth-child(2)');
    this.contentSecond = this.container.querySelector('.swipe-content .sc-block:nth-child(1)');
    this.hintFirst = this.contentFirst.querySelector('.sc-scroll-hint');
    this.hintSecond = this.contentSecond.querySelector('.sc-scroll-hint');

    this.hasReachedFirst = false;
    this.hasReachedSecond = false;
    this.isScrolling = false;
    this.scrollRAF = null;
    this.scrollTimeout = null;
    this.hintTimeout = null;
    this.hintOpacity = 0.45;
    this.hintDelay = 1;
    this.hintDuration = 3;

    this.init();

    return pick(this, ['container']);
  }

  init() {
    gsap.set([this.hintFirst, this.hintSecond], { yPercent: 100, opacity: 0 });
    this.firstTrigger();
    this.secondTrigger();
    this.setHintListers();
  }

  handleScroll() {
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
    }
    
    if (this.hasReachedFirst && !this.hasReachedSecond) {
      this.hintTimeout = setTimeout(() => {
        this.showFirstHint();
      }, this.hintDelay * 1000);
    }
  }

  setHintListers() {
    window.addEventListener('scroll', () => {
      if (this.scrollRAF) {
        cancelAnimationFrame(this.scrollRAF);
      }
      
      // Set scrolling state
      if (!this.isScrolling) {
        this.isScrolling = true;
        this.hideFirstHint();
      }

      this.scrollRAF = requestAnimationFrame(() => {
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        
        this.scrollTimeout = setTimeout(() => {
          this.isScrolling = false;
          this.handleScroll();
        }, 150); // Debounce scroll events
      });
    });
  }

  showFirstHint() {
    gsap.to(this.hintFirst, { yPercent: 0, opacity: this.hintOpacity, duration: this.hintDuration, delay: this.hintDelay, ease: 'expo.out' });
  }

  hideFirstHint() {
    gsap.to(this.hintFirst, { yPercent: 100, opacity: 0, duration: this.hintDuration, ease: 'expo.out' });
  }

  firstTrigger() {
    const scrollTrigger = { trigger: this.container, start: 'top 75%', toggleActions: 'play none none reverse' };

    // reveal first image
    gsap.to(this.mediaFirst, {
      clipPath: REVEAL_CLIP_PATH, duration: 1, ease: 'expo.out',
      onComplete: () => {
        this.hasReachedFirst = true;
        console.log(`ANIMATE: first swipe image!`);
      },
      scrollTrigger: {
        ...scrollTrigger,
        onLeaveBack: () => {
          this.hideFirstHint();
          this.hasReachedFirst = false;
        }
      }
    });
  }

  secondTrigger() {
    const scrollTrigger = { trigger: this.container, start: '25% top', toggleActions: 'play none none reverse' };

    // swipe image container to the right
    gsap.to(this.mediaWrapper, {
      x: "100%", duration: 1, ease: 'expo.out',
      scrollTrigger: {
        ...scrollTrigger,
        onEnter: () => {
          this.hasReachedSecond = true;
        },
        onLeaveBack: () => {
          this.hasReachedSecond = false;
          if (this.hasReachedFirst) {
            this.handleScroll();
          }
        }
      },
      onComplete: () => {
        console.log(`ANIMATE: second swipe image`);
      },
    });

    // reveal second image
    gsap.to(this.mediaSecond, {
      clipPath: REVEAL_CLIP_PATH, delay: 1, duration: 1, ease: 'expo.out',
      scrollTrigger,
      onComplete: () => {
        console.log(`ANIMATE: second swipe image`);
      },
    });

    // reveal second hint
    // gsap.to(this.hintSecond, { yPercent: 0, opacity: this.hintOpacity, duration: this.hintDuration, delay: this.hintDelay, ease: 'expo.out', scrollTrigger });
  }
}