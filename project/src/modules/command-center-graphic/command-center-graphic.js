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
    this.outerTiles = Array.from(this.element.querySelectorAll('.cc-block-item .fuller-cube-outline:not(.fco__accent)'));
    this.cornerTiles = this.element.querySelectorAll('.cc-block-item .fuller-cube-outline[data-position="corner"]');
    this.edgeTiles = this.element.querySelectorAll('.cc-block-item .fuller-cube-outline[data-position="edge"]');
    this.innerTiles = this.element.querySelectorAll('.cc-block-item .fuller-cube-outline[data-position="inner"]');
    this.centerTile = this.element.querySelector('.cc-block-item .fuller-cube-outline.fco__accent');
    
    this.log(`Total Tiles: ${this.allTiles.length}`, 'info');
    this.log(`Outer Tiles: ${this.outerTiles.length}`, 'info');
    this.log(`Center Tile: ${this.centerTile}`, 'info');
    
    // Create the tile matrix for positional animations
    this.tileMatrix = this.createTileMatrix();
    
    // Configuration objects for animations
    this.config = {
      defaultOpacity: 0.6,
      activeOpacity: 1,
      defaultColor: 'currentColor',
      activeColor: 'white',
      timing: {
        entranceStagger: 0.04,
        entranceDuration: 0.6,
        animationDuration: 0.4,
        activeStateDuration: 2,
        pauseBetweenAnimations: 3,
        concentricStagger: 0.15
      },
      easing: {
        entrance: 'power2.out',
        animation: 'power2.inOut',
        return: 'power1.inOut'
      }
    };
    
    // Animation settings
    this.currentAnimation = 0;
    this.animations = [
      this.pulseAnimation.bind(this),
      this.waveAnimation.bind(this),
      this.concentricAnimation.bind(this),
      this.randomConnectionAnimation.bind(this)
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

  // Get tiles in concentric order (from center outward)
  getConcentricLayers() {
    // Center (layer 0)
    const centerLayer = [this.centerTile];
    
    // Inner ring (layer 1) - tiles directly adjacent to center
    const innerRing = [
      this.tileMatrix[1][2], // top
      this.tileMatrix[2][3], // right
      this.tileMatrix[3][2], // bottom
      this.tileMatrix[2][1], // left
      this.tileMatrix[1][1], // top-left
      this.tileMatrix[1][3], // top-right
      this.tileMatrix[3][3], // bottom-right
      this.tileMatrix[3][1]  // bottom-left
    ];
    
    // Outer ring (layer 2) - everything else
    const outerRing = [
      // Top row
      this.tileMatrix[0][0],
      this.tileMatrix[0][1],
      this.tileMatrix[0][2],
      this.tileMatrix[0][3],
      this.tileMatrix[0][4],
      // Right column (excluding corner)
      this.tileMatrix[1][4],
      this.tileMatrix[2][4],
      this.tileMatrix[3][4],
      // Bottom row
      this.tileMatrix[4][4],
      this.tileMatrix[4][3],
      this.tileMatrix[4][2],
      this.tileMatrix[4][1],
      this.tileMatrix[4][0],
      // Left column (excluding corner)
      this.tileMatrix[3][0],
      this.tileMatrix[2][0],
      this.tileMatrix[1][0]
    ];
    
    return [centerLayer, innerRing, outerRing];
  }

  init() {
    // Set initial state - all tiles invisible
    gsap.set(this.allTiles, { 
      opacity: 0
    });

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

    // First, fade in center tile
    timeline.to(this.centerTile, {
      opacity: this.config.defaultOpacity,
      duration: this.config.timing.entranceDuration,
      ease: this.config.easing.entrance
    });

    // Shuffle outer tiles for random appearance
    const shuffledTiles = [...this.outerTiles].sort(() => Math.random() - 0.5);

    // Then fade in all other tiles randomly with stagger
    timeline.to(shuffledTiles, {
      opacity: this.config.defaultOpacity,
      duration: this.config.timing.entranceDuration,
      stagger: this.config.timing.entranceStagger,
      ease: this.config.easing.entrance
    });
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
      }, this.config.timing.pauseBetweenAnimations * 1000);
    });
  }

  // Animation 1: Pulse animation (ripple out from center) - kept but not used in current sequence
  pulseAnimation() {
    this.log('Running pulse animation');
    const tl = gsap.timeline();
    
    // Define layers from center outward
    const [centerLayer, innerRing, outerRing] = this.getConcentricLayers();
    
    // Pulse from center outward
    tl.to(centerLayer, { 
      scale: 1.1, 
      opacity: this.config.activeOpacity, 
      duration: this.config.timing.animationDuration, 
      ease: this.config.easing.animation 
    })
    .to(centerLayer, { 
      scale: 1, 
      opacity: this.config.defaultOpacity, 
      duration: this.config.timing.animationDuration, 
      ease: this.config.easing.return 
    }, '+=0.1')
    .to(innerRing, { 
      scale: 1.1, 
      opacity: this.config.activeOpacity, 
      stagger: 0.05, 
      duration: this.config.timing.animationDuration, 
      ease: this.config.easing.animation 
    }, '-=0.3')
    .to(innerRing, { 
      scale: 1, 
      opacity: this.config.defaultOpacity, 
      stagger: 0.05, 
      duration: this.config.timing.animationDuration, 
      ease: this.config.easing.return 
    }, '-=0.1')
    .to(outerRing, { 
      scale: 1.1, 
      opacity: this.config.activeOpacity, 
      stagger: 0.03, 
      duration: this.config.timing.animationDuration, 
      ease: this.config.easing.animation 
    }, '-=0.4')
    .to(outerRing, { 
      scale: 1, 
      opacity: this.config.defaultOpacity, 
      stagger: 0.03, 
      duration: this.config.timing.animationDuration, 
      ease: this.config.easing.return 
    });
    
    return tl;
  }

  // Animation 2: Wave animation (horizontal waves) - kept but not used in current sequence
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
        opacity: this.config.activeOpacity,
        duration: this.config.timing.animationDuration,
        stagger: 0.08,
        ease: this.config.easing.animation
      }, i * 0.2)
      .to(row, {
        y: 0,
        opacity: this.config.defaultOpacity,
        duration: this.config.timing.animationDuration,
        stagger: 0.08,
        ease: this.config.easing.return
      }, i * 0.2 + 0.4);
    }
    
    return tl;
  }

  // Animation 3: Concentric animation (emanates out from center)
  concentricAnimation() {
    this.log('Running concentric animation');
    const tl = gsap.timeline();
    
    // Get layers from center outward
    const [centerLayer, innerRing, outerRing] = this.getConcentricLayers();

    // Animate center layer
    tl.to(centerLayer, {
      scale: 1.1,
      opacity: this.config.activeOpacity,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    });
    
    // Animate inner ring
    tl.to(innerRing, {
      scale: 1.1,
      opacity: this.config.activeOpacity,
      stagger: 0.05,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    }, `-=${this.config.timing.concentricStagger}`);
    
    // Animate outer ring
    tl.to(outerRing, {
      scale: 1.1,
      opacity: this.config.activeOpacity,
      stagger: 0.03,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    }, `-=${this.config.timing.concentricStagger}`);

    // Return all to default state
    tl.to([...centerLayer, ...innerRing, ...outerRing], {
      scale: 1,
      opacity: this.config.defaultOpacity,
      duration: this.config.timing.animationDuration,
      stagger: 0.03,
      ease: this.config.easing.return
    }, `+=${this.config.timing.activeStateDuration}`);
    
    return tl;
  }

  // Animation 4: Random Connection (light up center and random tile)
  randomConnectionAnimation() {
    this.log('Running random connection animation');
    const tl = gsap.timeline();
    
    // Get a random outer tile
    const randomIndex = Math.floor(Math.random() * this.outerTiles.length);
    const randomTile = this.outerTiles[randomIndex];
    
    // Light up center tile
    tl.to(this.centerTile, {
      opacity: this.config.activeOpacity,
      color: this.config.activeColor,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    });
    
    // Light up random tile
    tl.to(randomTile, {
      opacity: this.config.activeOpacity,
      color: this.config.activeColor,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    }, `-=${this.config.timing.animationDuration / 2}`);
    
    // Hold for specified duration
    tl.to({}, { duration: this.config.timing.activeStateDuration });
    
    // Return to default state
    tl.to([this.centerTile, randomTile], {
      opacity: this.config.defaultOpacity,
      color: this.config.defaultColor,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.return
    });
    
    // After 1 second, run concentric animation
    tl.add(() => {
      setTimeout(() => {
        this.concentricAnimation();
      }, 1000);
    });
    
    return tl;
  }
}