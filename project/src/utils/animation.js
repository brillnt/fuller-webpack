import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import SplitType from 'split-type';


gsap.registerPlugin(ScrollTrigger);

// Export everything together
export {
  gsap,
  ScrollTrigger,
  SplitType,
};