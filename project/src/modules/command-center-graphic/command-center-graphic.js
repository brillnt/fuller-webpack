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
    
    // Animation timing configuration
    this.animationDelay = 3000;
    this.staggerDelay = 0.022;
    this.iterationCount = 0;
    this.pulseFrequency = 2000; // How often pulses occur
    this.connectionFrequency = 3500; // How often connections appear
    this.brainPulseFrequency = 8000; // How often the center "brain" pulses
    
    // Track active animations
    this.activeAnimations = {
      pulses: [],
      connections: [],
      brainPulse: null
    };
    
    // SVG namespace for creating elements
    this.svgNS = "http://www.w3.org/2000/svg";
    
    // Create container for connection lines
    this.setupConnectionsContainer();
    
    this.init();
  }

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
        this.log(`Reveal animation complete. Starting intelligent network animation...`);
        // After the reveal animation completes, start our animation sequence
        setTimeout(() => this.startIntelligentNetwork(), this.animationDelay);
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

  startIntelligentNetwork() {
    this.log('Starting adaptive intelligence network animations');
    
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
    // Randomize the delay before the next movement (between 2-5 seconds)
    const nextDelay = 2000 + Math.random() * 3000;
    
    setTimeout(() => {
      // Decide which type of movement to perform
      const movementType = Math.random();
      
      if (movementType < 0.25) {
        // 25% chance: Move all tiles clockwise
        this.moveClockwise('expo.out', 1);
      } else if (movementType < 0.4) {
        // 15% chance: Move all tiles counterclockwise
        this.moveCounterClockwise('power4.inOut', 1.2);
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
      if (this.activeTileMovement) return;
      
      const randomIndex = Math.floor(Math.random() * this.tiles.length);
      const tile = this.tiles[randomIndex];
      
      // Create pulse animation
      const pulseAnim = gsap.timeline();
      
      // Add subtle glow
      pulseAnim.to(tile, {
        scale: 1.05,
        filter: 'brightness(1.2)',
        duration: 0.5,
        ease: 'sine.inOut'
      });
      
      // Return to normal
      pulseAnim.to(tile, {
        scale: 1,
        filter: 'brightness(1)',
        duration: 0.5,
        ease: 'sine.inOut'
      });
      
      // Schedule the next random pulse
      setTimeout(startPulse, this.pulseFrequency * (0.5 + Math.random()));
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
      this.createConnection(tile1, tile2);
      
      // Schedule the next random connection
      setTimeout(startConnection, this.connectionFrequency * (0.7 + Math.random() * 0.6));
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
        scale: 1.1,
        filter: 'brightness(1.5) drop-shadow(0 0 5px rgba(255,255,255,0.7))',
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)'
      });
      
      // Return to normal
      pulseAnim.to(this.centerTile, {
        scale: 1,
        filter: 'none',
        duration: 0.5,
        ease: 'power2.out'
      });
      
      // Affect surrounding tiles
      this.tiles.forEach((tile, index) => {
        // Stagger effect radiating from center
        const delay = 0.05 * (index % 4);
        
        // Create a smaller pulse on each surrounding tile
        gsap.timeline()
          .to(tile, {
            scale: 1.03,
            filter: 'brightness(1.2)',
            duration: 0.3,
            delay: delay,
            ease: 'sine.out'
          })
          .to(tile, {
            scale: 1,
            filter: 'none',
            duration: 0.4,
            ease: 'power1.out'
          });
      });
      
      // Create multiple connections from center after the pulse
      setTimeout(() => {
        // Connect center to 3-4 random tiles
        const numConnections = 3 + Math.floor(Math.random() * 2);
        const shuffledTiles = this.shuffleArray([...this.tiles]).slice(0, numConnections);
        
        shuffledTiles.forEach((tile, i) => {
          setTimeout(() => {
            this.createConnection(this.centerTile, tile, 0.7, {
              stroke: 'rgba(255,255,255,0.7)',
              strokeWidth: 2
            });
          }, i * 200);
        });
      }, 700);
      
      // Schedule the next brain pulse
      setTimeout(startBrainPulse, this.brainPulseFrequency * (0.9 + Math.random() * 0.2));
    };
    
    // Start the brain pulse cycle
    setTimeout(startBrainPulse, this.brainPulseFrequency / 2);
  }
  
  createConnection(element1, element2, duration = 1.2, style = {}) {
    // Get the center positions of both elements
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    // Adjust positions to be relative to the connections container
    const containerRect = this.connectionsContainer.getBoundingClientRect();
    
    const x1 = rect1.left + rect1.width/2 - containerRect.left;
    const y1 = rect1.top + rect1.height/2 - containerRect.top;
    const x2 = rect2.left + rect2.width/2 - containerRect.left;
    const y2 = rect2.top + rect2.height/2 - containerRect.top;
    
    // Create line element
    const line = document.createElementNS(this.svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", style.stroke || "rgba(105, 240, 174, 0.5)"); // Serenity green with transparency
    line.setAttribute("stroke-width", style.strokeWidth || 1.5);
    line.setAttribute("stroke-dasharray", "5,5");
    
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
      { opacity: 0, strokeDashoffset: 100 },
      { opacity: 1, strokeDashoffset: 0, duration: duration * 0.4, ease: "power2.inOut" }
    );
    
    // Pulse
    lineAnim.to(line, { 
      opacity: 0.7, 
      stroke: style.pulseColor || "rgba(255, 255, 255, 0.8)", 
      duration: duration * 0.2, 
      yoyo: true, 
      repeat: 1,
      ease: "sine.inOut" 
    });
    
    // Fade out
    lineAnim.to(line, { 
      opacity: 0, 
      duration: duration * 0.3, 
      ease: "power2.in" 
    });
    
    return lineAnim;
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
      ease: "back.inOut(2)",
      delay: 0.3
    });
    
    gsap.to(tile2, {
      x: `+=${pos1.x - pos2.x}`,
      y: `+=${pos1.y - pos2.y}`,
      duration: 1,
      ease: "back.inOut(2)",
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
          0.7,
          { stroke: "rgba(105, 240, 174, 0.7)", strokeWidth: 2 }
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
          duration: 1.2,
          ease: "power3.inOut",
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
        delay: index * this.staggerDelay,
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
        delay: index * this.staggerDelay,
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
