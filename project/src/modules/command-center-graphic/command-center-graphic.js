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
        animationDuration: 0.8,
        activeStateDuration: 1,
        pauseBetweenAnimations: 1,
        concentricStagger: 0.2  // Time between layers (not within layer)
      },
      easing: {
        entrance: 'power4.inOut',
        animation: 'expo.inOut',
        return: 'expo.inOut'
      },
      animation: {
        rippleSpeed: 0.1,        // Speed of ripple propagation
        useColorChange: false,   // Whether to change color during peak
        peakScale: 1.08,         // How much tiles scale at peak
        easingType: 'sineWave',  // Which easing function to use: 'sineWave', 'bellCurve', 'elasticRebound'
        rippleStyle: 'advanced', // Which ripple style to use: 'basic', 'advanced', 'organic'
        looping: false,           // Whether to continuously loop through animations
        useStandardEasing: true  // Use standard GSAP easing instead of custom
      },
      connection: {
        lineDuration: 1.2,       // Duration of line drawing animation (seconds)
        lineEasing: "expo.out", // Easing function for line animation
        lineOpacity: 1,          // Opacity of the connection line
        lineWidth: 2,            // Width of the connection line
        lineColor: 'white',      // Color of the connection line
        useGradient: false,      // Whether to use a gradient for the line
        holdDuration: 0.8,       // How long to hold the connection before fading
        fadeOutDuration: 0.6,    // Duration of the fade out animation
        patternIndex: 0,         // Current index in the connection pattern
        // Ordered pattern for connections (clockwise from top-left)
        pattern: [
          "topLeft",    // [1,1]
          "top",        // [1,2]
          "topRight",   // [1,3]
          "right",      // [2,3]
          "bottomRight",// [3,3]
          "bottom",     // [3,2]
          "bottomLeft", // [3,1]
          "left"        // [2,1]
        ],
        // Custom edge offsets based on tile positions (direction from center)
        edgeOffsets: {
          default: 0.5,   // Default is 50% of min tile dimension
          top: 0.4,       // [1,2] - Direct top
          topRight: 0.4, // [1,3] - Top right diagonal
          right: 0.4,     // [2,3] - Direct right
          bottomRight: 0.45, // [3,3] - Bottom right diagonal
          bottom: 0.4,    // [3,2] - Direct bottom
          bottomLeft: 0.45, // [3,1] - Bottom left diagonal
          left: 0.4,      // [2,1] - Direct left
          topLeft: 0.8   // [1,1] - Top left diagonal
        }
      },
      debug: {
        enabled: true,           // Force debug mode on for testing
        verbose: true,           // Enable verbose logging
        logAnimationSteps: true, // Log each animation step
        showEasingGraph: false   // Show easing function visualization
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

    // Animation settings
    this.currentAnimation = 0;
    this.animations = [
      this.advancedRippleAnimation.bind(this),   // Use advanced ripple by default
      this.randomConnectionAnimation.bind(this),
      // this.concentricAnimation.bind(this),
      // this.organicRippleAnimation.bind(this),
      // this.waveAnimation.bind(this),
      // this.pulseAnimation.bind(this)
    ];
    
    // Animation names for debug display
    this.animationNames = [
      'Advanced Ripple', 
      'Random Connection',
      // 'Concentric',
      // 'Organic Ripple',
      // 'Wave',
      // 'Pulse'
    ];
    
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
    
    // Add easing visualization if enabled
    if (this.config.debug.showEasingGraph) {
      this.createEasingGraph();
    }
  }
  
  updateDebugDisplay(text) {
    if (this.debugDisplay) {
      this.debugDisplay.textContent = text;
    }
  }
  
  // Optional debugging function to visualize easing curves
  createEasingGraph() {
    const graphContainer = document.createElement('div');
    graphContainer.className = 'easing-graph';
    graphContainer.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 150px;
      height: 100px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
      z-index: 10;
    `;
    
    // Create SVG for graph
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "150");
    svg.setAttribute("height", "100");
    
    // Draw axes
    const axes = document.createElementNS("http://www.w3.org/2000/svg", "path");
    axes.setAttribute("d", "M10,10 L10,90 L140,90");
    axes.setAttribute("stroke", "rgba(255,255,255,0.3)");
    axes.setAttribute("fill", "none");
    svg.appendChild(axes);
    
    // Draw easing curve based on current easing
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "rgba(255,255,255,0.8)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    
    // Generate path data based on current easing function
    let pathData = "M10,90 ";
    const easingFunction = this.keyframeEasings[this.config.animation.easingType] || 
                           this.easings[this.config.animation.easingType];
    
    for (let x = 0; x <= 1; x += 0.05) {
      // Convert 0-1 range to SVG coordinates
      const svgX = 10 + x * 130;
      const svgY = 90 - easingFunction(x) * 80;
      pathData += `L${svgX},${svgY} `;
    }
    
    path.setAttribute("d", pathData);
    svg.appendChild(path);
    
    graphContainer.appendChild(svg);
    this.element.appendChild(graphContainer);
    
    // Update the graph when easing type changes
    this.easingGraph = {
      container: graphContainer,
      path: path,
      updateGraph: () => {
        // Update path data based on current easing
        let newPathData = "M10,90 ";
        const updatedFunction = this.keyframeEasings[this.config.animation.easingType] || 
                               this.easings[this.config.animation.easingType];
        
        for (let x = 0; x <= 1; x += 0.05) {
          const svgX = 10 + x * 130;
          const svgY = 90 - updatedFunction(x) * 80;
          newPathData += `L${svgX},${svgY} `;
        }
        
        path.setAttribute("d", newPathData);
      }
    };
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
    // Set initial animation to the random connection animation if that's preferred
    // this.currentAnimation = 1; // Uncomment to start with random connection
    
    // Run the first animation
    this.runNextAnimation();
  }

  runNextAnimation() {
    // Check if we've completed the full animation sequence and looping is disabled
    if (!this.config.animation.looping && this.animationCycleCompleted) {
      this.log('Animation cycle completed and looping is disabled. Stopping animations.', 'info');
      this.updateDebugDisplay('DEBUG MODE - Animations completed (looping disabled)');
      return;
    }
    
    // Run current animation and set up next one
    const animation = this.animations[this.currentAnimation];
    const animationName = this.animationNames[this.currentAnimation];
    
    this.log(`Starting animation sequence: ${animationName} (${this.currentAnimation})`, 'info');
    this.updateDebugDisplay(`DEBUG MODE - Animation: ${animationName}, Pause: ${this.config.timing.pauseBetweenAnimations}s`);
    
    // Set flag that animation is now running
    this.animationInProgress = true;
    
    // Create timeline for this animation
    const tl = animation();
    
    // Track when animation starts
    const startTime = performance.now();
    
    // When animation completes, queue up the next one
    tl.eventCallback('onComplete', () => {
      // Calculate actual duration
      const endTime = performance.now();
      const actualDuration = (endTime - startTime) / 1000; // Convert to seconds
      
      this.log(`Animation "${animationName}" completed in ${actualDuration.toFixed(2)}s`, 'info');
      
      // Reset animation in progress flag
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
      this.log(`Next animation will be: ${this.animationNames[this.currentAnimation]} (${this.currentAnimation})`, 'info');
      
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
    tl.to(centerLayer, {
      keyframes: {
        "0%": { scale: 1, opacity: this.config.centerTileOpacity },
        "50%": { scale: this.config.animation.peakScale, opacity: this.config.activeOpacity },
        "100%": { scale: 1, opacity: this.config.centerTileOpacity }
      },
      duration: animDuration,
      ease: selectedEasing
    });
    
    // Inner ring animation - starts slightly after center
    tl.to(innerRing, {
      keyframes: {
        "0%": { scale: 1, opacity: this.config.defaultOpacity },
        "50%": { scale: this.config.animation.peakScale, opacity: this.config.activeOpacity },
        "100%": { scale: 1, opacity: this.config.defaultOpacity }
      },
      duration: animDuration,
      ease: selectedEasing
    }, layerDelay); // Slight delay
    
    // Outer ring animation - starts slightly after inner ring
    tl.to(outerRing, {
      keyframes: {
        "0%": { scale: 1, opacity: this.config.defaultOpacity },
        "50%": { scale: this.config.animation.peakScale, opacity: this.config.activeOpacity },
        "100%": { scale: 1, opacity: this.config.defaultOpacity }
      },
      duration: animDuration,
      ease: selectedEasing
    }, layerDelay * 2); // Further delay
    
    return tl;
  }

  // Animation 4: Patterned Connection (light up center and inner ring tile with connecting line)
  randomConnectionAnimation() {
    this.log('Running patterned connection animation');
    const tl = gsap.timeline({
      onStart: () => {
        this.log('Connection animation starting', 'info');
      },
      onComplete: () => {
        this.log('Connection animation completed', 'info');
      }
    });
    
    // Get inner ring tiles
    const [centerLayer, innerRing, outerRing] = this.getConcentricLayers();
    
    // Use the current pattern index to determine which connection to make
    const currentPattern = this.config.connection.pattern[this.config.connection.patternIndex];
    this.log(`Making connection to ${currentPattern} (pattern index: ${this.config.connection.patternIndex})`, 'info');
    
    // Find the target tile based on the pattern
    const targetTile = this.getTileByPosition(currentPattern, innerRing);
    
    // Get position data for the selected tile (for custom edge offset)
    const tilePos = this.getTilePosition(targetTile);
    
    // Create an SVG line element to connect center and target tile
    const line = this.createConnectionLine(this.centerTile, targetTile, tilePos);
    
    // Light up center tile
    tl.to(this.centerTile, {
      opacity: this.config.activeOpacity,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    });
    
    // Animate the line (draw from center to target)
    const lineDuration = this.config.connection.lineDuration;
    tl.to(line, {
      strokeDashoffset: 0,
      duration: lineDuration,
      ease: this.config.connection.lineEasing
    }, `-=${this.config.timing.animationDuration * 0.8}`);
    
    // Light up random tile and change its color to white
    tl.to(randomTile, {
      opacity: this.config.activeOpacity,
      color: this.config.activeColor,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    }, `-=${this.config.timing.animationDuration / 2}`);
    
    // Hold for specified duration
    tl.to({}, { duration: this.config.connection.holdDuration });
    
    // Fade out the line
    tl.to(line, {
      opacity: 0,
      duration: this.config.connection.fadeOutDuration,
      ease: "power2.out",
      onComplete: () => {
        // Remove the line element when animation is complete
        line.remove();
      }
    });
    
    // Return center and target tile to default state
    tl.to(this.centerTile, {
      opacity: this.config.centerTileOpacity,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.return
    }, `-=${this.config.connection.fadeOutDuration * 0.5}`);
    
    tl.to(targetTile, {
      opacity: this.config.defaultOpacity,
      color: this.config.defaultColor,  // Return to default teal color
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.return
    }, `-=${this.config.timing.animationDuration}`);
    
    // Update the pattern index for next time
    tl.call(() => {
      // Move to next pattern index, cycling back to start if needed
      this.config.connection.patternIndex = 
        (this.config.connection.patternIndex + 1) % this.config.connection.pattern.length;
      this.log(`Next connection will be to ${this.config.connection.pattern[this.config.connection.patternIndex]}`, 'info');
    });
    
    // End the timeline
    return tl;
  }
  
  // Find a tile by its position name in the inner ring
  getTileByPosition(positionName, innerRing) {
    // Position name to coordinates mapping
    const positionMap = {
      'top': [1, 2],        // Top
      'topRight': [1, 3],   // Top-right
      'right': [2, 3],      // Right
      'bottomRight': [3, 3],// Bottom-right
      'bottom': [3, 2],     // Bottom
      'bottomLeft': [3, 1], // Bottom-left
      'left': [2, 1],       // Left
      'topLeft': [1, 1]     // Top-left
    };
    
    // Get coordinates for the requested position
    const coords = positionMap[positionName];
    if (!coords) {
      this.log(`Unknown position: ${positionName}, using top instead`, 'warn');
      return this.tileMatrix[1][2]; // Default to top
    }
    
    // Return the tile at the specified position
    const tile = this.tileMatrix[coords[0]][coords[1]];
    if (!tile) {
      this.log(`No tile found at position ${positionName} (${coords[0]},${coords[1]})`, 'warn');
      return innerRing[0]; // Fallback to first inner ring tile
    }
    
    return tile;
  }
  
  // Get the named position of a tile relative to center
  getTilePosition(tile) {
    // Default position info
    const defaultPos = {
      name: 'unknown',
      edgeOffset: this.config.connection.edgeOffsets.default
    };
    
    // For center tile
    if (tile === this.centerTile) {
      return {
        name: 'center',
        edgeOffset: this.config.connection.edgeOffsets.default
      };
    }
    
    // Find row and column
    let tileRow = -1, tileCol = -1;
    
    // Search in matrix
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (this.tileMatrix[row][col] === tile) {
          tileRow = row;
          tileCol = col;
          break;
        }
      }
      if (tileRow !== -1) break;
    }
    
    // If not found in matrix
    if (tileRow === -1 || tileCol === -1) {
      return defaultPos;
    }
    
    // Determine position name based on coordinates relative to center [2,2]
    if (tileRow === 1 && tileCol === 2) {
      return { name: 'top', edgeOffset: this.config.connection.edgeOffsets.top };
    } else if (tileRow === 1 && tileCol === 3) {
      return { name: 'topRight', edgeOffset: this.config.connection.edgeOffsets.topRight };
    } else if (tileRow === 2 && tileCol === 3) {
      return { name: 'right', edgeOffset: this.config.connection.edgeOffsets.right };
    } else if (tileRow === 3 && tileCol === 3) {
      return { name: 'bottomRight', edgeOffset: this.config.connection.edgeOffsets.bottomRight };
    } else if (tileRow === 3 && tileCol === 2) {
      return { name: 'bottom', edgeOffset: this.config.connection.edgeOffsets.bottom };
    } else if (tileRow === 3 && tileCol === 1) {
      return { name: 'bottomLeft', edgeOffset: this.config.connection.edgeOffsets.bottomLeft };
    } else if (tileRow === 2 && tileCol === 1) {
      return { name: 'left', edgeOffset: this.config.connection.edgeOffsets.left };
    } else if (tileRow === 1 && tileCol === 1) {
      return { name: 'topLeft', edgeOffset: this.config.connection.edgeOffsets.topLeft };
    }
    
    // Default fallback
    return defaultPos;
  }
  
  // Helper method to create and setup the connecting line with custom edge offset
  createConnectionLine(fromTile, toTile, tilePosition) {
    // Get the parent SVG container
    const container = this.element.querySelector('.network-grid-container');
    
    // Create the SVG line element
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    
    // Calculate positions for the line endpoints
    const fromRect = fromTile.getBoundingClientRect();
    const toRect = toTile.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate centers first (needed for vector calculations)
    const fromCenterX = fromRect.left + (fromRect.width / 2) - containerRect.left;
    const fromCenterY = fromRect.top + (fromRect.height / 2) - containerRect.top;
    const toCenterX = toRect.left + (toRect.width / 2) - containerRect.left;
    const toCenterY = toRect.top + (toRect.height / 2) - containerRect.top;
    
    // Calculate vector from center tile to target tile
    const vectorX = toCenterX - fromCenterX;
    const vectorY = toCenterY - fromCenterY;
    
    // Normalize the vector
    const length = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
    const normalizedX = vectorX / length;
    const normalizedY = vectorY / length;
    
    // Get custom edge offset for this specific tile pairing
    let fromEdgeOffset, toEdgeOffset;
    
    // Default edge offset (50% of min dimension)
    const defaultOffset = Math.min(fromRect.width, fromRect.height) * this.config.connection.edgeOffsets.default;
    
    // Use tile position-specific edge offset if available
    if (tilePosition && tilePosition.edgeOffset) {
      // Calculate offset distances
      fromEdgeOffset = Math.min(fromRect.width, fromRect.height) * this.config.connection.edgeOffsets.default;
      toEdgeOffset = Math.min(toRect.width, toRect.height) * tilePosition.edgeOffset;
      
      this.log(`Using custom edge offset for ${tilePosition.name} connection: ${tilePosition.edgeOffset}`, 'debug');
    } else {
      // Fallback to default offsets
      fromEdgeOffset = defaultOffset;
      toEdgeOffset = defaultOffset;
    }
    
    // Calculate points on the edges of the tiles
    const fromX = fromCenterX + (normalizedX * fromEdgeOffset);
    const fromY = fromCenterY + (normalizedY * fromEdgeOffset);
    const toX = toCenterX - (normalizedX * toEdgeOffset);
    const toY = toCenterY - (normalizedY * toEdgeOffset);
    
    // Set line attributes
    line.setAttribute("x1", fromX);
    line.setAttribute("y1", fromY);
    line.setAttribute("x2", toX);
    line.setAttribute("y2", toY);
    line.setAttribute("stroke", this.config.connection.lineColor);
    line.setAttribute("stroke-width", this.config.connection.lineWidth);
    line.setAttribute("opacity", this.config.connection.lineOpacity);
    line.setAttribute("stroke-linecap", "round"); // Rounded line ends
    
    // Create SVG wrapper if needed
    let svgWrapper = container.querySelector('.connection-lines-container');
    if (!svgWrapper) {
      svgWrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgWrapper.classList.add('connection-lines-container');
      svgWrapper.style.position = "absolute";
      svgWrapper.style.top = "0";
      svgWrapper.style.left = "0";
      svgWrapper.style.width = "100%";
      svgWrapper.style.height = "100%";
      svgWrapper.style.pointerEvents = "none";
      svgWrapper.style.zIndex = "5";
      container.appendChild(svgWrapper);
    }
    
    // Use gradient if enabled
    if (this.config.connection.useGradient) {
      // Create a unique ID for the gradient
      const gradientId = `line-gradient-${Date.now()}`;
      
      // Create defs element if it doesn't exist
      let defs = svgWrapper.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svgWrapper.appendChild(defs);
      }
      
      // Create gradient
      const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      gradient.setAttribute("id", gradientId);
      gradient.setAttribute("x1", "0%");
      gradient.setAttribute("y1", "0%");
      gradient.setAttribute("x2", "100%");
      gradient.setAttribute("y2", "100%");
      
      // Create gradient stops
      const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", this.config.centerColor);
      
      const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", this.config.activeColor);
      
      // Add stops to gradient
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      
      // Add gradient to defs
      defs.appendChild(gradient);
      
      // Apply gradient to line
      line.setAttribute("stroke", `url(#${gradientId})`);
    }
    
    // Add the line to the SVG
    svgWrapper.appendChild(line);
    
    // Calculate line length for dash animation
    const lineLength = Math.sqrt(
      Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)
    );
    
    // Setup stroke dash properties for the drawing animation
    line.setAttribute("stroke-dasharray", lineLength);
    line.setAttribute("stroke-dashoffset", lineLength);
    
    this.log(`Created connection line from ${fromTile === this.centerTile ? 'center' : 'outer'} to ${toTile === this.centerTile ? 'center' : tilePosition.name} tile`, 'debug');
    
    return line;
  }
}
