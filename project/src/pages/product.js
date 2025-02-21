import { onReady, selectAll,  isMobile } from '../utils/helpers.js';
import FullerAngleWatcher from '../modules/fuller-angle-watcher/fuller-angle-watcher.js';
import TextAnimateSections from '../modules/text-animate-sections/text-animate-sections.js';
import ThreeDSlider from '../modules/three-d-slider/three-d-slider.js';
import { gsap } from '../utils/animation.js';
import AnimatePath from '../modules/animate-path/animate-path.js';


onReady(() => {
  new FullerAngleWatcher('.card, .two-path-block, .fuller-gallery-control');
  new TextAnimateSections(['first-reveal', 'second-reveal', 'third-reveal', 'home-os', 'prototype-section', 'future-section']);

  const fullerCards = selectAll('.card-row .card');
  const twoPathCards = selectAll('.two-path-blocks .two-path-block');
  const fullerGalleryControls = selectAll('.fuller-gallery-control');
  new ThreeDSlider('process-slider');

  // new AnimatePath('house-pencil-icon', { duration: 2, delay: 10, viewportThreshold: 0.8 });
  // new AnimatePath('workflow-icon', { duration: 2, delay: 10, viewportThreshold: 0.8 });
  // new AnimatePath('engineer-icon', { duration: 2, delay: 10, viewportThreshold: 0.8  });

  gsap.set(fullerGalleryControls, { opacity: 0, x: -20 });
  gsap.to(fullerGalleryControls, {
    opacity: 1,
    x: 0,
    stagger: 0.2,
    scrollTrigger: {
      trigger: '.fuller-gallery-controls',
      start: 'top 86%',
      toggleActions: 'play none none reverse',
    },
  });

  if (!isMobile()) {
    console.log('not mobile');
    // new FullerAngleWatcher('.fuller-gallery-control');
    gsap.set(fullerCards, { x: -20, opacity: 0 });
    gsap.set(twoPathCards, { y: 20, opacity: 0 });

    gsap.to(fullerCards, {
      x: 0,
      opacity: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.card-row',
        start: 'top 50%',
        toggleActions: 'play none none reverse',
      },
    });

    gsap.to(twoPathCards, {
      y: 0,
      opacity: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.two-path-blocks',
        start: 'top 50%',
        toggleActions: 'play none none reverse',
      },
    });
  }
});