import { select, selectId } from '../../utils/helpers.js';
import Base from '../base/base.js';
import { gsap } from '../../utils/animation.js';

import './command-center-graphic.css';

/**
 * CommandCenterGraphic - Manages animated tile movement patterns
 * with configurable animation properties
 */
export default class CommandCenterGraphic extends Base {
  /**
   * Creates a new CommandCenterGraphic instance
   * @param {string} elementId - ID of the container element
   * @param {Object} config - Optional configuration to override defaults
   * @param {boolean} debug - Enable debug logging
   */
  constructor(elementId, config = {}, debug = false) {
    super(debug);

    // Default configuration
    this.defaultConfig = {
      // Timing
      initialDelay: 1.5,        // Delay before reveal animation (seconds)
      animationDelay: 3000,     // Delay between iterations (milliseconds)
      specialIterationDelay: 1500, // Delay after special iterations (milliseconds)
      staggerDelay: 0.022,      // Delay between each tile animation (seconds)
      
      // Durations
      revealDuration: 1,
      regularDuration: 0.7,
      specialDuration: 1,
      
      // Easing
      revealEasing: 'power4.out',     // Easing for reveal animation
      regularEasing: 'expo.out',      // Easing for regular iterations
      specialEasing: 'power4.inOut',  // Easing for special iterations
      
      // Pattern
      specialIterationInterval: 3,    // Every nth iteration is special
      
      // ScrollTrigger
      scrollTriggerStart: 'top 40%',  // When to trigger animation
      scrollTriggerActions: 'play none none reverse' // ScrollTrigger behavior
    };
    
    // Merge provided config with defaults
    this.config = { ...this.defaultConfig, ...config };

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
    this.iterationCount = 0;
    
    // Initialize the component
    this.init();
  }

  /**
   * Initialize component with reveal animations
   */
  init() {
    // Initialize with reveal animations
    gsap.set(this.tiles, { x: -20, opacity: 0 });
    gsap.set(this.centerTile, { y: 20, opacity: 0 });

    // Animate peripheral tiles
    gsap.to(this.tiles, {
      x: 0,
      opacity: 1,
      stagger: 0.1,
      duration: this.config.revealDuration,
      ease: this.config.revealEasing,
      delay: this.config.initialDelay,
      scrollTrigger: {
        trigger: this.element,
        start: this.config.scrollTriggerStart,
        toggleActions: this.config.scrollTriggerActions,
      },
      onComplete: () => {
        this.log(`Reveal animation complete. Starting tile movement sequence...`);
        // After the reveal animation completes, start our animation sequence
        setTimeout(() => this.startAnimationSequence(), this.config.animationDelay);
      },
    });

    // Animate center tile
    gsap.to(this.centerTile, {
      y: 0,
      opacity: 1,
      duration: this.config.revealDuration,
      ease: this.config.revealEasing,
      scrollTrigger: {
        trigger: this.element,
        start: this.config.scrollTriggerStart,
        toggleActions: this.config.scrollTriggerActions,
      },
    });
  }

  /**
   * Start continuous animation sequence
   */
  startAnimationSequence() {
    this.log('Starting continuous animation sequence');
    this.animateNextIteration();
  }

  /**
   * Animate the next iteration in the sequence
   */
  animateNextIteration() {
    this.iterationCount++;
    const isSpecialIteration = this.iterationCount % this.config.specialIterationInterval === 0;
    
    this.log(`Animation iteration ${this.iterationCount}, Special: ${isSpecialIteration}`);
    
    if (isSpecialIteration) {
      // Special iteration with special easing and counter-clockwise movement
      this.moveTiles('counterClockwise', {
        easing: this.config.specialEasing,
        duration: this.config.specialDuration
      });
      
      // Schedule the next iteration with shorter delay
      setTimeout(() => this.animateNextIteration(), this.config.specialIterationDelay);
    } else {
      // Normal iteration with regular easing and clockwise movement
      this.moveTiles('clockwise', {
        easing: this.config.regularEasing,
        duration: this.config.regularDuration
      });
      
      // Schedule the next iteration
      setTimeout(() => this.animateNextIteration(), this.config.animationDelay);
    }
  }

  /**
   * Move tiles in specified direction with given options
   * @param {string} direction - 'clockwise' or 'counterClockwise'
   * @param {Object} options - Animation options
   */
  moveTiles(direction, options = {}) {
    const easing = options.easing || this.config.regularEasing;
    const duration = options.duration || this.config.regularDuration;
    
    this.log(`Moving tiles ${direction} with ${easing} easing`);
    
    const positions = this.getTilePositions();
    
    // Get the appropriate movement pattern based on direction
    const moveTargets = this.getMovementPattern(direction);
    
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
        // delay: index * this.config.staggerDelay,
        ease: easing,
        onStart: () => {
          this.log(`Starting ${direction} animation for tile ${index}`);
        },
        onComplete: () => {
          this.log(`Completed ${direction} animation for tile ${index}`);
        }
      });
    });
  }

  /**
   * Get the movement pattern based on direction
   * @param {string} direction - 'clockwise' or 'counterClockwise'
   * @returns {Array} Array of target indices for each tile
   */
  getMovementPattern(direction) {
    if (direction === 'clockwise') {
      // Define the clockwise movement pattern 
      return [
        1,  // DOM tile 0 (top-left) moves to position 1 (top-middle) 
        2,  // DOM tile 1 (top-middle) moves to position 2 (top-right)
        4,  // DOM tile 2 (top-right) moves to position 4 (middle-right)
        0,  // DOM tile 3 (middle-left) moves to position 0 (top-left)
        7,  // DOM tile 4 (middle-right) moves to position 7 (bottom-right)
        3,  // DOM tile 5 (bottom-left) moves to position 3 (middle-left)
        5,  // DOM tile 6 (bottom-middle) moves to position 5 (bottom-left)
        6   // DOM tile 7 (bottom-right) moves to position 6 (bottom-middle)
      ];
    } else {
      // Define the counter-clockwise movement pattern
      return [
        3,  // DOM tile 0 (top-left) → position 3 (middle-left)
        0,  // DOM tile 1 (top-middle) → position 0 (top-left)
        1,  // DOM tile 2 (top-right) → position 1 (top-middle)
        5,  // DOM tile 3 (middle-left) → position 5 (bottom-left)
        2,  // DOM tile 4 (middle-right) → position 2 (top-right)
        6,  // DOM tile 5 (bottom-left) → position 6 (bottom-middle)
        7,  // DOM tile 6 (bottom-middle) → position 7 (bottom-right)
        4   // DOM tile 7 (bottom-right) → position 4 (middle-right)
      ];
    }
  }

  /**
   * Get the current positions of all tiles
   * @returns {Array} Array of position objects with coordinates
   */
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

  /**
   * Update configuration values
   * @param {Object} newConfig - New configuration values to apply
   */
  updateConfig(newConfig = {}) {
    this.config = { ...this.config, ...newConfig };
    this.log('Configuration updated:', 'info');
    this.log(this.config, 'info');
  }

  /**
   * Reset animation sequence
   */
  reset() {
    this.iterationCount = 0;
    this.log('Animation sequence reset');
  }

  /**
   * Stop animation sequence
   */
  stop() {
    // Clear any pending timeouts
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    this.log('Animation sequence stopped');
  }
}