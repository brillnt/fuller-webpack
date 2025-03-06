import { select, selectId } from '../../utils/helpers.js';
import Base from '../base/base.js';
import { gsap } from '../../utils/animation.js';

import './command-center-graphic.css';

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
    // Convert NodeList to Array for easier manipulation
    this.tiles = Array.from(this.element.querySelectorAll('.cc-block-item .fuller-cube-outline:not(.fco__accent)'));
    this.log(`Found ${this.tiles.length} tiles`, 'info');
    this.centerTile = this.element.querySelector('.cc-block-item .fuller-cube-outline.fco__accent');
    this.log(`Center Tile: ${this.centerTile}`, 'info');
    this.animationDelay = 3000;
    this.staggerDelay = 0.022;
    this.iterationCount = 0;
    this.init();
  }

  init() {
    // Initialize with reveal animations
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
        this.log(`Reveal animation complete. Starting tile movement sequence...`);
        // After the reveal animation completes, start our animation sequence
        setTimeout(() => this.startAnimationSequence(), this.animationDelay);
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

  startAnimationSequence() {
    this.log('Starting continuous animation sequence');
    this.animateNextIteration();
  }

  animateNextIteration() {
    this.iterationCount++;
    const isSpecialIteration = this.iterationCount % 3 === 0;
    
    this.log(`Animation iteration ${this.iterationCount}, Special: ${isSpecialIteration}`);
    
    if (isSpecialIteration) {
      // Every third iteration gets special treatment with back easing and counter-clockwise movement
      this.moveCounterClockwise('power4.inOut', 1.2);
    } else {
      // Normal iteration with regular easing and clockwise movement
      this.moveClockwise('expo.out', 1);
    }
    
    // Schedule the next iteration
    if (isSpecialIteration) {
      setTimeout(() => this.animateNextIteration(), (this.animationDelay/2));
    } else {
      setTimeout(() => this.animateNextIteration(), this.animationDelay);
    }
  }

  // Get the current positions of all tiles
  getTilePositions() {
    const positions = [
      { name: 'top-left', index: 0 },
      { name: 'top-middle', index: 1 },
      { name: 'top-right', index: 2 },
      { name: 'middle-left', index: 3 },
      { name: 'middle-right', index: 4 },
      { name: 'bottom-left', index: 5 },
      { name: 'bottom-middle', index: 6 },
      { name: 'bottom-right', index: 7 }
    ];
    
    // Get the exact coordinates of each position from the current tiles
    positions.forEach(pos => {
      const tile = this.tiles[pos.index];
      const rect = tile.getBoundingClientRect();
      pos.x = rect.left;
      pos.y = rect.top;
      this.log(`Position ${pos.name} (${pos.index}): (${pos.x}, ${pos.y})`);
    });
    
    return positions;
  }

  moveClockwise(easing = 'power2.inOut', duration = 1.5) {
    this.log(`Moving tiles clockwise with ${easing} easing`);
    
    const positions = this.getTilePositions();
    
    // Define the clockwise movement pattern based on actual DOM order
    const moveTargets = [
      1,  // DOM tile 0 (top-left) moves to position 1 (top-middle) 
      2,  // DOM tile 1 (top-middle) moves to position 2 (top-right)
      4,  // DOM tile 2 (top-right) moves to position 4 (middle-right)
      0,  // DOM tile 3 (middle-left) moves to position 0 (top-left)
      7,  // DOM tile 4 (middle-right) moves to position 7 (bottom-right)
      3,  // DOM tile 5 (bottom-left) moves to position 3 (middle-left)
      5,  // DOM tile 6 (bottom-middle) moves to position 5 (bottom-left)
      6   // DOM tile 7 (bottom-right) moves to position 6 (bottom-middle)
    ];
    
    // Animate each tile to its target position
    this.tiles.forEach((tile, index) => {
      // Find where this tile should move to
      const targetPosition = positions[moveTargets[index]];
      
      // Calculate the required movement
      const currentRect = tile.getBoundingClientRect();
      const dx = targetPosition.x - currentRect.left;
      const dy = targetPosition.y - currentRect.top;
      
      this.log(`Moving tile ${index} to ${targetPosition.name} (position ${moveTargets[index]})`);
      
      // Animate the tile to the new position
      gsap.to(tile, {
        x: `+=${dx}`,
        y: `+=${dy}`,
        duration: duration,
        delay: index * this.staggerDelay,
        ease: easing,
        onStart: () => {
          this.log(`Starting clockwise animation for tile ${index}`);
        },
        onComplete: () => {
          this.log(`Completed clockwise animation for tile ${index}`);
        }
      });
    });
  }

  moveCounterClockwise(easing = 'power2.inOut', duration = 1.5) {
    this.log(`Moving tiles counter-clockwise with ${easing} easing`);
    
    const positions = this.getTilePositions();
    
    // Define the counter-clockwise movement pattern
    const moveTargets = [
      3,  // DOM tile 0 (top-left) → position 3 (middle-left)
      0,  // DOM tile 1 (top-middle) → position 0 (top-left)
      1,  // DOM tile 2 (top-right) → position 1 (top-middle)
      5,  // DOM tile 3 (middle-left) → position 5 (bottom-left)
      2,  // DOM tile 4 (middle-right) → position 2 (top-right)
      6,  // DOM tile 5 (bottom-left) → position 6 (bottom-middle)
      7,  // DOM tile 6 (bottom-middle) → position 7 (bottom-right)
      4   // DOM tile 7 (bottom-right) → position 4 (middle-right)
    ];
    
    // Animate each tile to its target position
    this.tiles.forEach((tile, index) => {
      // Find where this tile should move to
      const targetPosition = positions[moveTargets[index]];
      
      // Calculate the required movement
      const currentRect = tile.getBoundingClientRect();
      const dx = targetPosition.x - currentRect.left;
      const dy = targetPosition.y - currentRect.top;
      
      this.log(`Moving tile ${index} to ${targetPosition.name} (position ${moveTargets[index]})`);
      
      // Animate the tile to the new position with a special easing
      gsap.to(tile, {
        x: `+=${dx}`,
        y: `+=${dy}`,
        duration: duration,
        delay: index * this.staggerDelay,
        ease: easing,
        onStart: () => {
          this.log(`Starting counter-clockwise animation for tile ${index}`);
        },
        onComplete: () => {
          this.log(`Completed counter-clockwise animation for tile ${index}`);
        }
      });
    });
  }
}
