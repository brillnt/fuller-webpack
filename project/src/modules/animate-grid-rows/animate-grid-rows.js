import { selectId } from '../../utils/helpers.js';
import { gsap, ScrollTrigger } from '../../utils/animation.js';
import './animate-grid-rows.css';

export default class AnimateGridRows {
  constructor(elementId, prefix, anchorLeft = true) {
    if (!elementId) return;

    this.selectorId = elementId;
    this.prefix = prefix;
    this.anchorLeft = anchorLeft;
    
    // Element is now the viewport with overflow hidden
    this.element = selectId(this.selectorId);
    
    // Container is the direct parent (wide container)
    this.container = this.element.querySelector(`.${prefix}-block-window`);
    
    // Grid rows should now be selected from the container
    this.gridRows = this.container.querySelectorAll(`.${prefix}-block-row`);
    
    this.init();
  }

  init() {
    console.log(`AnimateGridRows initialized with:`);
    console.log(`- Viewport element:`, this.element);
    console.log(`- Container (direct parent):`, this.container);
    console.log(`- Grid rows:`, this.gridRows);
    
    // Calculate dimensions and set initial positions
    this.calculateDimensions();
    this.setInitialPositions();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.calculateDimensions();
      this.setInitialPositions();
    });
    
    // Start animations for all rows
    this.animateAllRows();
  }
  
  // Removed visual indicators method as it's no longer needed
  
  calculateDimensions() {
    // Get viewport dimensions (now using this.element)
    this.viewportWidth = this.element.offsetWidth;
    console.log(`Viewport width: ${this.viewportWidth}px`);
    
    // Calculate row dimensions
    this.rowDimensions = [];
    this.gridRows.forEach((row, index) => {
      const rowWidth = row.scrollWidth;
      console.log(`Row ${index} width: ${rowWidth}px`);
      this.rowDimensions[index] = { width: rowWidth };
    });
  }
  
  setInitialPositions() {
    // Process each row by specific index
    this.gridRows.forEach((row, index) => {
      const rowWidth = this.rowDimensions[index].width;
      let initialPosition = 0;
      
      if (index === 0) {
        // Top row (index 0): left edge flush with viewport left edge
        initialPosition = 0;
        console.log(`Row ${index} (TOP): Setting left edge flush with viewport left edge`);
      } else if (index === 1) {
        // Bottom row (index 1): right edge flush with viewport right edge
        initialPosition = this.viewportWidth - rowWidth;
        console.log(`Row ${index} (BOTTOM): Setting right edge flush with viewport right edge`);
      } else {
        // Handle any additional rows (if present)
        initialPosition = index % 2 === 0 ? 0 : (this.viewportWidth - rowWidth);
        console.log(`Row ${index}: Positioning based on index parity`);
      }
      
      // Apply position
      gsap.set(row, { x: initialPosition });
      
      console.log(`Row ${index} positioned at: ${initialPosition}px (row width: ${rowWidth}px, viewport width: ${this.viewportWidth}px)`);
    });
  }
  
  animateAllRows() {
    // Animate each row based on its index, with staggered timing
    this.gridRows.forEach((row, index) => {
      // Odd rows (index 0, 2, 4...) start immediately
      // Even rows (index 1, 3, 5...) start with a 1-second delay
      const isEvenRow = index % 2 !== 0;
      const startDelay = isEvenRow ? 1000 : 0;
      
      // Start the animation with appropriate delay
      setTimeout(() => {
        this.animateRow(row, index);
      }, startDelay);
    });
  }
  
  animateRow(row, index) {
    const rowWidth = this.rowDimensions[index].width;
    
    // Determine behavior based on even/odd index (CSS-like)
    // Index 0, 2, 4... (first-child-like/odd) start from left
    // Index 1, 3, 5... (second-child-like/even) start from right
    const isOddRow = index % 2 === 0;
    
    // Calculate the actual boundaries (same for all rows)
    const leftBoundary = -(rowWidth - this.viewportWidth);  // Furthest left position
    const rightBoundary = 0;  // Furthest right position
    
    // Set initial position and direction based on row parity
    let currentPosition;
    let direction;
    
    if (isOddRow) {
      // Odd rows (index 0, 2, 4...) start left-aligned and move left initially
      currentPosition = rightBoundary; // Right boundary is 0 (left-aligned)
      direction = -1; // Move left first
      console.log(`Row ${index} (odd-like): Starting left-aligned (${currentPosition}px), moving left initially`);
    } else {
      // Even rows (index 1, 3, 5...) start right-aligned and move right initially
      currentPosition = leftBoundary; // Left boundary is -(rowWidth - viewportWidth) (right-aligned)
      direction = 1; // Move right first
      console.log(`Row ${index} (even-like): Starting right-aligned (${currentPosition}px), moving right initially`);
    }
    
    console.log(`Row ${index} animation initialized:`);
    console.log(`- Row width: ${rowWidth}px`);
    console.log(`- Viewport width: ${this.viewportWidth}px`);
    console.log(`- Left boundary: ${leftBoundary}px`);
    console.log(`- Right boundary: ${rightBoundary}px`);
    console.log(`- Initial position: ${currentPosition}px`);
    console.log(`- Initial direction: ${direction > 0 ? 'right' : 'left'}`);
    
    // Animation step function
    const animateStep = () => {
      // Standard step size
      const stepSize = 200;
      
      // Calculate next position with standard step
      let nextPosition = currentPosition + (direction * stepSize);
      
      // Calculate the position after the next one (looking ahead)
      let positionAfterNext = nextPosition + (direction * stepSize);
      
      // Check boundaries based on direction of movement
      if (direction < 0) { // Moving left
        // Check if we'd go beyond left boundary
        if (nextPosition < leftBoundary) {
          nextPosition = leftBoundary;
          direction = 1; // Reverse to right
          console.log(`Row ${index}: Left boundary hit, reversing direction`);
        } 
        // Check if we'd hit left boundary on NEXT step
        else if (positionAfterNext < leftBoundary) {
          nextPosition = leftBoundary;
          direction = 1; // Reverse to right
          console.log(`Row ${index}: Future left boundary detected, going to boundary`);
        }
      } else { // Moving right
        // Check if we'd go beyond right boundary
        if (nextPosition > rightBoundary) {
          nextPosition = rightBoundary;
          direction = -1; // Reverse to left
          console.log(`Row ${index}: Right boundary hit, reversing direction`);
        } 
        // Check if we'd hit right boundary on NEXT step
        else if (positionAfterNext > rightBoundary) {
          nextPosition = rightBoundary;
          direction = -1; // Reverse to left
          console.log(`Row ${index}: Future right boundary detected, going to boundary`);
        }
      }
      
      console.log(`Row ${index}: Animating from ${currentPosition}px to ${nextPosition}px`);

      gsap.to(row, {
        x: nextPosition,
        duration: 1, // 1 second animation
        delay: isOddRow ? 0 : 0.25, // No delay for odd rows, 1-second delay for even rows
        ease: "expo.inOut",
        scrollTrigger: {
          trigger: this.element,
          start: 'top 50%',
          toggleActions: 'play pause resume pause'
        },
        onComplete: () => {
          // Update current position
          currentPosition = nextPosition;
          
          // Schedule next animation step
          setTimeout(animateStep, 2000); // 2-second interval
        }
      });
    };
    
    // Start the animation loop
    animateStep();
  }
}