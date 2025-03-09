import { select, selectId } from '../../utils/helpers.js';
import Base from '../base/base.js';
import { gsap } from '../../utils/animation.js';

import './command-center-graphic.css';

// CommandCenterGraphic class with configuration system and refinement mode
export default class CommandCenterGraphic extends Base {
  // Static connection map with refined connection points
  static CONNECTION_MAP = {
    "top-left-to-top-middle": {
      "from": {
        "position": "top-left",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      },
      "to": {
        "position": "top-middle",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-left-to-top-right": {
      "from": {
        "position": "top-left",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      },
      "to": {
        "position": "top-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      }
    },
    "top-left-to-middle-left": {
      "from": {
        "position": "top-left",
        "offsetX": 30,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "middle-left",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-left-to-middle-right": {
      "from": {
        "position": "top-left",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      },
      "to": {
        "position": "middle-right",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-left-to-bottom-left": {
      "from": {
        "position": "top-left",
        "offsetX": 30,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "bottom-left",
        "offsetX": 40,
        "offsetY": 42.071875000000006
      }
    },
    "top-left-to-bottom-middle": {
      "from": {
        "position": "top-left",
        "offsetX": 30,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "bottom-middle",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-left-to-bottom-right": {
      "from": {
        "position": "top-left",
        "offsetX": 33,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "bottom-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      }
    },
    "top-middle-to-top-right": {
      "from": {
        "position": "top-middle",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      },
      "to": {
        "position": "top-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      }
    },
    "top-middle-to-middle-left": {
      "from": {
        "position": "top-middle",
        "offsetX": 38.5,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "middle-left",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-middle-to-middle-right": {
      "from": {
        "position": "top-middle",
        "offsetX": 38.5,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "middle-right",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-middle-to-bottom-left": {
      "from": {
        "position": "top-middle",
        "offsetX": 35,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "bottom-left",
        "offsetX": 40,
        "offsetY": 42.071875000000006
      }
    },
    "top-middle-to-bottom-middle": {
      "from": {
        "position": "top-middle",
        "offsetX": 35,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "bottom-middle",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-middle-to-bottom-right": {
      "from": {
        "position": "top-middle",
        "offsetX": 35,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "bottom-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      }
    },
    "top-right-to-middle-left": {
      "from": {
        "position": "top-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      },
      "to": {
        "position": "middle-left",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-right-to-middle-right": {
      "from": {
        "position": "top-right",
        "offsetX": 30,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "middle-right",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-right-to-bottom-left": {
      "from": {
        "position": "top-right",
        "offsetX": 33,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "bottom-left",
        "offsetX": 40,
        "offsetY": 42.071875000000006
      }
    },
    "top-right-to-bottom-middle": {
      "from": {
        "position": "top-right",
        "offsetX": 30,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "bottom-middle",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "top-right-to-bottom-right": {
      "from": {
        "position": "top-right",
        "offsetX": 30,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "bottom-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      }
    },
    "middle-left-to-middle-right": {
      "from": {
        "position": "middle-left",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      },
      "to": {
        "position": "middle-right",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "middle-left-to-bottom-left": {
      "from": {
        "position": "middle-left",
        "offsetX": 35,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "bottom-left",
        "offsetX": 40,
        "offsetY": 42.071875000000006
      }
    },
    "middle-left-to-bottom-middle": {
      "from": {
        "position": "middle-left",
        "offsetX": 38.5,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "bottom-middle",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "middle-left-to-bottom-right": {
      "from": {
        "position": "middle-left",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      },
      "to": {
        "position": "bottom-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      }
    },
    "middle-right-to-bottom-left": {
      "from": {
        "position": "middle-right",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      },
      "to": {
        "position": "bottom-left",
        "offsetX": 40,
        "offsetY": 42.071875000000006
      }
    },
    "middle-right-to-bottom-middle": {
      "from": {
        "position": "middle-right",
        "offsetX": 38.5,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "bottom-middle",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "middle-right-to-bottom-right": {
      "from": {
        "position": "middle-right",
        "offsetX": 35,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "bottom-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      }
    },
    "bottom-left-to-bottom-middle": {
      "from": {
        "position": "bottom-left",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      },
      "to": {
        "position": "bottom-middle",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      }
    },
    "bottom-left-to-bottom-right": {
      "from": {
        "position": "bottom-left",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      },
      "to": {
        "position": "bottom-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      }
    },
    "bottom-middle-to-bottom-right": {
      "from": {
        "position": "bottom-middle",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      },
      "to": {
        "position": "bottom-right",
        "offsetX": 45,
        "offsetY": 31.553906249999997
      }
    },
    "top-left-to-center": {
      "from": {
        "position": "top-left",
        "offsetX": 33,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "center",
        "offsetX": 50,
        "offsetY": 53.25
      }
    },
    "top-middle-to-center": {
      "from": {
        "position": "top-middle",
        "offsetX": 35,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "center",
        "offsetX": 50,
        "offsetY": 53.25
      }
    },
    "top-right-to-center": {
      "from": {
        "position": "top-right",
        "offsetX": 33,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "center",
        "offsetX": 50,
        "offsetY": 53.25
      }
    },
    "middle-left-to-center": {
      "from": {
        "position": "middle-left",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      },
      "to": {
        "position": "center",
        "offsetX": 50,
        "offsetY": 53.25
      }
    },
    "middle-right-to-center": {
      "from": {
        "position": "middle-right",
        "offsetX": 45,
        "offsetY": 36.812890624999994
      },
      "to": {
        "position": "center",
        "offsetX": 50,
        "offsetY": 53.25
      }
    },
    "bottom-left-to-center": {
      "from": {
        "position": "bottom-left",
        "offsetX": 33,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "center",
        "offsetX": 55.00000000000001,
        "offsetY": 58.575
      }
    },
    "bottom-middle-to-center": {
      "from": {
        "position": "bottom-middle",
        "offsetX": 35,
        "offsetY": 47.330859375
      },
      "to": {
        "position": "center",
        "offsetX": 50,
        "offsetY": 53.25
      }
    },
    "bottom-right-to-center": {
      "from": {
        "position": "bottom-right",
        "offsetX": 33,
        "offsetY": 52.06394531250001
      },
      "to": {
        "position": "center",
        "offsetX": 55.00000000000001,
        "offsetY": 58.575
      }
    }
  };

  constructor(elementId, options = {}) {
    super(options.debug || false);
    
    // Configuration options with defaults
    this.options = {
      debug: false,
      devMode: false,
      testConnections: false,
      refinementMode: false,            // Enable refinement mode
      refinementConnection: null,       // Which specific connection to refine
      connectionRepeatDelay: 2000,      // Time between repeats
      ...options
    };

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
    
    // Animation configuration objects
    this.initializeConfigurations();
    
    // Track animation state
    this.iterationCount = 0;
    
    // Map tile indexes to position names for easier reference
    this.positionMap = [
      'top-left', 'top-middle', 'top-right',
      'middle-left', 'middle-right',
      'bottom-left', 'bottom-middle', 'bottom-right'
    ];
    
    // Track active animations
    this.activeAnimations = {
      pulses: [],
      connections: [],
      brainPulse: null
    };
    
    // Connection map to store optimal connection points
    this.connectionMap = CommandCenterGraphic.CONNECTION_MAP;
    
    // Flag for active tile movement
    this.activeTileMovement = false;
    
    // SVG namespace for creating elements
    this.svgNS = "http://www.w3.org/2000/svg";
    
    // Create container for connection lines
    this.setupConnectionsContainer();
    
    // Initialize the component
    this.init();
  }
  
  // Initialize all configuration objects
  initializeConfigurations() {
    // Timing configuration
    this.timingConfig = {
      reveal: {
        duration: 1,
        staggerDelay: 0.1,
        initialDelay: 1.5
      },
      network: {
        movementInterval: {
          min: 2000,
          max: 5000
        },
        pulseFrequency: {
          base: this.options.pulseFrequency || 2000,
          variation: 0.5 // ±50%
        },
        connectionFrequency: {
          base: this.options.connectionFrequency || 3500,
          variation: 0.3 // ±30%
        },
        brainPulseFrequency: {
          base: this.options.brainPulseFrequency || 8000,
          variation: 0.1 // ±10%
        },
        movementDuration: 1.2,
        movementStaggerDelay: this.options.staggerDelay || 0.022,
        pulseDuration: 0.5,
        connectionDuration: 1.2,
        brainPulseDuration: 0.7
      },
      testing: {
        connectionTestDelay: this.options.connectionTestDelay || 500,
        visualDuration: 0.5,
        animationDelay: this.options.animationDelay || 3000
      }
    };

    // Easing configuration
    this.easingConfig = {
      reveal: {
        tiles: 'power4.out',
        center: 'power4.out'
      },
      movement: {
        clockwise: 'expo.out',
        counterClockwise: 'power4.inOut',
        swapPair: 'back.inOut(2)',
        patternGroup: 'power3.inOut'
      },
      pulse: {
        in: 'sine.inOut',
        out: 'sine.inOut'
      },
      connection: {
        fadeIn: 'power2.inOut',
        fadeOut: 'power2.in'
      },
      brainPulse: {
        in: 'elastic.out(1, 0.3)',
        out: 'power2.out',
        rippleIn: 'sine.out',
        rippleOut: 'power1.out'
      }
    };

    // Styling configuration
    this.styleConfig = {
      connection: {
        normal: {
          stroke: 'rgba(255, 255, 255, 0.25)',
          strokeWidth: 1
        },
        testing: {
          stroke: 'rgba(255, 255, 255, 0.5)',
          strokeWidth: 1.5
        },
        brain: {
          stroke: 'rgba(255, 255, 255, 0.3)',
          strokeWidth: 1.2
        }
      },
      pulse: {
        normal: {
          scale: 1.05,
          filter: 'brightness(1.2)'
        },
        brain: {
          scale: 1.1,
          filter: 'brightness(1.5) drop-shadow(0 0 5px rgba(255,255,255,0.7))'
        },
        ripple: {
          scale: 1.03,
          filter: 'brightness(1.2)'
        }
      },
      testHelpers: {
        centers: {
          color: 'rgba(255, 255, 0, 0.7)',
          radius: 3
        },
        connectionPoints: {
          color: 'rgba(0, 255, 0, 0.7)',
          radius: 3
        },
        guideLine: {
          color: 'rgba(255, 0, 0, 0.3)',
          width: 1
        }
      }
    };

    // Offset configuration for different positions and angles
    this.offsetConfig = {
      default: {
        factorX: 0.4,
        factorY: 0.4
      },
      position: {
        'top-left': [
          { angleMin: -45, angleMax: 45, factorX: 0.45, factorY: 0.3 },
          { angleMin: 45, angleMax: 135, factorX: 0.3, factorY: 0.45 },
          { angleMin: -180, angleMax: -45, factorX: 0.4, factorY: 0.4 },
          { angleMin: 135, angleMax: 180, factorX: 0.4, factorY: 0.4 }
        ],
        'top-right': [
          { angleMin: 135, angleMax: 180, factorX: 0.45, factorY: 0.3 },
          { angleMin: -180, angleMax: -135, factorX: 0.45, factorY: 0.3 },
          { angleMin: 45, angleMax: 135, factorX: 0.3, factorY: 0.45 }
        ],
        'bottom-left': [
          { angleMin: -45, angleMax: 45, factorX: 0.45, factorY: 0.3 },
          { angleMin: -135, angleMax: -45, factorX: 0.3, factorY: 0.45 }
        ],
        'bottom-right': [
          { angleMin: 135, angleMax: 180, factorX: 0.45, factorY: 0.3 },
          { angleMin: -180, angleMax: -135, factorX: 0.45, factorY: 0.3 },
          { angleMin: -135, angleMax: -45, factorX: 0.3, factorY: 0.45 }
        ],
        'center': [
          { angleMin: -180, angleMax: 180, factorX: 0.5, factorY: 0.5 }
        ]
      },
      direction: {
        horizontal: { factorX: 0.45, factorY: 0.35 },
        vertical: { factorX: 0.35, factorY: 0.45 },
        diagonal: { multiplier: 1.1 } // Multiplier for diagonal connections
      }
    };
  }

  // Set up the SVG container for drawing connection lines
  setupConnectionsContainer() {
    // Create an SVG overlay for connection lines
    this.connectionsContainer = document.createElementNS(this.svgNS, "svg");
    this.connectionsContainer.style.position = "absolute";
    this.connectionsContainer.style.top = "0";
    this.connectionsContainer.style.left = "0";
    this.connectionsContainer.style.width = "100%";
    this.connectionsContainer.style.height = "100%";
    this.connectionsContainer.style.pointerEvents = "none";
    this.connectionsContainer.style.zIndex = "10";
    
    // Insert the SVG container right after the network grid
    const gridContainer = this.element.querySelector('.network-grid-container');
    gridContainer.parentNode.insertBefore(this.connectionsContainer, gridContainer.nextSibling);
  }

  // Initialize the component
  init() {
    // Initialize with reveal animations using configuration values
    gsap.set(this.tiles, { x: -20, opacity: 0 });
    gsap.set(this.centerTile, { y: 20, opacity: 0 });

    gsap.to(this.tiles, {
      x: 0,
      opacity: 1,
      stagger: this.timingConfig.reveal.staggerDelay,
      duration: this.timingConfig.reveal.duration,
      ease: this.easingConfig.reveal.tiles,
      delay: this.timingConfig.reveal.initialDelay,
      scrollTrigger: {
        trigger: this.element,
        start: 'top 40%',
        toggleActions: 'play none none reverse',
      },
      onComplete: () => {
        this.log(`Reveal animation complete.`);
        
        // After the reveal animation completes, decide what to do based on mode
        if (this.options.devMode) {
          this.log('Starting development mode...');
          if (this.options.testConnections) {
            // If in test connections mode, start mapping connections
            setTimeout(() => this.startConnectionMapping(), 1000);
          } else if (this.options.refinementMode) {
            // If in refinement mode, test the specific connection
            setTimeout(() => this.startConnectionRefinement(), 1000);
          } else {
            // Otherwise default to normal mode
            setTimeout(() => this.startIntelligentNetwork(), this.timingConfig.testing.animationDelay);
          }
        } else {
          // Normal animation mode
          this.log('Starting intelligent network animation...');
          setTimeout(() => this.startIntelligentNetwork(), this.timingConfig.testing.animationDelay);
        }
      },
    });

    gsap.to(this.centerTile, {
      y: 0,
      opacity: 1,
      duration: this.timingConfig.reveal.duration,
      ease: this.easingConfig.reveal.center,
      scrollTrigger: {
        trigger: this.element,
        start: 'top 40%',
        toggleActions: 'play none none reverse',
      },
    });
    
    // Add console commands for development
    if (this.options.devMode) {
      this.addDevConsoleCommands();
    }
  }

  // Add console commands for development
  addDevConsoleCommands() {
    // Add a global reference to this instance
    window._commandCenterGraphic = this;
    
    // Log instructions
    console.log('');
    console.log('%c Command Center Graphic - Development Mode ', 'background: #333; color: #bada55; padding: 5px;');
    console.log('Available commands:');
    console.log('  window._commandCenterGraphic.startConnectionMapping() - Start connection mapping');
    console.log('  window._commandCenterGraphic.startIntelligentNetwork() - Start normal animation');
    console.log('  window._commandCenterGraphic.stopAllAnimations() - Stop all animations');
    console.log('');
  }
  
  // Stop all running animations
  stopAllAnimations() {
    this.log('Stopping all animations', 'warn');
    
    // Clear any pending timeouts
    if (this.nextMovementTimeout) {
      clearTimeout(this.nextMovementTimeout);
    }
    
    if (this.nextConnectionTimeout) {
      clearTimeout(this.nextConnectionTimeout);
    }
    
    if (this.nextPulseTimeout) {
      clearTimeout(this.nextPulseTimeout);
    }
    
    if (this.nextBrainPulseTimeout) {
      clearTimeout(this.nextBrainPulseTimeout);
    }
    
    if (this.nextConnectionMappingTimeout) {
      clearTimeout(this.nextConnectionMappingTimeout);
    }
    
    if (this.nextRefinementTimeout) {
      clearTimeout(this.nextRefinementTimeout);
    }
    
    // Kill any active GSAP animations
    gsap.killTweensOf(this.tiles);
    gsap.killTweensOf(this.centerTile);
    
    // Clear the connections container
    while (this.connectionsContainer.firstChild) {
      this.connectionsContainer.removeChild(this.connectionsContainer.firstChild);
    }
    
    // Reset animation flags
    this.activeTileMovement = false;
    this.activeAnimations = {
      pulses: [],
      connections: [],
      brainPulse: null
    };
  }

  //==================================================
  // INTELLIGENT NETWORK ANIMATION METHODS
  //==================================================
  
  startIntelligentNetwork() {
    this.log('Starting adaptive intelligence network animations');
    
    // Stop any running animations first
    this.stopAllAnimations();
    
    // Start periodic tile movements (pairs and patterns)
    this.scheduleNextMovement();
    
    // Start random tile pulses
    this.startRandomPulses();
    
    // Start occasional connections between tiles
    this.startRandomConnections();
    
    // Start periodic brain pulses from the center
    this.startBrainPulses();
  }

  scheduleNextMovement() {
    // Randomize the delay before the next movement (between min and max)
    const minDelay = this.timingConfig.network.movementInterval.min;
    const maxDelay = this.timingConfig.network.movementInterval.max;
    const nextDelay = minDelay + Math.random() * (maxDelay - minDelay);
    
    this.nextMovementTimeout = setTimeout(() => {
      // Decide which type of movement to perform
      const movementType = Math.random();
      
      if (movementType < 0.25) {
        // 25% chance: Move all tiles clockwise
        this.moveClockwise(this.easingConfig.movement.clockwise, this.timingConfig.network.movementDuration);
      } else if (movementType < 0.4) {
        // 15% chance: Move all tiles counterclockwise
        this.moveCounterClockwise(this.easingConfig.movement.counterClockwise, this.timingConfig.network.movementDuration);
      } else if (movementType < 0.7) {
        // 30% chance: Swap a pair of tiles
        this.swapRandomPair();
      } else {
        // 30% chance: Move a small group in a pattern
        this.movePatternGroup();
      }
      
      // Schedule the next movement
      this.scheduleNextMovement();
    }, nextDelay);
  }
  
  startRandomPulses() {
    // Start random pulse animations on tiles
    const startPulse = () => {
      // Get a random tile to pulse (except during active movements)
      if (this.activeTileMovement) {
        const retryDelay = this.timingConfig.network.pulseFrequency.base / 2;
        this.nextPulseTimeout = setTimeout(startPulse, retryDelay);
        return;
      }
      
      const randomIndex = Math.floor(Math.random() * this.tiles.length);
      const tile = this.tiles[randomIndex];
      
      // Create pulse animation
      const pulseAnim = gsap.timeline();
      
      // Add subtle glow - using configuration values
      pulseAnim.to(tile, {
        scale: this.styleConfig.pulse.normal.scale,
        filter: this.styleConfig.pulse.normal.filter,
        duration: this.timingConfig.network.pulseDuration,
        ease: this.easingConfig.pulse.in
      });
      
      // Return to normal
      pulseAnim.to(tile, {
        scale: 1,
        filter: 'brightness(1)',
        duration: this.timingConfig.network.pulseDuration,
        ease: this.easingConfig.pulse.out
      });
      
      // Add to active animations
      this.activeAnimations.pulses.push(pulseAnim);
      
      // Schedule the next random pulse with variation
      const baseDelay = this.timingConfig.network.pulseFrequency.base;
      const variation = this.timingConfig.network.pulseFrequency.variation;
      const nextDelay = baseDelay * (1 - variation + (Math.random() * variation * 2));
      this.nextPulseTimeout = setTimeout(startPulse, nextDelay);
    };
    
    // Start the pulse cycle
    startPulse();
  }
  
  startRandomConnections() {
    // Start random connection animations between tiles
    const startConnection = () => {
      // Select two random tiles to connect
      const allIndexes = Array.from({ length: this.tiles.length }, (_, i) => i);
      const randomIndexes = this.shuffleArray(allIndexes).slice(0, 2);
      
      const tile1 = this.tiles[randomIndexes[0]];
      const tile2 = this.tiles[randomIndexes[1]];
      
      // Create and animate the connection
      const connectionAnim = this.createConnection(tile1, tile2);
      this.activeAnimations.connections.push(connectionAnim);
      
      // Schedule the next random connection with variation
      const baseDelay = this.timingConfig.network.connectionFrequency.base;
      const variation = this.timingConfig.network.connectionFrequency.variation;
      const nextDelay = baseDelay * (1 - variation + (Math.random() * variation * 2));
      this.nextConnectionTimeout = setTimeout(startConnection, nextDelay);
    };
    
    // Start the connection cycle
    startConnection();
  }
  
  startBrainPulses() {
    // Start periodic "brain" pulses from the center tile
    const startBrainPulse = () => {
      this.log('Triggering brain pulse from center');
      
      // Create a ripple effect from the center tile
      const pulseAnim = gsap.timeline();
      
      // Pulse the center tile
      pulseAnim.to(this.centerTile, {
        scale: this.styleConfig.pulse.brain.scale,
        filter: this.styleConfig.pulse.brain.filter,
        duration: this.timingConfig.network.brainPulseDuration,
        ease: this.easingConfig.brainPulse.in
      });
      
      // Return to normal
      pulseAnim.to(this.centerTile, {
        scale: 1,
        filter: 'none',
        duration: this.timingConfig.network.brainPulseDuration,
        ease: this.easingConfig.brainPulse.out
      });
      
      // Affect surrounding tiles
      this.tiles.forEach((tile, index) => {
        // Stagger effect radiating from center
        const delay = 0.05 * (index % 4);
        
        // Create a smaller pulse on each surrounding tile
        gsap.timeline()
          .to(tile, {
            scale: this.styleConfig.pulse.ripple.scale,
            filter: this.styleConfig.pulse.ripple.filter,
            duration: this.timingConfig.network.brainPulseDuration / 2,
            delay: delay,
            ease: this.easingConfig.brainPulse.rippleIn
          })
          .to(tile, {
            scale: 1,
            filter: 'none',
            duration: this.timingConfig.network.brainPulseDuration / 2,
            ease: this.easingConfig.brainPulse.rippleOut
          });
      });
      
      // Create multiple connections from center after the pulse
      setTimeout(() => {
        // Connect center to 3-4 random tiles
        const numConnections = 3 + Math.floor(Math.random() * 2);
        const shuffledTiles = this.shuffleArray([...this.tiles]).slice(0, numConnections);
        
        shuffledTiles.forEach((tile, i) => {
          setTimeout(() => {
            this.createConnection(this.centerTile, tile, 0.7, this.styleConfig.connection.brain);
          }, i * 200);
        });
      }, 700);
      
      // Store animation reference
      this.activeAnimations.brainPulse = pulseAnim;
      
      // Schedule the next brain pulse with slight variation
      const baseDelay = this.timingConfig.network.brainPulseFrequency.base;
      const variation = this.timingConfig.network.brainPulseFrequency.variation;
      const nextDelay = baseDelay * (1 - variation + (Math.random() * variation * 2));
      this.nextBrainPulseTimeout = setTimeout(startBrainPulse, nextDelay);
    };
    
    // Start the brain pulse cycle
    setTimeout(startBrainPulse, this.timingConfig.network.brainPulseFrequency.base / 2);
  }
  
  // Creates a connection line between two elements
  createConnection(element1, element2, duration = null, style = null) {
    // Use the configured duration or provided duration
    const connectionDuration = duration || this.timingConfig.network.connectionDuration;
    
    // Use the configured style or provided style
    const connectionStyle = style || this.styleConfig.connection.normal;
    
    // Get element positions
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    // Adjust positions to be relative to the connections container
    const containerRect = this.connectionsContainer.getBoundingClientRect();
    
    // Calculate centers
    const center1 = {
      x: rect1.left + rect1.width/2 - containerRect.left,
      y: rect1.top + rect1.height/2 - containerRect.top
    };
    
    const center2 = {
      x: rect2.left + rect2.width/2 - containerRect.left,
      y: rect2.top + rect2.height/2 - containerRect.top
    };
    
    // Calculate direction vector
    const dir = {
      x: center2.x - center1.x,
      y: center2.y - center1.y
    };
    
    // Calculate distance between centers
    const distance = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
    
    // Normalize the direction vector
    const normalizedDir = {
      x: dir.x / distance,
      y: dir.y / distance
    };
    
    // Get position names
    let fromPositionName = "default";
    let toPositionName = "default";
    
    // Determine if center tile is involved
    const isFromCenter = element1 === this.centerTile;
    const isToCenter = element2 === this.centerTile;
    
    if (isFromCenter) {
      fromPositionName = "center";
    } else {
      // Find the element index in tiles array
      const index = this.tiles.indexOf(element1);
      if (index !== -1) {
        fromPositionName = this.positionMap[index];
      }
    }
    
    if (isToCenter) {
      toPositionName = "center";
    } else {
      // Find the element index in tiles array
      const index = this.tiles.indexOf(element2);
      if (index !== -1) {
        toPositionName = this.positionMap[index];
      }
    }
    
    // Build connection key
    let connectionKey = `${fromPositionName}-to-${toPositionName}`;
    
    // If connection doesn't exist in that direction, try the reverse
    if (!this.connectionMap[connectionKey]) {
      const reverseKey = `${toPositionName}-to-${fromPositionName}`;
      if (this.connectionMap[reverseKey]) {
        // Use reverse connection data but swap from/to
        connectionKey = reverseKey;
      }
    }
    
    let fromOffsetX, fromOffsetY, toOffsetX, toOffsetY;
    
    // Use connection map if available
    if (this.connectionMap[connectionKey]) {
      const connectionData = this.connectionMap[connectionKey];
      
      // If we had to use the reverse key, swap from/to
      if (connectionKey === `${toPositionName}-to-${fromPositionName}`) {
        // Reversed - swap from/to
        fromOffsetX = connectionData.to.offsetX;
        fromOffsetY = connectionData.to.offsetY;
        toOffsetX = connectionData.from.offsetX;
        toOffsetY = connectionData.from.offsetY;
      } else {
        // Normal direction
        fromOffsetX = connectionData.from.offsetX;
        fromOffsetY = connectionData.from.offsetY;
        toOffsetX = connectionData.to.offsetX;
        toOffsetY = connectionData.to.offsetY;
      }
    } else {
      // Fall back to calculated offsets
      const fromOffsets = this.calculateOffsetFactors(fromPositionName, Math.atan2(dir.y, dir.x) * (180 / Math.PI));
      const toOffsets = this.calculateOffsetFactors(toPositionName, (Math.atan2(dir.y, dir.x) * (180 / Math.PI) + 180) % 360);
      
      // Apply factors to dimensions
      fromOffsetX = rect1.width * fromOffsets.factorX;
      fromOffsetY = rect1.height * fromOffsets.factorY;
      toOffsetX = rect2.width * toOffsets.factorX;
      toOffsetY = rect2.height * toOffsets.factorY;
    }
    
    // Calculate edge points using offsets
    const edgePoint1 = {
      x: center1.x + normalizedDir.x * fromOffsetX,
      y: center1.y + normalizedDir.y * fromOffsetY
    };
    
    const edgePoint2 = {
      x: center2.x - normalizedDir.x * toOffsetX,
      y: center2.y - normalizedDir.y * toOffsetY
    };
    
    // Create line element 
    const line = document.createElementNS(this.svgNS, "line");
    line.setAttribute("x1", edgePoint1.x);
    line.setAttribute("y1", edgePoint1.y);
    line.setAttribute("x2", edgePoint2.x);
    line.setAttribute("y2", edgePoint2.y);
    
    // Apply styling from configuration
    line.setAttribute("stroke", connectionStyle.stroke);
    line.setAttribute("stroke-width", connectionStyle.strokeWidth);
    
    // Add line to the SVG container
    this.connectionsContainer.appendChild(line);
    
    // Animate the line
    const lineAnim = gsap.timeline({
      onComplete: () => {
        // Remove the line after animation completes
        if (this.connectionsContainer.contains(line)) {
          this.connectionsContainer.removeChild(line);
        }
      }
    });
    
    // Fade in 
    lineAnim.fromTo(line, 
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: connectionDuration * 0.4, 
        ease: this.easingConfig.connection.fadeIn 
      }
    );
    
    // Hold
    lineAnim.to(line, { 
      duration: connectionDuration * 0.2
    });
    
    // Fade out
    lineAnim.to(line, { 
      opacity: 0, 
      duration: connectionDuration * 0.4, 
      ease: this.easingConfig.connection.fadeOut 
    });
    
    return lineAnim;
  }
  
  // Calculate offset factors based on position and angle
  calculateOffsetFactors(positionName, angle) {
    // Default factors
    let factorX = this.offsetConfig.default.factorX;
    let factorY = this.offsetConfig.default.factorY;
    
    // Position-specific factors if available
    if (this.offsetConfig.position[positionName]) {
      const positionRules = this.offsetConfig.position[positionName];
      
      // Find a matching angle rule
      for (const rule of positionRules) {
        if (angle >= rule.angleMin && angle < rule.angleMax) {
          factorX = rule.factorX;
          factorY = rule.factorY;
          break;
        }
      }
    }
    
    // Apply direction-based adjustments
    if (Math.abs(angle) <= 45 || Math.abs(angle) >= 135) {
      // Horizontal connections
      const horizontalAdjustment = this.offsetConfig.direction.horizontal;
      factorX = horizontalAdjustment.factorX;
      factorY = horizontalAdjustment.factorY;
    } else if (Math.abs(angle) >= 45 && Math.abs(angle) <= 135) {
      // Vertical connections
      const verticalAdjustment = this.offsetConfig.direction.vertical;
      factorX = verticalAdjustment.factorX;
      factorY = verticalAdjustment.factorY;
    }
    
    // For diagonal connections, apply a multiplier
    if ((Math.abs(angle) > 30 && Math.abs(angle) < 60) || 
        (Math.abs(angle) > 120 && Math.abs(angle) < 150)) {
      factorX *= this.offsetConfig.direction.diagonal.multiplier;
      factorY *= this.offsetConfig.direction.diagonal.multiplier;
    }
    
    return { factorX, factorY };
  }
  
  swapRandomPair() {
    this.log('Swapping a random pair of tiles');
    
    // Mark that we're performing a tile movement
    this.activeTileMovement = true;
    
    // Get current tile positions
    const positions = this.getTilePositions();
    
    // Pick two random tiles to swap
    const allIndexes = Array.from({ length: this.tiles.length }, (_, i) => i);
    const swapPair = this.shuffleArray(allIndexes).slice(0, 2);
    
    const tile1 = this.tiles[swapPair[0]];
    const tile2 = this.tiles[swapPair[1]];
    
    // Get positions
    const pos1 = positions[swapPair[0]];
    const pos2 = positions[swapPair[1]];
    
    // Create a connection between them before swapping
    this.createConnection(tile1, tile2, 0.8);
    
    // Animate the swap
    gsap.to(tile1, {
      x: `+=${pos2.x - pos1.x}`,
      y: `+=${pos2.y - pos1.y}`,
      duration: 1,
      ease: this.easingConfig.movement.swapPair,
      delay: 0.3
    });
    
    gsap.to(tile2, {
      x: `+=${pos1.x - pos2.x}`,
      y: `+=${pos1.y - pos2.y}`,
      duration: 1,
      ease: this.easingConfig.movement.swapPair,
      delay: 0.3,
      onComplete: () => {
        // Movement is done
        this.activeTileMovement = false;
      }
    });
  }
  
  movePatternGroup() {
    this.log('Moving a pattern group of tiles');
    
    // Mark that we're performing a tile movement
    this.activeTileMovement = true;
    
    // Get current tile positions
    const positions = this.getTilePositions();
    
    // Decide which pattern to use (here we'll create a few options)
    const patternType = Math.floor(Math.random() * 3);
    
    let groupIndexes = [];
    let moveTargets = {};
    
    if (patternType === 0) {
      // Triangle rotation (3 tiles form a triangle and rotate positions)
      groupIndexes = [0, 2, 5]; // Example: top-left, top-right, bottom-left
      moveTargets = {
        [groupIndexes[0]]: groupIndexes[1],
        [groupIndexes[1]]: groupIndexes[2],
        [groupIndexes[2]]: groupIndexes[0]
      };
    } else if (patternType === 1) {
      // Square rotation (4 tiles in corners rotate)
      groupIndexes = [0, 2, 7, 5]; // top-left, top-right, bottom-right, bottom-left
      moveTargets = {
        [groupIndexes[0]]: groupIndexes[1],
        [groupIndexes[1]]: groupIndexes[2],
        [groupIndexes[2]]: groupIndexes[3],
        [groupIndexes[3]]: groupIndexes[0]
      };
    } else {
      // Row or column shift
      const isRow = Math.random() > 0.5;
      if (isRow) {
        // Shift a row (top, middle, or bottom)
        const rowToShift = Math.floor(Math.random() * 3);
        if (rowToShift === 0) {
          groupIndexes = [0, 1, 2]; // Top row
          moveTargets = {
            [groupIndexes[0]]: groupIndexes[1],
            [groupIndexes[1]]: groupIndexes[2],
            [groupIndexes[2]]: groupIndexes[0]
          };
        } else if (rowToShift === 1) {
          groupIndexes = [3, 4]; // Middle row (excluding center)
          moveTargets = {
            [groupIndexes[0]]: groupIndexes[1],
            [groupIndexes[1]]: groupIndexes[0]
          };
        } else {
          groupIndexes = [5, 6, 7]; // Bottom row
          moveTargets = {
            [groupIndexes[0]]: groupIndexes[1],
            [groupIndexes[1]]: groupIndexes[2],
            [groupIndexes[2]]: groupIndexes[0]
          };
        }
      } else {
        // Shift a column (left, middle, or right)
        const colToShift = Math.floor(Math.random() * 3);
        if (colToShift === 0) {
          groupIndexes = [0, 3, 5]; // Left column
          moveTargets = {
            [groupIndexes[0]]: groupIndexes[1],
            [groupIndexes[1]]: groupIndexes[2],
            [groupIndexes[2]]: groupIndexes[0]
          };
        } else if (colToShift === 1) {
          groupIndexes = [1, 6]; // Middle column (excluding center)
          moveTargets = {
            [groupIndexes[0]]: groupIndexes[1],
            [groupIndexes[1]]: groupIndexes[0]
          };
        } else {
          groupIndexes = [2, 4, 7]; // Right column
          moveTargets = {
            [groupIndexes[0]]: groupIndexes[1],
            [groupIndexes[1]]: groupIndexes[2],
            [groupIndexes[2]]: groupIndexes[0]
          };
        }
      }
    }
    
    // Create connections between the group tiles
    for (let i = 0; i < groupIndexes.length; i++) {
      const currentIndex = groupIndexes[i];
      const nextIndex = groupIndexes[(i + 1) % groupIndexes.length];
      
      setTimeout(() => {
        this.createConnection(
          this.tiles[currentIndex], 
          this.tiles[nextIndex], 
          0.7
        );
      }, i * 150);
    }
    
    // Wait a moment for the connections to show before moving
    setTimeout(() => {
      // Move each tile to its target position
      let completedMoves = 0;
      
      groupIndexes.forEach(index => {
        const targetIndex = moveTargets[index];
        const currentTile = this.tiles[index];
        const targetPosition = positions[targetIndex];
        const currentPosition = positions[index];
        
        // Calculate the required movement
        const dx = targetPosition.x - currentPosition.x;
        const dy = targetPosition.y - currentPosition.y;
        
        // Animate the tile to the new position
        gsap.to(currentTile, {
          x: `+=${dx}`,
          y: `+=${dy}`,
          duration: this.timingConfig.network.movementDuration,
          ease: this.easingConfig.movement.patternGroup,
          onComplete: () => {
            completedMoves++;
            if (completedMoves === groupIndexes.length) {
              // All moves complete
              this.activeTileMovement = false;
            }
          }
        });
      });
    }, groupIndexes.length * 150 + 300);
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
    
    // Mark that we're performing a tile movement
    this.activeTileMovement = true;
    
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
    let completedMoves = 0;
    
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
        delay: index * this.timingConfig.network.movementStaggerDelay,
        ease: easing,
        onStart: () => {
          this.log(`Starting clockwise animation for tile ${index}`);
        },
        onComplete: () => {
          this.log(`Completed clockwise animation for tile ${index}`);
          completedMoves++;
          if (completedMoves === this.tiles.length) {
            // All moves complete
            this.activeTileMovement = false;
          }
        }
      });
    });
  }

  moveCounterClockwise(easing = 'power2.inOut', duration = 1.5) {
    this.log(`Moving tiles counter-clockwise with ${easing} easing`);
    
    // Mark that we're performing a tile movement
    this.activeTileMovement = true;
    
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
    let completedMoves = 0;
    
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
        delay: index * this.timingConfig.network.movementStaggerDelay,
        ease: easing,
        onStart: () => {
          this.log(`Starting counter-clockwise animation for tile ${index}`);
        },
        onComplete: () => {
          this.log(`Completed counter-clockwise animation for tile ${index}`);
          completedMoves++;
          if (completedMoves === this.tiles.length) {
            // All moves complete
            this.activeTileMovement = false;
          }
        }
      });
    });
  }
  
  //==================================================
  // CONNECTION MAPPING METHODS
  //==================================================
  
  // Start the connection mapping process
  startConnectionMapping() {
    this.log('Starting connection mapping process...', 'info');
    
    // Stop any running animations
    this.stopAllAnimations();
    
    // Store original delay for restoration later
    const originalAnimationDelay = this.timingConfig.testing.animationDelay;
    
    // Create a connection map data structure
    this.connectionMap = {};
    
    // Generate all possible tile pairs
    const tilePairs = this.generateAllTilePairs();
    
    // Current pair index
    let currentPairIndex = 0;
    
    // Initialize container for visual test helpers
    this.initializeTestHelpers();
    
    // Test a single pair
    const testPair = (pair) => {
      // Clear any previous connections and helpers
      this.clearTestElements();
      
      // Create a header message
      this.log(`Testing connection ${currentPairIndex + 1}/${tilePairs.length}: ${pair.desc}`, 'info');
      console.log(`%c Testing: ${pair.desc} `, 'background: #444; color: #ff9; padding: 3px;');
      
      // Get the elements
      let fromElement, toElement;
      
      if (pair.fromCenter) {
        fromElement = this.centerTile;
      } else {
        fromElement = this.tiles[pair.from];
      }
      
      if (pair.toCenter) {
        toElement = this.centerTile;
      } else {
        toElement = this.tiles[pair.to];
      }
      
      // Get element information
      const rect1 = fromElement.getBoundingClientRect();
      const rect2 = toElement.getBoundingClientRect();
      
      // Adjust positions to be relative to the connections container
      const containerRect = this.connectionsContainer.getBoundingClientRect();
      
      // Calculate centers
      const center1 = {
        x: rect1.left + rect1.width/2 - containerRect.left,
        y: rect1.top + rect1.height/2 - containerRect.top
      };
      
      const center2 = {
        x: rect2.left + rect2.width/2 - containerRect.left,
        y: rect2.top + rect2.height/2 - containerRect.top
      };
      
      // Calculate direction vector
      const dir = {
        x: center2.x - center1.x,
        y: center2.y - center1.y
      };
      
      // Calculate distance between centers
      const distance = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
      
      // Normalize the direction vector
      const normalizedDir = {
        x: dir.x / distance,
        y: dir.y / distance
      };
      
      // Calculate angle in degrees
      const angle = Math.atan2(dir.y, dir.x) * (180 / Math.PI);
      
      // Log dimension information
      console.log('From element:', {
        position: pair.fromName,
        width: rect1.width,
        height: rect1.height,
        center: center1
      });
      
      console.log('To element:', {
        position: pair.toName,
        width: rect2.width, 
        height: rect2.height,
        center: center2
      });
      
      console.log('Connection data:', {
        distance,
        angle,
        direction: normalizedDir
      });
      
      // Calculate adaptive offsets based on angle and position
      const fromOffsets = this.calculateAdaptiveOffsets(
        pair.fromName, 
        angle, 
        rect1.width, 
        rect1.height, 
        true
      );
      
      const toOffsets = this.calculateAdaptiveOffsets(
        pair.toName, 
        (angle + 180) % 360, 
        rect2.width, 
        rect2.height, 
        false
      );
      
      // Store calculated offsets in the connection map
      this.connectionMap[pair.key] = {
        from: {
          position: pair.fromName,
          offsetX: fromOffsets.x,
          offsetY: fromOffsets.y,
          factorX: fromOffsets.factorX,
          factorY: fromOffsets.factorY
        },
        to: {
          position: pair.toName,
          offsetX: toOffsets.x,
          offsetY: toOffsets.y,
          factorX: toOffsets.factorX,
          factorY: toOffsets.factorY
        },
        angle,
        distance
      };
      
      // Calculate connection points
      const fromPoint = {
        x: center1.x + normalizedDir.x * fromOffsets.x,
        y: center1.y + normalizedDir.y * fromOffsets.y
      };
      
      const toPoint = {
        x: center2.x - normalizedDir.x * toOffsets.x,
        y: center2.y - normalizedDir.y * toOffsets.y
      };
      
      // Draw test helpers to visualize
      this.drawTestHelpers(center1, center2, fromPoint, toPoint);
      
      // Create connection with calculated offsets
      this.createTestConnection(fromPoint, toPoint, 10);
      
      // Output current map entry
      console.log('Current map entry:', {
        [pair.key]: this.connectionMap[pair.key]
      });
      
      // Move to the next pair
      currentPairIndex++;
      
      // When done, output the full map
      if (currentPairIndex >= tilePairs.length) {
        this.log('Connection mapping complete!', 'info');
        console.log('%c CONNECTION MAPPING COMPLETE ', 'background: #060; color: white; padding: 5px;');
        console.log('Full connection map:');
        console.log(JSON.stringify(this.connectionMap, null, 2));
        
        // Create a cleaned version of the map without test factors
        const cleanMap = {};
        Object.keys(this.connectionMap).forEach(key => {
          cleanMap[key] = {
            from: {
              position: this.connectionMap[key].from.position,
              offsetX: this.connectionMap[key].from.offsetX,
              offsetY: this.connectionMap[key].from.offsetY
            },
            to: {
              position: this.connectionMap[key].to.position,
              offsetX: this.connectionMap[key].to.offsetX,
              offsetY: this.connectionMap[key].to.offsetY
            }
          };
        });
        
        console.log('Clean connection map for implementation:');
        console.log(JSON.stringify(cleanMap, null, 2));
        
        // Restore original animation delay
        this.timingConfig.testing.animationDelay = originalAnimationDelay;
        
        // Clear any connections
        this.clearTestElements();
        
        return;
      }
      
      // Schedule the next pair test - use fast timing for testing
      this.nextConnectionMappingTimeout = setTimeout(() => {
        testPair(tilePairs[currentPairIndex]);
      }, this.timingConfig.testing.connectionTestDelay);
    };
    
    // Start with the first pair
    testPair(tilePairs[0]);
  }
  
  // Calculate adaptive offsets based on element position and connection angle
  calculateAdaptiveOffsets(position, angle, width, height, isFrom) {
    // Initialize with default values
    let offsetX = Math.min(width, height) * 0.4;
    let offsetY = Math.min(width, height) * 0.4;
    
    // Factors to adjust offset calculation (for fine-tuning)
    let factorX = 0.4;
    let factorY = 0.4;
    
    // Adjust based on position on the grid
    // These adjustments are position-specific tuning
    switch (position) {
      case 'top-left':
        // For top-left, we need different offsets based on angle
        if (angle >= -45 && angle < 45) {
          // Connecting to the right
          factorX = 0.45;
          factorY = 0.3;
        } else if (angle >= 45 && angle < 135) {
          // Connecting downward
          factorX = 0.3;
          factorY = 0.45;
        } else {
          // Other directions
          factorX = 0.4;
          factorY = 0.4;
        }
        break;
        
      case 'top-right':
        // For top-right, adjust based on angle
        if (angle >= 135 || angle < -135) {
          // Connecting to the left
          factorX = 0.45;
          factorY = 0.3;
        } else if (angle >= 45 && angle < 135) {
          // Connecting downward
          factorX = 0.3;
          factorY = 0.45;
        } else {
          factorX = 0.4;
          factorY = 0.4;
        }
        break;
        
      case 'bottom-left':
        // For bottom-left, adjust based on angle
        if (angle >= -45 && angle < 45) {
          // Connecting to the right
          factorX = 0.45;
          factorY = 0.3;
        } else if (angle >= -135 && angle < -45) {
          // Connecting upward
          factorX = 0.3;
          factorY = 0.45;
        } else {
          factorX = 0.4;
          factorY = 0.4;
        }
        break;
        
      case 'bottom-right':
        // For bottom-right, adjust based on angle
        if (angle >= 135 || angle < -135) {
          // Connecting to the left
          factorX = 0.45;
          factorY = 0.3;
        } else if (angle >= -135 && angle < -45) {
          // Connecting upward
          factorX = 0.3;
          factorY = 0.45;
        } else {
          factorX = 0.4;
          factorY = 0.4;
        }
        break;
        
      case 'center':
        // For center tile, use slightly larger offsets
        factorX = 0.5;
        factorY = 0.5;
        break;
        
      default:
        // For other positions, use angle-based calculations
        if (Math.abs(angle) <= 45 || Math.abs(angle) >= 135) {
          // Horizontal connections need more X offset
          factorX = 0.45;
          factorY = 0.35;
        } else {
          // Vertical connections need more Y offset
          factorX = 0.35;
          factorY = 0.45;
        }
    }
    
    // Calculate actual offsets based on factors
    offsetX = width * factorX;
    offsetY = height * factorY;
    
    // Further adjust based on angle
    // For diagonal connections, adjust to reach closer to corners
    if ((Math.abs(angle) > 30 && Math.abs(angle) < 60) || 
        (Math.abs(angle) > 120 && Math.abs(angle) < 150)) {
      
      // For diagonal connections, boost both offsets
      offsetX *= 1.1;
      offsetY *= 1.1;
    }
    
    return { x: offsetX, y: offsetY, factorX, factorY };
  }
  
  // Initialize visual test helpers
  initializeTestHelpers() {
    // Create a group for test elements
    this.testElements = document.createElementNS(this.svgNS, "g");
    this.testElements.setAttribute("class", "test-helpers");
    this.connectionsContainer.appendChild(this.testElements);
  }
  
  // Clear test elements
  clearTestElements() {
    // Remove any previous test helpers
    while (this.connectionsContainer.firstChild) {
      this.connectionsContainer.removeChild(this.connectionsContainer.firstChild);
    }
    
    // Re-initialize
    this.initializeTestHelpers();
  }
  
  // Draw visual test helpers
  drawTestHelpers(center1, center2, fromPoint, toPoint) {
    // Draw center points
    this.drawPoint(center1.x, center1.y, this.styleConfig.testHelpers.centers.color);
    this.drawPoint(center2.x, center2.y, this.styleConfig.testHelpers.centers.color);
    
    // Draw connection points
    this.drawPoint(fromPoint.x, fromPoint.y, this.styleConfig.testHelpers.connectionPoints.color);
    this.drawPoint(toPoint.x, toPoint.y, this.styleConfig.testHelpers.connectionPoints.color);
    
    // Draw guide line between centers
    this.drawLine(center1.x, center1.y, center2.x, center2.y, this.styleConfig.testHelpers.guideLine.color);
  }
  
  // Draw a point helper
  drawPoint(x, y, color, radius = null) {
    // Use configured point style based on color
    let pointStyle;
    
    if (color === this.styleConfig.testHelpers.centers.color) {
      pointStyle = this.styleConfig.testHelpers.centers;
    } else if (color === this.styleConfig.testHelpers.connectionPoints.color) {
      pointStyle = this.styleConfig.testHelpers.connectionPoints;
    } else {
      // Default style
      pointStyle = { color, radius: radius || 3 };
    }
    
    const point = document.createElementNS(this.svgNS, "circle");
    point.setAttribute("cx", x);
    point.setAttribute("cy", y);
    point.setAttribute("r", pointStyle.radius);
    point.setAttribute("fill", pointStyle.color);
    this.testElements.appendChild(point);
    return point;
  }
  
  // Draw a line helper
  drawLine(x1, y1, x2, y2, color, width = null, dashed = false) {
    // Use configured line style or defaults
    let lineStyle;
    
    if (color === this.styleConfig.testHelpers.guideLine.color) {
      lineStyle = this.styleConfig.testHelpers.guideLine;
    } else {
      // Default style
      lineStyle = { color, width: width || 1 };
    }
    
    const line = document.createElementNS(this.svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", lineStyle.color);
    line.setAttribute("stroke-width", lineStyle.width);
    
    if (dashed) {
      line.setAttribute("stroke-dasharray", "4,4");
    }
    
    this.testElements.appendChild(line);
    return line;
  }
  
  // Create a test connection
  createTestConnection(fromPoint, toPoint, duration = null) {
    // Use configured test style
    const testStyle = this.styleConfig.connection.testing;
    const testDuration = duration || 5;
    
    // Create line element
    const line = document.createElementNS(this.svgNS, "line");
    line.setAttribute("x1", fromPoint.x);
    line.setAttribute("y1", fromPoint.y);
    line.setAttribute("x2", toPoint.x);
    line.setAttribute("y2", toPoint.y);
    line.setAttribute("stroke", testStyle.stroke);
    line.setAttribute("stroke-width", testStyle.strokeWidth);
    
    // Add to test elements
    this.testElements.appendChild(line);
    
    // Simple fade in animation
    gsap.fromTo(line, 
      { opacity: 0 },
      { opacity: 1, duration: this.timingConfig.testing.visualDuration }
    );
    
    return line;
  }
  
  // Generate all possible tile pairs for mapping
  generateAllTilePairs() {
    const pairs = [];
    
    // Add regular tile pairs
    for (let i = 0; i < this.tiles.length; i++) {
      for (let j = i + 1; j < this.tiles.length; j++) {
        pairs.push({
          from: i,
          to: j,
          fromName: this.positionMap[i],
          toName: this.positionMap[j],
          fromCenter: false,
          toCenter: false,
          key: `${this.positionMap[i]}-to-${this.positionMap[j]}`,
          desc: `${this.positionMap[i]} to ${this.positionMap[j]}`
        });
      }
    }
    
    // Add center to each tile connections
    for (let i = 0; i < this.tiles.length; i++) {
      pairs.push({
        from: i,
        to: 'center',
        fromName: this.positionMap[i],
        toName: 'center',
        fromCenter: false,
        toCenter: true,
        key: `${this.positionMap[i]}-to-center`,
        desc: `${this.positionMap[i]} to center`
      });
    }
    
    return pairs;
  }
  
  //==================================================
  // CONNECTION REFINEMENT METHODS
  //==================================================
  
  startConnectionRefinement() {
    this.log('Starting connection refinement mode...', 'info');
    
    // Stop any running animations
    this.stopAllAnimations();
    
    // Get the connection key to refine
    const connectionKey = this.options.refinementConnection;
    
    if (!connectionKey) {
      this.log('No connection specified for refinement. Please set options.refinementConnection', 'error');
      return;
    }
    
    if (!this.connectionMap[connectionKey]) {
      this.log(`Connection "${connectionKey}" not found in connection map`, 'error');
      return;
    }
    
    this.log(`Refining connection: ${connectionKey}`, 'info');
    
    // Initialize visual test helpers
    this.initializeTestHelpers();
    
    // Function to test this connection repeatedly
    const testConnection = () => {
      // Clear any previous test elements
      this.clearTestElements();
      
      // Get endpoints for this connection
      const connectionData = this.parseConnectionKey(connectionKey);
      if (!connectionData) return;
      
      const { fromElement, toElement } = connectionData;
      
      // Get current connection settings
      const currentSettings = this.connectionMap[connectionKey];
      
      // Get element information
      const rect1 = fromElement.getBoundingClientRect();
      const rect2 = toElement.getBoundingClientRect();
      
      // Adjust positions to be relative to the connections container
      const containerRect = this.connectionsContainer.getBoundingClientRect();
      
      // Calculate centers
      const center1 = {
        x: rect1.left + rect1.width/2 - containerRect.left,
        y: rect1.top + rect1.height/2 - containerRect.top
      };
      
      const center2 = {
        x: rect2.left + rect2.width/2 - containerRect.left,
        y: rect2.top + rect2.height/2 - containerRect.top
      };
      
      // Calculate direction vector
      const dir = {
        x: center2.x - center1.x,
        y: center2.y - center1.y
      };
      
      // Calculate distance between centers
      const distance = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
      
      // Normalize the direction vector
      const normalizedDir = {
        x: dir.x / distance,
        y: dir.y / distance
      };
      
      // Calculate connection points using current settings
      const fromPoint = {
        x: center1.x + normalizedDir.x * currentSettings.from.offsetX,
        y: center1.y + normalizedDir.y * currentSettings.from.offsetY
      };
      
      const toPoint = {
        x: center2.x - normalizedDir.x * currentSettings.to.offsetX,
        y: center2.y - normalizedDir.y * currentSettings.to.offsetY
      };
      
      // Draw test helpers to visualize
      this.drawTestHelpers(center1, center2, fromPoint, toPoint);
      
      // Create connection
      this.createTestConnection(fromPoint, toPoint, 5);
      
      // Schedule the next test
      this.nextRefinementTimeout = setTimeout(testConnection, this.options.connectionRepeatDelay);
    };
    
    // Start testing
    testConnection();
  }
  
  // Helper to parse a connection key
  parseConnectionKey(key) {
    // Split the key to get position names
    const parts = key.split('-to-');
    if (parts.length !== 2) {
      this.log(`Invalid connection key format: ${key}`, 'error');
      return null;
    }
    
    const fromPositionName = parts[0];
    const toPositionName = parts[1];
    
    // Get the elements based on position names
    let fromElement, toElement;
    
    if (fromPositionName === 'center') {
      fromElement = this.centerTile;
    } else {
      const fromIndex = this.positionMap.indexOf(fromPositionName);
      if (fromIndex === -1) {
        this.log(`Invalid from position: ${fromPositionName}`, 'error');
        return null;
      }
      fromElement = this.tiles[fromIndex];
    }
    
    if (toPositionName === 'center') {
      toElement = this.centerTile;
    } else {
      const toIndex = this.positionMap.indexOf(toPositionName);
      if (toIndex === -1) {
        this.log(`Invalid to position: ${toPositionName}`, 'error');
        return null;
      }
      toElement = this.tiles[toIndex];
    }
    
    return {
      fromElement,
      toElement,
      fromPosition: fromPositionName,
      toPosition: toPositionName
    };
  }
  
  // Utility: Shuffle array using Fisher-Yates algorithm
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}