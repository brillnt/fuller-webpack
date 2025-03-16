import { onReady, selectAll,  isMobile } from '../utils/helpers.js';
import FullerAngleWatcher from '../modules/fuller-angle-watcher/fuller-angle-watcher.js';
import ImageWipeReveal from '../modules/image-wipe-reveal/image-wipe-reveal.js';
import TextAnimateSections from '../modules/text-animate-sections/text-animate-sections.js';
import FutureGallery from '../modules/future-gallery/future-gallery.js';
import Slider from '../modules/slider/slider.js';
import ContactForm from '../modules/contact-form/contact-form.js';
import { gsap } from '../utils/animation.js';

onReady(() => {
  const fullerCards = selectAll('.card-row .card');

  new ContactForm('contact-form', true);
  new FullerAngleWatcher('.card', { debug: true });
  new FullerAngleWatcher('.process-step__image-wrap', { debug: true, inset: 1 });
  new FullerAngleWatcher('.process-step__image-border', { debug: true });
  new ImageWipeReveal('.process-step__image-wrap img', {}, true);
  new ImageWipeReveal('.process-step__big-number', { direction: 'right' }, true);
  new TextAnimateSections(['first-reveal', 'second-reveal', 'third-reveal', 'home-os', 'prototype-section', 'future-section', 'div[data-process-step].process-step'], false);
  new FutureGallery('future-gallery', true);
  new Slider('slider-wrapper-2', {
    animationDuration: 1,
    animationOffset: 1,
    slideDuration: 5000,
    waitUntilVisible: true,
    autoplay: true,
  });

  if (!isMobile()) {
    console.log('not mobile');
    gsap.set(fullerCards, { x: -20, opacity: 0 });

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
  }
});