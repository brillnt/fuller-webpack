import { onReady } from '../utils/helpers.js';
import ContactForm from '../modules/contact-form/contact-form.js';
import CommandCenterGraphic from '../modules/command-center-graphic/command-center-graphic.js';


onReady(() => {
  new ContactForm('contact-form', true);
  // new CommandCenterGraphic('cc-blocks-container', true);
  const commandCenter = new CommandCenterGraphic('cc-blocks-container', {
    debug:true,
    devMode: true,
    refinementMode: true,
    refinementConnection: 'top-left-to-top-middle', // Connection to test
    connectionRepeatDelay: 2000 // How often to refresh the visualization
  });
});