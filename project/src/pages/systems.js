import { onReady } from '../utils/helpers.js';
import AnimateGridRows from '../modules/animate-grid-rows/animate-grid-rows.js';


onReady(() => {
  new AnimateGridRows('spc-blocks-container');
});