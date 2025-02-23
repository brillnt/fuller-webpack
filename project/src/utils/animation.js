import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import SplitType from 'split-type';


gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1");

// Export everything together
export {
  gsap,
  ScrollTrigger,
  SplitType,
  CustomEase,
};