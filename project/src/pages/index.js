import { onReady } from '../utils/helpers.js';
import MenuChangeOnScroll from '../modules/menu-change-onscroll.js';

onReady(() => {
  new MenuChangeOnScroll('nav');
});