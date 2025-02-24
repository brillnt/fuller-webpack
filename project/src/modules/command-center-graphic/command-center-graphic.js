import { select, selectId } from '../../utils/helpers.js';
import Base from '../base/base.js';
import { gsap } from '../../utils/animation.js';

export default class CommandCenterGraphic extends Base {
  constructor(elementId, debug = false) {
    super(debug);

    if (!elementId) {
      this.log('No element ID provided. Please provide a valid ID.', 'error');
      return;
    }

    this.elementId = elementId;
    this.element = selectId(elementId);
    if (!this.element) {
      this.log(`Element with ID "${elementId}" not found. Please provide a valid ID.`, 'error');
      return;
    }

    this.log(`Initializing with ID "${elementId}"`, 'info');

    this.tiles = this.element.querySelectorAll('.cc-block-item .fuller-cube-outline:not(.fco__accent)');
    this.log(`Tiles: ${this.tiles}`, 'info');
    this.centerTile = this.element.querySelector('.cc-block-item .fuller-cube-outline.fco__accent');
    this.log(`Center Tile: ${this.centerTile}`, 'info');
    this.init();
  }

  init() {
    // Initialize your module here
    gsap.set(this.tiles, { x: -20, opacity: 0 });
    gsap.set(this.centerTile, { y: 20, opacity: 0 });

    gsap.to(this.tiles, {
      x: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 1,
      ease: 'power4.out',
      delay: 1.5,
      scrollTrigger: {
        trigger: this.element,
        start: 'top 40%',
        toggleActions: 'play none none reverse',
      },
      onComplete: () => {
        this.startTileAnimation();
      },
    });

    gsap.to(this.centerTile, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: this.element,
        start: 'top 40%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  startTileAnimation() {
    const initialPositions = Array.from(this.tiles).map(tile => {
      const rect = tile.getBoundingClientRect();
      return { x: rect.left, y: rect.top };
    });

    const clockwiseOrder = [0, 1, 2, 4, 7, 6, 5, 3];
    const counterClockwiseOrder = [0, 3, 5, 6, 7, 4, 2, 1];

    const moveTiles = (order) => {
      const newPositions = order.map(index => initialPositions[index]);

      this.tiles.forEach((tile, index) => {
        const dx = newPositions[index].x - initialPositions[index].x;
        const dy = newPositions[index].y - initialPositions[index].y;
        gsap.to(tile, {
          x: `+=${dx}`,
          y: `+=${dy}`,
          duration: 1,
          ease: 'power4.out',
        });
      });

      initialPositions.splice(0, initialPositions.length, ...newPositions);
    };

    const animateTiles = () => {
      moveTiles(clockwiseOrder);
      setTimeout(() => {
        moveTiles(clockwiseOrder);
        setTimeout(() => {
          moveTiles(counterClockwiseOrder);
          setTimeout(() => {
            moveTiles(counterClockwiseOrder);
            setTimeout(animateTiles, 3000);
          }, 3000);
        }, 3000);
      }, 3000);
    };

    setTimeout(animateTiles, 3000);
  }
}