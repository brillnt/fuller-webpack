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
        pauseBetweenAnimations: 2,
        concentricStagger: 0.2  // Time between layers (not within layer)
      },
      easing: {
        entrance: 'power4.inOut',
        animation: 'expo.inOut',
        return: 'expo.inOut'
      },
      animation: {
        rippleSpeed: 0.1,        // Speed of ripple propagation
        useColorChange: true,    // Whether to change color during peak
        peakScale: 1.08,         // How much tiles scale at peak
        easingType: 'sineWave',  // Which easing function to use: 'sineWave', 'bellCurve', 'elasticRebound'
        rippleStyle: 'advanced'  // Which ripple style to use: 'basic', 'advanced', 'organic'
      }
    };
    
    this.easings = {
      sineWave: progress => Math.sin(progress * Math.PI),
      bellCurve: progress => Math.exp(-Math.pow((progress - 0.5) * 3.5, 2)),
      elasticRebound: progress => {
        // Damped sine wave that peaks and then returns to zero
        return Math.sin(progress * Math.PI * 1.2) * (1 - progress * 0.3);
      }
    };

    // Register custom easing functions with GSAP
    this.initCustomEasings();

    // Animation settings
    this.currentAnimation = 0;
    this.animations = [
      this.advancedRippleAnimation.bind(this),   // Use advanced ripple by default
      this.randomConnectionAnimation.bind(this),
      // Uncomment to use additional animation types
      // this.concentricAnimation.bind(this),
      // this.organicRippleAnimation.bind(this),
      // this.waveAnimation.bind(this),
      // this.pulseAnimation.bind(this)
    ];
    
    // Animation names for debug display
    this.animationNames = [
      'Advanced Ripple', 
      'Random Connection'
      // 'Concentric',
      // 'Organic Ripple',
      // 'Wave',
      // 'Pulse'
    ];
    
    // Create debug display if debug mode is enabled
    if (debug) {
      this.createDebugDisplay();
    }
    
    this.init();
  }

  // Register custom easing functions with GSAP
  initCustomEasings() {
    // Register custom easing functions with GSAP
    gsap.registerEase("customSineWave", progress => this.easings.sineWave(progress));
    gsap.registerEase("customBellCurve", progress => this.easings.bellCurve(progress));
    gsap.registerEase("customElasticRebound", progress => this.easings.elasticRebound(progress));
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
    // Set initial animation to the random connection animation if that's preferred
    // this.currentAnimation = 1; // Uncomment to start with random connection
    
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

  // Advanced ripple effect based on distance from center
  advancedRippleAnimation() {
    this.log('Running advanced ripple animation');
    const tl = gsap.timeline();
    
    // Timing and animation parameters
    const animDuration = this.config.timing.animationDuration * 2;
    const rippleSpeed = this.config.animation.rippleSpeed;
    const maxDistance = Math.sqrt(8); // Max distance from center in a 5x5 grid (diagonal)
    
    // Select easing function based on config
    let selectedEasing;
    switch(this.config.animation.easingType) {
      case 'bellCurve':
        selectedEasing = "customBellCurve";
        break;
      case 'elasticRebound':
        selectedEasing = "customElasticRebound";
        break;
      case 'sineWave':
      default:
        selectedEasing = "customSineWave";
    }
    
    // Calculate center point (for a 5x5 grid, center is at [2,2])
    const centerRow = 2;
    const centerCol = 2;
    
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
        
        // Create animation for this tile
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
          ease: selectedEasing
        }, delay);
      }
    }
    
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

  // Animation 4: Random Connection (light up center and inner ring tile with connecting line)
  randomConnectionAnimation() {
    this.log('Running random connection animation');
    const tl = gsap.timeline();
    
    // Get a random tile from the inner ring only
    const [centerLayer, innerRing, outerRing] = this.getConcentricLayers();
    const randomIndex = Math.floor(Math.random() * innerRing.length);
    const randomTile = innerRing[randomIndex];
    
    // Create an SVG line element to connect center and random tile
    const line = this.createConnectionLine(this.centerTile, randomTile);
    
    // Light up center tile
    tl.to(this.centerTile, {
      opacity: this.config.activeOpacity,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    });
    
    // Animate the line (draw from center to target)
    const lineDuration = this.config.timing.animationDuration * 1.5;
    tl.to(line, {
      strokeDashoffset: 0,
      duration: lineDuration,
      ease: "expo.inOut"
    }, `-=${this.config.timing.animationDuration * 0.8}`);
    
    // Light up random tile and change its color to white
    tl.to(randomTile, {
      opacity: this.config.activeOpacity,
      color: this.config.activeColor,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.animation
    }, `-=${this.config.timing.animationDuration / 2}`);
    
    // Hold for specified duration
    tl.to({}, { duration: this.config.timing.activeStateDuration });
    
    // Fade out the line
    tl.to(line, {
      opacity: 0,
      duration: this.config.timing.animationDuration,
      ease: "power2.out",
      onComplete: () => {
        // Remove the line element when animation is complete
        line.remove();
      }
    });
    
    // Return center and random tile to default state
    tl.to(this.centerTile, {
      opacity: this.config.centerTileOpacity,
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.return
    }, `-=${this.config.timing.animationDuration * 0.5}`);
    
    tl.to(randomTile, {
      opacity: this.config.defaultOpacity,
      color: this.config.defaultColor,  // Return to default teal color
      duration: this.config.timing.animationDuration,
      ease: this.config.easing.return
    }, `-=${this.config.timing.animationDuration}`);
    
    // End the timeline (don't trigger additional animations)
    return tl;
  }
  
  // Helper method to create and setup the connecting line
  createConnectionLine(fromTile, toTile) {
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
    
    // Calculate edge points by moving from center toward edge
    // Use 40% of the tile width/height as the distance to ensure we're at the edge
    const edgeOffset = Math.min(fromRect.width, fromRect.height) * 0.4;
    
    // Calculate points on the edges of the tiles
    const fromX = fromCenterX + (normalizedX * edgeOffset);
    const fromY = fromCenterY + (normalizedY * edgeOffset);
    const toX = toCenterX - (normalizedX * edgeOffset);
    const toY = toCenterY - (normalizedY * edgeOffset);
    
    // Set line attributes
    line.setAttribute("x1", fromX);
    line.setAttribute("y1", fromY);
    line.setAttribute("x2", toX);
    line.setAttribute("y2", toY);
    line.setAttribute("stroke", this.config.activeColor);
    line.setAttribute("stroke-width", "2");
    line.setAttribute("opacity", "1");
    
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
    
    // Add the line to the SVG
    svgWrapper.appendChild(line);
    
    // Calculate line length for dash animation
    const lineLength = Math.sqrt(
      Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)
    );
    
    // Setup stroke dash properties for the drawing animation
    line.setAttribute("stroke-dasharray", lineLength);
    line.setAttribute("stroke-dashoffset", lineLength);
    
    return line;
  }
}
