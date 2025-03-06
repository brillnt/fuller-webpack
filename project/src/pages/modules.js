import { onReady } from '../utils/helpers.js';
import ContactForm from '../modules/contact-form/contact-form.js';
import CommandCenterGraphic from '../modules/command-center-graphic/command-center-graphic.js';


onReady(() => {
  new ContactForm('contact-form', true);
  new CommandCenterGraphic('cc-blocks-container', true);
});