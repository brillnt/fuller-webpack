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
    
    // Select tiles by position for better animation control
    this.allTiles = this.element.querySelectorAll('.cc-block-item .fuller-cube-outline');
    this.cornerTiles = this.element.querySelectorAll('.cc-block-item .fuller-cube-outline[data-position="corner"]');
    this.edgeTiles = this.element.querySelectorAll('.cc-block-item .fuller-cube-outline[data-position="edge"]');
    this.innerTiles = this.element.querySelectorAll('.cc-block-item .fuller-cube-outline[data-position="inner"]');
    this.centerTile = this.element.querySelector('.cc-block-item .fuller-cube-outline.fco__accent');
    
    this.log(`Corner Tiles: ${this.cornerTiles.length}`, 'info');
    this.log(`Edge Tiles: ${this.edgeTiles.length}`, 'info');
    this.log(`Inner Tiles: ${this.innerTiles.length}`, 'info');
    this.log(`Center Tile: ${this.centerTile}`, 'info');
    
    // Create the tile matrix for positional animations
    this.tileMatrix = this.createTileMatrix();
    
    // Animation settings
    this.animationDelay = 3000;
    this.currentAnimation = 0;
    this.animations = [
      this.pulseAnimation.bind(this),
      this.waveAnimation.bind(this),
      this.spiralAnimation.bind(this),
      this.shuffleAnimation.bind(this)
    ];
    
    this.init();
  }

  createTileMatrix() {
    // Create a 5×5 matrix map of tiles by their position
    const matrix = Array(5).fill().map(() => Array(5).fill(null));
    
    // Map all tiles to their positions in the matrix
    this.allTiles.forEach(tile => {
      if (tile.classList.contains('fco__accent')) {
        // Center tile special case
        matrix[2][2] = tile;
      } else {
        const row = parseInt(tile.getAttribute('data-row'));
        const col = parseInt(tile.getAttribute('data-col'));
        
        if (!isNaN(row) && !isNaN(col) && row >= 0 && row < 5 && col >= 0 && col < 5) {
          matrix[row][col] = tile;
        }
      }
    });
    
    return matrix;
  }

  init() {
    // Set initial state
    gsap.set([...this.cornerTiles, ...this.edgeTiles, ...this.innerTiles], { 
      scale: 0.95,
      opacity: 0 
    });
    gsap.set(this.centerTile, { scale: 0.8, opacity: 0 });

    // Create entrance animation
    this.createEntranceAnimation();
  }

  createEntranceAnimation() {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: this.element,
        start: 'top 60%',
        toggleActions: 'play none none reset'
      },
      onComplete: () => {
        this.log('Entrance animation complete, starting animation sequence');
        this.startAnimationSequence();
      }
    });

    // Corners first
    timeline.to(this.cornerTiles, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Then edges
    timeline.to(this.edgeTiles, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.3');

    // Then inner tiles
    timeline.to(this.innerTiles, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.3');

    // Finally center
    timeline.to(this.centerTile, {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)'
    }, '-=0.2');
  }

  startAnimationSequence() {
    // Run the first animation
    this.runNextAnimation();
  }

  runNextAnimation() {
    // Run current animation and set up next one
    const animation = this.animations[this.currentAnimation];
    this.log(`Running animation: ${this.currentAnimation}`);
    
    // Create timeline for this animation
    const tl = animation();
    
    // When animation completes, queue up the next one
    tl.eventCallback('onComplete', () => {
      // Move to next animation in sequence
      this.currentAnimation = (this.currentAnimation + 1) % this.animations.length;
      // Pause before next animation
      setTimeout(() => {
        this.runNextAnimation();
      }, this.animationDelay);
    });
  }

  // Animation 1: Pulse animation (ripple out from center)
  pulseAnimation() {
    this.log('Running pulse animation');
    const tl = gsap.timeline();
    
    // Define layers from center outward
    const center = this.centerTile;
    const layer1 = [...this.innerTiles]; 
    const layer2 = [...this.edgeTiles];
    const layer3 = [...this.cornerTiles];
    
    // Pulse from center outward
    tl.to(center, { scale: 1.1, duration: 0.4, ease: 'power1.out' })
      .to(center, { scale: 1, duration: 0.4, ease: 'power1.in' }, '+=0.1')
      .to(layer1, { scale: 1.1, stagger: 0.05, duration: 0.3, ease: 'power1.out' }, '-=0.3')
      .to(layer1, { scale: 1, stagger: 0.05, duration: 0.3, ease: 'power1.in' }, '-=0.1')
      .to(layer2, { scale: 1.1, stagger: 0.04, duration: 0.3, ease: 'power1.out' }, '-=0.3')
      .to(layer2, { scale: 1, stagger: 0.04, duration: 0.3, ease: 'power1.in' }, '-=0.1')
      .to(layer3, { scale: 1.1, stagger: 0.04, duration: 0.3, ease: 'power1.out' }, '-=0.3')
      .to(layer3, { scale: 1, stagger: 0.04, duration: 0.3, ease: 'power1.in' });
    
    return tl;
  }

  // Animation 2: Wave animation (horizontal waves)
  waveAnimation() {
    this.log('Running wave animation');
    const tl = gsap.timeline();
    
    // Get tiles by row
    for (let i = 0; i < 5; i++) {
      const row = Array.from(this.allTiles).filter(
        tile => tile.getAttribute('data-row') === i.toString()
      );
      
      // Create wave effect with slight y movement and opacity
      tl.to(row, {
        y: -10,
        opacity: 0.7,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out'
      }, i * 0.2)
      .to(row, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.in'
      }, i * 0.2 + 0.4);
    }
    
    return tl;
  }

  // Animation 3: Spiral animation (spiral from outside to center and back)
  spiralAnimation() {
    this.log('Running spiral animation');
    const tl = gsap.timeline();
    
    // Create a spiral sequence (outside to inside)
    const spiralSequence = [
      // Top row (left to right)
      ...Array.from({length: 5}, (_, i) => ({ row: 0, col: i })),
      // Right column (excluding top corner, top to bottom)
      ...Array.from({length: 4}, (_, i) => ({ row: i + 1, col: 4 })),
      // Bottom row (right to left, excluding bottom right)
      ...Array.from({length: 4}, (_, i) => ({ row: 4, col: 3 - i })),
      // Left column (bottom to top, excluding corners)
      ...Array.from({length: 3}, (_, i) => ({ row: 3 - i, col: 0 })),
      // Second row (left to right, excluding edges)
      ...Array.from({length: 3}, (_, i) => ({ row: 1, col: i + 1 })),
      // Fourth row (right to left, excluding edges)
      ...Array.from({length: 3}, (_, i) => ({ row: 3, col: 3 - i })),
      // Third row (left to right, excluding center)
      { row: 2, col: 1 },
      { row: 2, col: 3 },
      // Center
      { row: 2, col: 2 }
    ];
    
    // Get tiles in spiral order
    const spiralTiles = spiralSequence
      .map(pos => this.tileMatrix[pos.row][pos.col])
      .filter(tile => tile !== null);
    
    // Animate the spiral
    tl.to(spiralTiles, {
      scale: 1.1,
      opacity: 0.8,
      duration: 0.15,
      stagger: 0.05,
      ease: 'power1.inOut'
    })
    .to(spiralTiles, {
      scale: 1,
      opacity: 1,
      duration: 0.15,
      stagger: 0.05,
      ease: 'power1.inOut'
    }, 0.1);
    
    // Reverse the spiral
    tl.to(spiralTiles.slice().reverse(), {
      scale: 1.1,
      opacity: 0.8,
      duration: 0.15,
      stagger: 0.05,
      ease: 'power1.inOut'
    }, '+=0.5')
    .to(spiralTiles.slice().reverse(), {
      scale: 1,
      opacity: 1,
      duration: 0.15,
      stagger: 0.05,
      ease: 'power1.inOut'
    }, '+=0.1');
    
    return tl;
  }

  // Animation 4: Shuffle animation (random tiles light up)
  shuffleAnimation() {
    this.log('Running shuffle animation');
    const tl = gsap.timeline();
    
    // Get all tiles except center
    const tiles = [...this.cornerTiles, ...this.edgeTiles, ...this.innerTiles];
    
    // Shuffle array
    const shuffled = [...tiles].sort(() => Math.random() - 0.5);
    
    // Pick a subset for first pattern (~1/3 of tiles)
    const subset1 = shuffled.slice(0, Math.floor(tiles.length / 3));
    
    // Pick a different subset for second pattern (~1/3 of tiles)
    const subset2 = shuffled.slice(
      Math.floor(tiles.length / 3), 
      Math.floor(tiles.length * 2 / 3)
    );
    
    // Pick yet another subset (~1/3 of tiles)
    const subset3 = shuffled.slice(Math.floor(tiles.length * 2 / 3));
    
    // Animate pattern 1
    tl.to(subset1, {
      scale: 1.1,
      opacity: 0.8,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power1.out'
    })
    .to(subset1, {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power1.in'
    }, '+=0.1');
    
    // Animate pattern 2
    tl.to(subset2, {
      scale: 1.1,
      opacity: 0.8,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power1.out'
    }, '+=0.3')
    .to(subset2, {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power1.in'
    }, '+=0.1');
    
    // Animate pattern 3
    tl.to(subset3, {
      scale: 1.1,
      opacity: 0.8,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power1.out'
    }, '+=0.3')
    .to(subset3, {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power1.in'
    }, '+=0.1');
    
    // Finish with center tile
    tl.to(this.centerTile, {
      scale: 1.15,
      duration: 0.4,
      ease: 'power2.out'
    }, '+=0.2')
    .to(this.centerTile, {
      scale: 1,
      duration: 0.4,
      ease: 'elastic.out(1, 0.3)'
    }, '+=0.1');
    
    return tl;
  }
}