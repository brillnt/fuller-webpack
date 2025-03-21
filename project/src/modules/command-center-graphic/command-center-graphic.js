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
      centerTileOpacity: 0.9,
      activeOpacity: 1,
      defaultColor: '#588e91',
      activeColor: 'white',
      centerColor: 'white',  // Center tile is always white
      timing: {
        entranceStagger: 0.04,
        entranceDuration: 0.6,
        animationDuration: 0.4,
        activeStateDuration: 1,
        pauseBetweenAnimations: 3,
        concentricStagger: 0.05  // Time between layers (not within layer)
      },
      easing: {
        entrance: 'power4.out',
        animation: 'expo.out',
        return: 'expo.out'
      }
    };
    
    // Animation settings
    this.currentAnimation = 0;
    this.animations = [
      this.concentricAnimation.bind(this),
      this.randomConnectionAnimation.bind(this),
      this.waveAnimation.bind(this),
      this.pulseAnimation.bind(this)
    ];
    
    // Animation names for debug display
    this.animationNames = ['Concentric', 'Random Connection', 'Wave', 'Pulse'];
    
    // Create debug display if debug mode is enabled
    if (debug) {
      this.createDebugDisplay();
    }
    
    this.init();
  }

  createDebugDisplay() {
    // Create debug display element
    this.debugDisplay = document.createElement('div');
    this.debugDisplay.className = 'cc-debug-display';
    this.debugDisplay.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      z-index: 10;
      font-family: monospace;
      pointer-events: none;
    `;
    
    // Add to parent element
    this.element.style.position = 'relative'; // Ensure parent has positioning
    this.element.appendChild(this.debugDisplay);
    
    // Set initial text
    this.updateDebugDisplay('Initializing...');
  }
  
  updateDebugDisplay(text) {
    if (this.debugDisplay) {
      this.debugDisplay.textContent = text;
    }
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
    gsap.set(this.outerTiles, { 
      opacity: 0,
      color: this.config.defaultColor
    });
    
    gsap.set(this.centerTile, {
      opacity: 0,
      color: this.config.centerColor
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
        this.updateDebugDisplay('Entrance Complete');
        this.startAnimationSequence();
      }
    });

    // First, fade in center tile
    timeline.to(this.centerTile, {
      opacity: this.config.centerTileOpacity,
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
    const animationName = this.animationNames[this.currentAnimation];
    
    this.log(`Running animation: ${animationName}`);
    this.updateDebugDisplay(`DEBUG MODE - Animation: ${animationName}, Pause: ${this.config.timing.pauseBetweenAnimations}s`);
    
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

  // Animation 1: Pulse animation (kept but not used in current sequence)
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
      opacity: this.config.centerTileOpacity, 
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

  // Animation 2: Wave animation (kept but not used in current sequence)
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

  // Animation 3: Concentric animation with cascading return to default
  concentricAnimation() {
    this.log('Running concentric animation');
    const tl = gsap.timeline();
    
    // Get layers from center outward
    const [centerLayer, innerRing, outerRing] = this.getConcentricLayers();

    // Timing variables
    const animDuration = this.config.timing.animationDuration * 0.5;
    const layerDelay = this.config.timing.concentricStagger;

    // Animate center layer
    tl.to(centerLayer, {
      scale: 1.1,
      opacity: this.config.activeOpacity,
      duration: animDuration,
      ease: this.config.easing.animation
    });
    
    // Start inner ring animation
    tl.to(innerRing, {
      scale: 1.1,
      opacity: this.config.activeOpacity,
      duration: animDuration,
      ease: this.config.easing.animation
    }, `+=${layerDelay}`);
    
    // At same time inner ring starts, center returns to default
    tl.to(centerLayer, {
      scale: 1,
      opacity: this.config.centerTileOpacity,
      duration: animDuration,
      ease: this.config.easing.return
    }, `-=${animDuration}`); // Start at same time as inner ring animation
    
    // Start outer ring animation
    tl.to(outerRing, {
      scale: 1.1,
      opacity: this.config.activeOpacity,
      duration: animDuration,
      ease: this.config.easing.animation
    }, `+=${layerDelay}`);
    
    // At same time outer ring starts, inner ring returns to default
    tl.to(innerRing, {
      scale: 1,
      opacity: this.config.defaultOpacity,
      duration: animDuration * 2.5,
      ease: this.config.easing.return
    }, `-=${animDuration}`); // Start at same time as outer ring animation
    
    // Immediately after outer ring finishes lighting up, it returns to default
    tl.to(outerRing, {
      scale: 1,
      opacity: this.config.defaultOpacity,
      duration: animDuration * 2.5,
      ease: this.config.easing.return
    });
    
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
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    });
    
    // Light up random tile and change its color to white
    tl.to(randomTile, {
      opacity: this.config.activeOpacity,
      color: this.config.activeColor,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    }, `-=${this.config.timing.animationDuration / 2}`);
    
    // Hold for specified duration
    tl.to({}, { duration: this.config.timing.activeStateDuration });
    
    // Return to default state
    tl.to(this.centerTile, {
      opacity: this.config.centerTileOpacity,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.return
    });
    
    tl.to(randomTile, {
      opacity: this.config.defaultOpacity,
      color: this.config.defaultColor,  // Return to default teal color
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.return
    }, `-=${this.config.timing.animationDuration}`);
    
    // After 1 second, run concentric animation and update debug display
    tl.add(() => {
      this.updateDebugDisplay('Animation: Concentric (Triggered)');
      setTimeout(() => {
        this.concentricAnimation();
      }, 1000);
    });
    
    return tl;
  }
}