import TextAnimateLines from '../text-animate-lines/text-animate-lines.js';

export default class TextAnimateSections {
  constructor(sections) {
    if (!Array.isArray(sections) || sections.length === 0) return;

    if (window.innerWidth < 768) {
      return;
    }

    this.sections = sections;
    this.init();
  }

  init() {
    this.sections.forEach(params => {
      if (typeof params === 'string') {
        new TextAnimateLines(params);
      } else if (typeof params === 'object' && params !== null && params.id) {
        const { id, ...animationOptions } = params;
        new TextAnimateLines(id, animationOptions);
      }
    });
  }
}