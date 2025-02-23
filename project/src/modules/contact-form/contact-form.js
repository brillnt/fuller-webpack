import { select, selectId, on } from '../../utils/helpers.js';
import Base from '../base/base.js';

export default class ContactForm extends Base {
  constructor(elementId, debug = false) {
    super(debug);
    if (!elementId) return;
    this.log(`initialized with elementId: ${elementId}`);

    this.element = selectId(elementId);
    this.triggerSelect = this.element.querySelector('#fuller-Interest');
    this.multiSelectContainer = this.element.querySelector('#multi-select-container');
    this.triggerValue = 'Product Inquiry';

    if (!this.element) {
      this.log(`Element with ID ${elementId} not found.`);
      return;
    }

    this.init();
  }

  init() {
    this.multiSelectContainer.style.display = 'none';

    on(this.triggerSelect, 'change', () => {
      if (this.triggerSelect.value === this.triggerValue) {
        this.multiSelectContainer.style.display = 'block';
      } else {
        this.multiSelectContainer.style.display = 'none';
      }
    });
  }
}