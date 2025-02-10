import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger.js";


gsap.registerPlugin(ScrollTrigger);

// Export everything together
export {
  gsap,
  ScrollTrigger,
};