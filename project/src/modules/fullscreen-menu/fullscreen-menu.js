import { on, select, selectId } from '../../utils/helpers.js';
import { gsap } from '../../utils/animation.js';

export default class FullscreenMenu {
  constructor(options) {
    if (!options) return;

    this.nav = selectId(options.navId);
    this.menuButton = this.nav.querySelector('.menu-btn');
    this.menu = selectId(options.menuId);
    this.menuBG = this.menu.querySelector('.mfs-bg');
    this.init();
  }

  init() {
    // Initialize your module here
    on(this.menuButton, 'click', () => {
      let menuState = this.menuButton.getAttribute('data-menu-state');

      if (menuState === 'closed') {
        this.menuButton.setAttribute('data-menu-state', 'open');
        gsap.set(this.menu, { display: 'block' });

        gsap.to(this.menuBG, {
          duration: 0.5,
          x: '0%',
          ease: 'power4.inOut',
        });
      } else {
        this.menuButton.setAttribute('data-menu-state', 'closed');

        gsap.to(this.menuBG, {
          duration: 0.5,
          x: '100%',
          ease: 'power4.inOut',
          onComplete: () => {
            gsap.set(this.menu, { display: 'none' });
          }
        });
      }
    });
  }
}