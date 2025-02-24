import { select, selectId } from '../../utils/helpers.js'; // Assuming these are still needed
import Base from '../base/base.js'; // Assuming this is still needed
import { gsap } from '../../utils/animation.js'; // Assuming this is still needed

import './fuller-network-graphic.css';

export default class FullerNetworkGraphic extends Base {
  constructor(elementId, debug = false) {
    super(debug);

    this.log(`initialized with elementId: ${elementId}`);

    this.containerId = elementId;
    this.container = document.getElementById(elementId);

    if (!this.container) {
      this.log(`Element with ID '${elementId}' not found.`);
      return;
    }

    this.nodes = [];
    this.nodeData = [
      { svgId: 'manufacturing-icon', type: 'manufacturing' }, // Use svgId instead of icon path
      { svgId: 'materials-icon', type: 'materials' },      // Use svgId instead of icon path
      { svgId: 'timeline-icon', type: 'timeline' },       // Use svgId instead of icon path
      { svgId: 'paperwork-icon', type: 'paperwork' },      // Use svgId instead of icon path
      { svgId: 'blueprint-icon', type: 'blueprint' },      // Use svgId instead of icon path
    ];
    this.centerNodeSvgId = 'fuller-f-icon'; // Use svgId for center icon
    this.centerNode = null;
    this.gsapTimeline = gsap.timeline({ paused: true });
    this.observer = null;

    this.init();
  }

  init() {
    if (!this.container) {
      console.error(`Container element with ID '${this.containerId}' not found.`);
      return;
    }
    this.initNodes();
    this.animateNodes();
    this.setupIntersectionObserver();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  initNodes() {
    // 1. Create center node
    this.centerNode = document.createElement('div');
    this.centerNode.classList.add('network-node', 'center-node');
    this.centerNode.innerHTML = `
            <svg class="node-svg">
                <use href="#${this.centerNodeSvgId}" />
            </svg>`; // Use <use> element referencing svgId
    this.container.appendChild(this.centerNode);
    this.nodes.push(this.centerNode);

    // 2. Create branching nodes based on nodeData
    this.nodeData.forEach(data => {
      const node = document.createElement('div');
      node.classList.add('network-node');
      node.dataset.type = data.type;
      node.innerHTML = `
                <svg class="node-svg">
                    <use href="#${data.svgId}" />
                </svg>`; // Use <use> element referencing svgId
      this.container.appendChild(node);
      this.nodes.push(node);
    });

    this.positionNodes();
  }


  positionNodes() {
    const containerRect = this.container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const centerNodeRadius = 100;
    const branchNodeRadius = 75;
    const numBranchNodes = this.nodeData.length;
    const angleIncrement = (Math.PI * 2) / numBranchNodes;
    const distanceFromCenter = Math.min(containerWidth, containerHeight) / 3;

    // Center Node
    gsap.set(this.centerNode, {
      xPercent: -50,
      yPercent: -50,
      x: containerWidth / 2,
      y: containerHeight / 2,
      width: centerNodeRadius,
      height: centerNodeRadius,
    });


    // Branch Nodes
    this.nodeData.forEach((data, index) => {
      const node = this.nodes[index + 1];
      const angle = index * angleIncrement;
      const x = containerWidth / 2 + Math.cos(angle) * distanceFromCenter;
      const y = containerHeight / 2 + Math.sin(angle) * distanceFromCenter;

      gsap.set(node, {
        xPercent: -50,
        yPercent: -50,
        x: x,
        y: y,
        width: branchNodeRadius,
        height: branchNodeRadius,
        opacity: 0,
        scale: 0,
      });
    });
  }


  animateNodes() {
    this.gsapTimeline.clear();

    // Center Node Animation
    this.gsapTimeline.to(this.centerNode, {
      y: "-=10",
      duration: 2.5,
      yoyo: true,
      repeat: -1,
      ease: "linear",
    }, 0);

    // Branch Nodes Animation
    this.nodeData.forEach((data, index) => {
      const node = this.nodes[index + 1];
      this.gsapTimeline.to(node, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "expo.out",
        delay: index * 0.1,
      }, 0.2);

      // Hover effect
      gsap.to(node, {
        scale: 1.1,
        duration: 0.3,
        ease: "expo.out",
        paused: true,
        overwrite: "auto",
        onStart: () => { node.style.zIndex = 10; },
        onReverseComplete: () => { node.style.zIndex = ''; }
      }).eventCallback("onComplete", function () {
        node.addEventListener('mouseenter', () => this.play());
        node.addEventListener('mouseleave', () => this.reverse());
      }.bind(gsap.getTweensOf(node)[0]));

    });

    this.gsapTimeline.play();
  }

  handleResize() {
    this.positionNodes();
    this.gsapTimeline.restart();
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.gsapTimeline.play();
        } else {
          this.gsapTimeline.pause();
        }
      });
    }, { threshold: 0.1 });

    this.observer.observe(this.container);
  }

  destroy() {
    this.gsapTimeline.kill();
    this.observer.disconnect();
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.nodes = [];
  }
}
