// dom helper functions
export const select = (selector) => document.querySelector(selector);
export const selectAll = (selector) => document.querySelectorAll(selector);
export const selectId = (id) => document.getElementById(id);

// event helper functions
export const on = (element, event, handler) => {
  if (!element || !event || !handler) return;
  element = typeof element === 'string' ? select(element) : element;
  
  if (element.length > 1 && Object.prototype.toString.call(element) === '[object NodeList]') {
    element.forEach((el) => el.addEventListener(event, handler));
    console.log('handler added to multiple nodes');
    return;
  }

  return element.addEventListener(event, handler);
};

export const onReady = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

export const pick = (haystack, needles) => needles.reduce((found, needle) => (haystack.hasOwnProperty(needle) && (found[needle] = haystack[needle]), found), {});
export const init_array = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
export const isMobile = () => window.innerWidth < 768;
