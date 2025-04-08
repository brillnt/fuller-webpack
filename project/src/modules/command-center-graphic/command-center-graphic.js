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
      // Update config values for animation timing
      timing: {
        entranceStagger: 0.04,
        entranceDuration: 0.5,      // Slightly shorter duration for faster animations
        animationDuration: 0.6,     // Shorter animation duration for more fluidity
        activeStateDuration: 0.8,   // Base active state duration
        pauseBetweenAnimations: 1,  // Pause AFTER random highlight
        concentricStagger: 0.15     // Slightly shorter stagger between layers
      },
      easing: {
        entrance: 'power4.inOut',
        animation: 'expo.inOut',
        return: 'expo.inOut'
      },
      animation: {
        rippleSpeed: 0.1,        // Speed of ripple propagation
        useColorChange: true,    // Change color during peak (for highlights)
        peakScale: 1.08,         // How much tiles scale at peak
        easingType: 'sineWave',  // Which easing function to use: 'sineWave', 'bellCurve', 'elasticRebound'
        rippleStyle: 'advanced', // Which ripple style to use: 'basic', 'advanced', 'organic'
        looping: true,           // Enable looping through animations
        useStandardEasing: true  // Use standard GSAP easing instead of custom
      },
      debug: {
        enabled: false,           // Force debug mode on for testing
        verbose: false,           // Enable verbose logging
        logAnimationSteps: false, // Log each animation step
        showEasingGraph: false    // Keeping this configuration item for compatibility
      }
    };
    
    // Original easing functions
    this.easings = {
      sineWave: progress => Math.sin(progress * Math.PI),
      bellCurve: progress => Math.exp(-Math.pow((progress - 0.5) * 3.5, 2)),
      elasticRebound: progress => {
        // Damped sine wave that peaks and then returns to zero
        return Math.sin(progress * Math.PI * 1.2) * (1 - progress * 0.3);
      }
    };
    
    // Keyframe-optimized easing functions
    this.keyframeEasings = {
      // Half sine wave approach - first quarter sine for 0-50%, fourth quarter sine for 50-100%
      sineWave: progress => {
        if (progress <= 0.5) {
          // First quarter sine wave (0 to π/2): Map 0-0.5 to 0-1
          return Math.sin((progress * 2) * Math.PI/2);
        } else {
          // Fourth quarter sine wave (π/2 to π): Map 0.5-1 to 1-0
          return Math.cos((progress - 0.5) * 2 * Math.PI/2);
        }
      },
      
      // Bell curve adjusted to have a single clear peak
      bellCurve: progress => {
        // Create a bell curve with a single peak at 0.5
        const adjustedProgress = (progress - 0.5) * 2.5; // Scale for sharper curve
        return Math.exp(-(adjustedProgress * adjustedProgress));
      },
      
      // Simplified elastic with single peak
      elasticRebound: progress => {
        if (progress <= 0.5) {
          // Rising phase - accelerate up
          return 2 * progress * progress;
        } else {
          // Falling phase - decelerate down
          const p = 1 - progress;
          return 1 - 2 * p * p;
        }
      }
    };

    // Animation state tracking
    this.animationInProgress = false;      // Flag to track if an animation is currently running
    this.animationCycleCompleted = false;  // Flag to track if we've completed a full cycle
    
    // Debug counter for advanced ripple animation
    this.advancedRippleCounter = 0;

    // Register custom easing functions with GSAP
    this.initCustomEasings();

    // Animation settings - Array of main animations (Random Highlight will be automatically run after each)
    this.animations = [
      {
        name: 'Concentric',
        fn: this.concentricAnimation.bind(this),
        pauseAfter: 0 // No pause before random highlight
      },
      {
        name: 'Wave',
        fn: this.waveAnimation.bind(this),
        pauseAfter: 0 // No pause before random highlight
      }
      // Other animations commented out for now
      // {
      //   name: 'Advanced Ripple',
      //   fn: this.advancedRippleAnimation.bind(this),
      //   pauseAfter: 0
      // },
      // {
      //   name: 'Organic Ripple',
      //   fn: this.organicRippleAnimation.bind(this),
      //   pauseAfter: 0
      // },
      // {
      //   name: 'Pulse',
      //   fn: this.pulseAnimation.bind(this),
      //   pauseAfter: 0
      // }
    ];
    
    // Current animation index
    this.currentAnimation = 0;
    
    // Create debug display if debug mode is enabled
    if (this.config.debug.enabled) {
      this.createDebugDisplay();
    }
    
    this.init();
  }

  // Register custom easing functions with GSAP
  initCustomEasings() {
    // Register original custom easing functions with GSAP
    gsap.registerEase("customSineWave", progress => this.easings.sineWave(progress));
    gsap.registerEase("customBellCurve", progress => this.easings.bellCurve(progress));
    gsap.registerEase("customElasticRebound", progress => this.easings.elasticRebound(progress));
    
    // Register keyframe-optimized versions
    gsap.registerEase("keyframeSineWave", progress => this.keyframeEasings.sineWave(progress));
    gsap.registerEase("keyframeBellCurve", progress => this.keyframeEasings.bellCurve(progress));
    gsap.registerEase("keyframeElasticRebound", progress => this.keyframeEasings.elasticRebound(progress));
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
      color: this.config.defaultColor,
      scale: 1
    });
    
    gsap.set(this.centerTile, {
      opacity: 0,
      color: this.config.centerColor,
      scale: 1
    });

    // Create entrance animation - now includes the highlight animation too
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
        
        // Start the animation sequence after a 0.5s pause
        setTimeout(() => {
          this.startAnimationSequence();
        }, 500);
      }
    });

    // Get concentric layers
    const [centerLayer, innerRing, outerRing] = this.getConcentricLayers();
    
    // Start with all tiles at opacity 0 and scale 1
    gsap.set([...centerLayer, ...innerRing, ...outerRing], { 
      opacity: 0,
      scale: 1
    });
    
    // Create more aggressive overlapping for fluid motion
    
    // Center tile animation - scale up with opacity
    timeline.to(centerLayer, { 
      scale: 1.1, 
      opacity: this.config.activeOpacity, 
      duration: this.config.timing.animationDuration * 0.8, // Slightly faster
      ease: this.config.easing.animation 
    })
    // Center tile return to normal scale but keep visible
    .to(centerLayer, { 
      scale: 1, 
      opacity: this.config.centerTileOpacity, 
      duration: this.config.timing.animationDuration * 0.8,
      ease: this.config.easing.return 
    }, '+=0.05') // Much shorter pause
    
    // Inner ring animation - start WHILE center is still scaling up
    .to(innerRing, { 
      scale: 1.1, 
      opacity: this.config.activeOpacity, 
      stagger: 0.04, // Faster stagger
      duration: this.config.timing.animationDuration * 0.8,
      ease: this.config.easing.animation 
    }, '-=0.6') // Start earlier
    
    // Inner ring return
    .to(innerRing, { 
      scale: 1, 
      opacity: this.config.defaultOpacity, 
      stagger: 0.04,
      duration: this.config.timing.animationDuration * 0.8,
      ease: this.config.easing.return 
    }, '-=0.5') // Start earlier
    
    // Outer ring animation - start MUCH earlier during inner ring animation
    .to(outerRing, { 
      scale: 1.1, 
      opacity: this.config.activeOpacity, 
      stagger: 0.02, // Even faster stagger for outer
      duration: this.config.timing.animationDuration * 0.8,
      ease: this.config.easing.animation 
    }, '-=1.6') // Start much earlier
    
    // Outer ring return
    .to(outerRing, { 
      scale: 1, 
      opacity: this.config.defaultOpacity, 
      stagger: 0.02,
      duration: this.config.timing.animationDuration * 0.8,
      ease: this.config.easing.return 
    }, '-=0.4');
    
    return timeline;
  }

  startAnimationSequence() {
    if (this.animations.length === 0) {
      this.log('No animations in array. Cannot start sequence.', 'warn');
      return;
    }
    
    this.log('Starting animation sequence', 'info');
    this.updateDebugDisplay('Starting Animation Sequence');
    
    // Reset animation state
    this.currentAnimation = 0;
    this.animationCycleCompleted = false;
    
    // Start the first animation
    this.runNextAnimation();
  }

  runNextAnimation() {
    // Check if we've completed the full animation sequence and looping is disabled
    if (!this.config.animation.looping && this.animationCycleCompleted) {
      this.log('Animation cycle completed and looping is disabled. Stopping animations.', 'info');
      this.updateDebugDisplay('DEBUG MODE - Animations completed (looping disabled)');
      return;
    }
    
    // Skip if there are no animations in the array
    if (this.animations.length === 0) {
      this.log('No animations in the array.', 'info');
      return;
    }
    
    // Get current animation from the combined array
    const animation = this.animations[this.currentAnimation];
    const isMainAnimation = true; // Flag to track if we're running a main animation or random highlight
    
    this.log(`Starting animation sequence: ${animation.name} (${this.currentAnimation})`, 'info');
    this.updateDebugDisplay(`DEBUG MODE - Animation: ${animation.name}`);
    
    // Set flag that animation is now running
    this.animationInProgress = true;
    
    // Create timeline for this animation
    const tl = animation.fn();
    
    // Track when animation starts
    const startTime = performance.now();
    
    // When animation completes, immediately run random highlight, then queue up the next main animation
    tl.eventCallback('onComplete', () => {
      // Calculate actual duration
      const endTime = performance.now();
      const actualDuration = (endTime - startTime) / 1000; // Convert to seconds
      
      this.log(`Animation "${animation.name}" completed in ${actualDuration.toFixed(2)}s`, 'info');
      
      // Reset animation in progress flag
      this.animationInProgress = false;
      
      // Check if we should run a random highlight after this animation
      if (isMainAnimation) {
        // Immediately run random highlight
        this.log('Starting random highlight immediately after main animation', 'info');
        this.updateDebugDisplay(`DEBUG MODE - Random Highlight (after ${animation.name})`);
        
        // Set animation in progress flag again
        this.animationInProgress = true;
        
        // Run random highlight animation
        const highlightTl = this.randomHighlightAnimation();
        
        // When random highlight completes, move to next main animation
        highlightTl.eventCallback('onComplete', () => {
          this.log('Random highlight completed', 'info');
          this.animationInProgress = false;
          
          // Move to next animation in sequence
          const previousAnimation = this.currentAnimation;
          this.currentAnimation = (this.currentAnimation + 1) % this.animations.length;
          
          // Check if we've completed a full cycle through all animations
          if (this.currentAnimation === 0 && previousAnimation === this.animations.length - 1) {
            this.animationCycleCompleted = true;
            this.log('Completed full animation cycle', 'info');
          }
          
          // Log what's next
          this.log(`Next animation will be: ${this.animations[this.currentAnimation].name} (${this.currentAnimation})`, 'info');
          
          // Pause before next main animation
          this.updateDebugDisplay(`DEBUG MODE - Pause: ${this.config.timing.pauseBetweenAnimations}s`);
          
          // Pause before next animation (or stop if we're done and not looping)
          if (!this.config.animation.looping && this.animationCycleCompleted) {
            this.log('Animation cycle completed and looping is disabled. Stopping animations.', 'info');
            this.updateDebugDisplay('DEBUG MODE - Animations completed (looping disabled)');
          } else {
            setTimeout(() => {
              this.runNextAnimation();
            }, this.config.timing.pauseBetweenAnimations * 1000);
          }
        });
      }
    });
  }

  // Random highlight animation with longer hold time
  randomHighlightAnimation() {
    this.log('Running random highlight animation');
    const tl = gsap.timeline();
    
    // Divide the grid into logical areas for better distribution
    const cornerTiles = Array.from(this.cornerTiles);
    const edgeTiles = Array.from(this.edgeTiles);
    const innerTiles = Array.from(this.innerTiles);
    
    // We want a mix of tile types for visual interest:
    // 1 corner tile, 2 edge tiles, 3 inner tiles
    
    // Select random tiles from each group
    const randomCorner = cornerTiles[Math.floor(Math.random() * cornerTiles.length)];
    
    // Shuffle the tiles for true randomness
    const shuffledEdges = [...edgeTiles].sort(() => Math.random() - 0.5);
    const randomEdges = shuffledEdges.slice(0, 2); // Take first 2
    
    const shuffledInner = [...innerTiles].sort(() => Math.random() - 0.5);
    const randomInner = shuffledInner.slice(0, 3); // Take first 3
    
    // Combine into one array of 6 tiles
    const selectedTiles = [randomCorner, ...randomEdges, ...randomInner];
    
    // Light up the selected tiles - faster animation in
    tl.to(selectedTiles, {
      opacity: this.config.activeOpacity,
      color: this.config.activeColor,
      scale: this.config.animation.peakScale,
      duration: this.config.timing.animationDuration * 0.6, // Faster in
      stagger: 0.06,
      ease: this.config.easing.animation
    })
    
    // Return to normal scale and opacity but KEEP the active color
    .to(selectedTiles, {
      opacity: this.config.defaultOpacity,
      // color property removed so tiles stay highlighted
      scale: 1,
      duration: this.config.timing.animationDuration * 0.6, // Faster out
      stagger: 0.06,
      ease: this.config.easing.return
    }, `+=${this.config.timing.activeStateDuration * 1.5}`); // Much longer hold time
    
    return tl;
  }
  
  // Advanced ripple effect based on distance from center
  advancedRippleAnimation() {
    // Increment ripple counter for debugging
    this.advancedRippleCounter++;
    
    this.log(`Running advanced ripple animation (#${this.advancedRippleCounter})`, 'info');
    
    // Create main timeline
    const tl = gsap.timeline({
      onStart: () => {
        this.log(`Advanced ripple #${this.advancedRippleCounter} starting`, 'info');
      },
      onComplete: () => {
        this.log(`Advanced ripple #${this.advancedRippleCounter} completed`, 'info');
      }
    });
    
    // Timing and animation parameters
    const animDuration = this.config.timing.animationDuration * 2;
    const rippleSpeed = this.config.animation.rippleSpeed;
    const maxDistance = Math.sqrt(8); // Max distance from center in a 5x5 grid (diagonal)
    
    // Select easing function based on config and debug settings
    let selectedEasing;
    
    if (this.config.animation.useStandardEasing) {
      // Use standard GSAP easing for debugging
      selectedEasing = "power1.inOut";
      this.log(`Using standard GSAP easing: ${selectedEasing}`, 'debug');
    } else {
      // Use either the original easings or the keyframe-optimized versions
      const prefix = "keyframe"; // Use keyframe-optimized versions by default
      
      switch(this.config.animation.easingType) {
        case 'bellCurve':
          selectedEasing = `${prefix}BellCurve`;
          break;
        case 'elasticRebound':
          selectedEasing = `${prefix}ElasticRebound`;
          break;
        case 'sineWave':
        default:
          selectedEasing = `${prefix}SineWave`;
      }
      
      this.log(`Using custom easing: ${selectedEasing}`, 'debug');
    }
    
    // Calculate center point (for a 5x5 grid, center is at [2,2])
    const centerRow = 2;
    const centerCol = 2;
    
    // Count of tiles animated (for debugging)
    let tileCount = 0;
    
    // Animate each tile based on distance from center
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const tile = this.tileMatrix[row][col];
        if (!tile) continue; // Skip if no tile exists at this position
        
        // Calculate distance from center
        const distance = Math.sqrt(
          Math.pow(row - centerRow, 2) + 
          Math.pow(col - centerCol, 2)
        );
        
        // Calculate delay based on distance (further = more delay)
        const delay = distance * rippleSpeed;
        
        // Determine if this is the center tile
        const isCenter = row === centerRow && col === centerCol;
        
        // Set appropriate initial and peak values based on tile type
        const initialOpacity = isCenter ? this.config.centerTileOpacity : this.config.defaultOpacity;
        const initialColor = isCenter ? this.config.centerColor : this.config.defaultColor;
        const peakColor = isCenter ? this.config.centerColor : 
          (this.config.animation.useColorChange ? this.config.activeColor : this.config.defaultColor);
        
        // Count tiles for debugging
        tileCount++;
        
        // Log tile animation if detailed debugging is enabled
        if (this.config.debug.logAnimationSteps) {
          this.log(`Setting up animation for tile [${row},${col}], distance=${distance.toFixed(2)}, delay=${delay.toFixed(2)}`, 'debug');
        }
        
        // Create animation for this tile - EXPLICITLY setting repeat:0 to prevent default repeating behavior
        tl.to(tile, {
          keyframes: {
            "0%": { 
              scale: 1, 
              opacity: initialOpacity,
              color: initialColor
            },
            "50%": { 
              scale: this.config.animation.peakScale, 
              opacity: this.config.activeOpacity,
              color: peakColor
            },
            "100%": { 
              scale: 1, 
              opacity: initialOpacity,
              color: initialColor
            }
          },
          duration: animDuration,
          ease: selectedEasing,
          repeat: 0 // CRITICAL: Explicitly set to run only once
        }, delay);
      }
    }
    
    this.log(`Advanced ripple animation set up with ${tileCount} tiles`, 'info');
    
    return tl;
  }

  // Organic ripple animation using GSAP's grid stagger
  organicRippleAnimation() {
    this.log('Running organic ripple animation');
    const tl = gsap.timeline();
    
    // Flatten the tile matrix for easier animation
    const allTiles = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (this.tileMatrix[row][col]) {
          allTiles.push({
            element: this.tileMatrix[row][col],
            row: row,
            col: col,
            isCenter: (row === 2 && col === 2)
          });
        }
      }
    }
    
    // Animation parameters
    const animDuration = this.config.timing.animationDuration * 1.5;
    const staggerDuration = this.config.timing.animationDuration * 3; // Total stagger time
    
    // First phase: expanding ripple
    tl.to(allTiles.map(t => t.element), {
      scale: this.config.animation.peakScale,
      opacity: (i) => allTiles[i].isCenter ? this.config.activeOpacity : this.config.activeOpacity,
      color: (i) => allTiles[i].isCenter ? this.config.centerColor : 
        (this.config.animation.useColorChange ? this.config.activeColor : this.config.defaultColor),
      duration: animDuration,
      stagger: {
        grid: [5, 5], // 5x5 grid
        from: "center",
        amount: staggerDuration / 2,
        ease: "sine.in"
      }
    });
    
    // Second phase: contracting ripple
    tl.to(allTiles.map(t => t.element), {
      scale: 1,
      opacity: (i) => allTiles[i].isCenter ? this.config.centerTileOpacity : this.config.defaultOpacity,
      color: (i) => allTiles[i].isCenter ? this.config.centerColor : this.config.defaultColor,
      duration: animDuration,
      stagger: {
        grid: [5, 5],
        from: "edges",
        amount: staggerDuration / 2,
        ease: "sine.out"
      }
    });
    
    return tl;
  }

  // Animation 1: Pulse animation
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

  // Animation 2: Wave animation
  waveAnimation() {
    this.log('Running wave animation');
    const tl = gsap.timeline();
    
    // Get tiles by row
    for (let i = 0; i < 5; i++) {
      const row = Array.from(this.allTiles).filter(
        tile => tile.getAttribute('data-row') === i.toString()
      );
      
      // Create wave effect with y movement, color and opacity
      // Added color transition to default color to ensure all tiles
      // reset to default state regardless of previous animations
      tl.to(row, {
        y: -10,
        color: this.config.defaultColor, // Added explicit color control
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

  // Animation 3: Concentric animation with smooth continuous motion
  concentricAnimation() {
    this.log('Running concentric animation');
    const tl = gsap.timeline();
    
    // Get layers from center outward
    const [centerLayer, innerRing, outerRing] = this.getConcentricLayers();

    // Timing variables
    const animDuration = this.config.timing.animationDuration * 2; // Longer duration for full cycle
    const layerDelay = this.config.timing.concentricStagger;

    // Define custom easing functions (select one to use)
    const easingOptions = {
      // Option 1: Sine Wave - smooth symmetric rise and fall
      sineWave: "sine.inOut",
      
      // Option 2: Bell Curve - faster rise and fall with emphasized peak
      bellCurve: "customBellCurve",
      
      // Option 3: Elastic Bounce - adds slight overshoot for more dynamic feel
      elasticBounce: "customElasticRebound"
    };
    
    // Select which easing to use based on config
    let selectedEasing;
    switch(this.config.animation.easingType) {
      case 'bellCurve':
        selectedEasing = easingOptions.bellCurve;
        break;
      case 'elasticRebound':
        selectedEasing = easingOptions.elasticBounce;
        break;
      case 'sineWave':
      default:
        selectedEasing = easingOptions.sineWave;
    }

    // Center tile animation - complete cycle
    // Center tile maintains its special color throughout
    tl.to(centerLayer, {
      keyframes: {
        "0%": { scale: 1, opacity: this.config.centerTileOpacity, color: this.config.centerColor },
        "50%": { scale: this.config.animation.peakScale, opacity: this.config.activeOpacity },
        "100%": { scale: 1, opacity: this.config.centerTileOpacity }
      },
      duration: animDuration,
      ease: selectedEasing
    });
    
    // Inner ring animation - starts slightly after center
    // Set default color at the 50% keyframe for smoother transition from highlighted state
    tl.to(innerRing, {
      keyframes: {
        "0%": { scale: 1, opacity: this.config.defaultOpacity },
        "50%": { scale: this.config.animation.peakScale, opacity: this.config.activeOpacity, color: this.config.defaultColor },
        "100%": { scale: 1, opacity: this.config.defaultOpacity }
      },
      duration: animDuration,
      ease: selectedEasing
    }, layerDelay); // Slight delay
    
    // Outer ring animation - starts slightly after inner ring
    // Set default color at the 50% keyframe for smoother transition from highlighted state
    tl.to(outerRing, {
      keyframes: {
        "0%": { scale: 1, opacity: this.config.defaultOpacity },
        "50%": { scale: this.config.animation.peakScale, opacity: this.config.activeOpacity, color: this.config.defaultColor },
        "100%": { scale: 1, opacity: this.config.defaultOpacity }
      },
      duration: animDuration,
      ease: selectedEasing
    }, layerDelay * 2); // Further delay
    
    return tl;
  }
}