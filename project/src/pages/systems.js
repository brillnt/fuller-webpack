import { onReady, selectAll } from '../utils/helpers.js';
import AnimateGridRows from '../modules/animate-grid-rows/animate-grid-rows.js';
import TextAnimateSections from '../modules/text-animate-sections/text-animate-sections.js';
import { gsap } from '../utils/animation.js';


onReady(() => {
  new AnimateGridRows('spc-blocks-container', 'spc');
  new AnimateGridRows('cc-blocks-container', 'cc');
  new TextAnimateSections(['first-reveal', 'second-reveal', 'third-reveal', 'fourth-reveal', 'fifth-reveal']);

  const configuratorCards = selectAll('.config-blocks .config-block');

  gsap.set(configuratorCards, { x: 20, opacity: 0 });
  gsap.to(configuratorCards, {
    x: 0,
    opacity: 1,
    stagger: 0.2,
    scrollTrigger: {
      trigger: '.config-blocks',
      start: 'top 50%',
      toggleActions: 'play none none reverse',
    },
  });
});