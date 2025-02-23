import { select, selectId } from '../../utils/helpers.js';
import { gsap as gs } from '../../utils/animation.js';
import Base from '../base/base.js';

import './slider.css';

export default class Slider extends Base {
  constructor(elementId, options, debug = false) {
    super(debug);
    // store references to DOM elements...
    this.wrapper = selectId(elementId);
    if (!this.wrapper) {
      console.log(`Element with ID ${elementId} not found.`);
      return;
    }

    this.log(`initialized with elementId: ${elementId}`);

    this.sliderElement = this.wrapper.querySelector(".slider");
    if (!this.sliderElement) {
      console.log(`Slider element not found in ${elementId}.`);
      return;
    }

    this.sliderImages = this.sliderElement.querySelector(".slider-images");
    this.titles = this.sliderElement.querySelector(".slider-title-wrapper");
    this.indicators = this.sliderElement.querySelectorAll(".slider-indicators .si-icons");
    this.slidePreview = this.sliderElement.querySelector(".slider-preview");
    this.previewSlides = this.slidePreview.querySelectorAll(".preview");

    if (!this.previewSlides.length) {
      console.log(`No preview slides found in ${elementId}. Preview slides are required, even if hidden.`);
      return;
    }

    this.progressBars = Array.from(this.previewSlides).map(slide => slide.querySelector(".progress"));
    this.totalSlides = this.previewSlides.length;
    this.imgSources = Array.from(this.previewSlides).map(div => {
      const img = div.querySelector('img');
      return img ? img.src : '';
    });

    this.sliderEnabled = true;
    this.firstRun = true;
    this.currentImg = 1;
    this.indicatorRotation = 0;
    this.slideInterval = null;
    
    // slider options
    this.animationDuration = options?.animationDuration || 1.5;
    this.animationOffset = options?.animationOffset ?? 500;
    this.slideDuration = options?.slideDuration || 5500;
    this.waitUntilVisible = options?.waitUntilVisible ?? true;
    this.autoplay = options?.autoplay ?? false;

    this.SLIDER_TITLE_HEIGHT = 64;

    // Polygon clip paths
    this.FLAT_FROM_LEFT = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
    this.FLAT_FROM_RIGHT = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
    this.FULLY_VISIBLE = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

    this.init();
  }

  init() {
    this.wrapper.addEventListener("click", this.handleClick.bind(this));

    if (this.waitUntilVisible) {
      this.trackInitialVisibility();
      return;
    }

    if (this.autoplay) {
      this.startWithAutoplay();
      return;
    }
  }

  updateCounterAndTitlePosition() {
    const titleY = -this.SLIDER_TITLE_HEIGHT * (this.currentImg - 1);
    gs.to(this.titles, { y: titleY, duration: 1, ease: "hop" });
  }

  updateActiveSlidePreview() {
    this.previewSlides.forEach((prev, index) => {
      prev.classList.toggle("active", index === this.currentImg - 1);
      if (index !== this.currentImg - 1) {
        gs.killTweensOf(this.progressBars[index], { width: true });
        this.progressBars[index].style.width = "0%";
      }
    });
  }

  createNewSlide() {
    const incomingSlide = document.createElement("div");
    incomingSlide.classList.add("slider-img");

    const incomingImg = document.createElement("img");
    incomingImg.src = this.imgSources[this.currentImg - 1];
    incomingImg.classList.add("slider-image-elem");
    incomingSlide.appendChild(incomingImg);

    return { incomingSlide, incomingImg };
  }

  animateSlide(direction) {
    clearInterval(this.slideInterval);

    if (!this.sliderEnabled) {
      return;
    }

    const getImgs = this.sliderImages.querySelectorAll(".slider-img");
    const outgoingSlide = getImgs[getImgs.length - 1];
    const outgoingImg = outgoingSlide.querySelector("img");

    // create new slide and displace it a little to the left or right
    const { incomingSlide, incomingImg } = this.createNewSlide(direction);

    if (this.animationOffset > 0) {
      gs.set(incomingImg, { x: direction === "left" ? -this.animationOffset : this.animationOffset });
    }

    this.sliderImages.appendChild(incomingSlide);

    if (this.animationOffset > 0 && outgoingImg) {
      gs.to(
        outgoingImg,
        { x: direction === "left" ? this.animationOffset : -this.animationOffset, duration: this.animationDuration, ease: "hop" }
      );
    }

    gs.fromTo(
      incomingSlide,
      { clipPath: direction === "left" ? this.FLAT_FROM_LEFT : this.FLAT_FROM_RIGHT },
      { clipPath: this.FULLY_VISIBLE, duration: this.animationDuration, ease: "hop" }
    );

    if (this.animationOffset > 0) {
      gs.to(incomingImg, { x: 0, duration: this.animationDuration, ease: "hop" });
    }

    this.cleanupSlides();
    this.indicatorRotation += direction === "left" ? -180 : 180;

    // animate indicators and progress bars
    this.indicators.length && gs.to(this.indicators, { rotate: this.indicatorRotation, duration: 1, ease: "hop" });
    gs.fromTo(this.progressBars[this.currentImg - 1], { width: "0%" }, { width: "100%", duration: this.slideDuration / 1000 });

    this.startSlideInterval();
  }

  handleClick(event) {
    const clickPosition = event.clientX;

    if (this.slidePreview.contains(event.target)) {
      const clickedPrev = event.target.closest(".preview");
      if (clickedPrev) {
        const clickedIndex = Array.from(this.previewSlides).indexOf(clickedPrev) + 1;
        if (clickedIndex !== this.currentImg) {
          const direction = clickedIndex < this.currentImg ? "left" : "right";
          this.currentImg = clickedIndex;
          this.animateSlide(direction);
          this.updateActiveSlidePreview();
          this.updateCounterAndTitlePosition();
        }
      }
      return;
    }

    const sliderWidth = this.sliderElement.clientWidth;

    if (clickPosition < sliderWidth / 2 && this.currentImg !== 1) {
      this.currentImg--;
      this.animateSlide("left");
    } else if (clickPosition > sliderWidth / 2 && this.currentImg !== this.totalSlides) {
      this.currentImg++;
      this.animateSlide("right");
    }

    this.updateActiveSlidePreview();
    this.updateCounterAndTitlePosition();
  }

  cleanupSlides() {
    const imgElements = this.sliderImages.querySelectorAll(".img");
    if (imgElements.length > this.totalSlides) {
      imgElements[0].remove();
    }
  }

  handleSliderStateChange(isVisible) {
    this.sliderEnabled = isVisible;

    if (isVisible) {
      this.startWithAutoplay();
      console.log(`${this.wrapper.id} slider is inview and enabled.`);
    } else {
      clearInterval(this.slideInterval);
      console.log(`${this.wrapper.id} slider is out of view and has been disabled temporarily.`);
    }
  }

  trackInitialVisibility() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { this.handleSliderStateChange(entry.isIntersecting); });
    });
  
    observer.observe(this.wrapper);
  }

  startWithAutoplay() {
    console.log(`Starting ${this.wrapper.id} slider with autoplay.`);
    this.runSlides(this.firstRun);
    this.firstRun = false;
  }

  runSlides(noIncrement) {
    if (!noIncrement) {
      this.currentImg = this.currentImg === this.totalSlides ? 1 : this.currentImg + 1;
    }
    this.animateSlide("right");
    this.updateActiveSlidePreview();
    this.updateCounterAndTitlePosition();
  }

  startSlideInterval() {
    this.slideInterval = setTimeout(() => {
      this.runSlides();
    }, this.slideDuration);
  }
}