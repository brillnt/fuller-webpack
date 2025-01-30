import '../modules/base/base.css';

import { onReady } from '../utils/helpers.js';
import FullscreenMenu from '../modules/fullscreen-menu/fullscreen-menu.js';


onReady(() => {
  new FullscreenMenu({ navId: 'nav', menuId: 'menu-fullscreen' });
});
