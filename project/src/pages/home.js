import { onReady, isMobile } from '../utils/helpers.js';
import { UAParser } from 'ua-parser-js';

import ContactForm from '../modules/contact-form/contact-form.js';
import Base from '../modules/base/base.js';
import HomepageAnimations from '../modules/homepage-animations/homepage-animations.js';

class HomePage extends Base {
  constructor(debug = true) {
    super(debug);

    onReady(() => {
      const _isMobile = isMobile();
      const { browser, cpu, device } = UAParser(navigator.userAgent);
      const userDeviceDetails = { browser, cpu, device, _isMobile };

      this.logObject(userDeviceDetails);

      new HomepageAnimations(userDeviceDetails, this.debug);
      new ContactForm('contact-form', this.debug);
    });
  }
}

new HomePage();
