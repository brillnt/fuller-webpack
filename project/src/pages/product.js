import { onReady } from '../utils/helpers.js';
import FullerAngleWatcher from '../modules/fuller-angle-watcher/fuller-angle-watcher.js';


onReady(() => {
  new FullerAngleWatcher('.card, .two-path-block');
});