import FutureGallery from './future-gallery.js';
import { selectId } from '../../utils/helpers.js';

// mocks are set up in <root>/test/jest.setup.js

describe('FutureGallery', () => {
  let element;

  beforeEach(() => {
    // Set up the DOM element
    element = document.createElement('div');
    element.id = 'future-gallery';
    element.innerHTML = `
      <div class="fuller-gallery__header-list">
        <div class="fuller-gallery__header" data-layout-id="1"></div>
        <div class="fuller-gallery__header" data-layout-id="2"></div>
      </div>
      <div class="fuller-gallery__list-collection">
        <div class="fuller-gallery__list" data-layout-id="1"></div>
        <div class="fuller-gallery__list" data-layout-id="2"></div>
      </div>
      <div class="fuller-gallery__model-list">
        <div class="fuller-gallery__model" data-layout-id="1"></div>
        <div class="fuller-gallery__model" data-layout-id="2"></div>
      </div>
      <div class="fuller-gallery-prev"></div>
      <div class="fuller-gallery-next"></div>
      <div class="fuller-gallery-controls">
        <div class="fuller-gallery-control" data-layout-id="1"></div>
        <div class="fuller-gallery-control" data-layout-id="2"></div>
      </div>
    `;
    document.body.appendChild(element);

    // Mock the selectId function to return the element
    selectId.mockReturnValue(element);
  });

  afterEach(() => {
    // Clean up the DOM
    document.body.removeChild(element);
  });

  test('should initialize with the correct element', () => {
    const futureGallery = new FutureGallery('future-gallery');
    expect(futureGallery.element).toBe(element);
  });

  test('should set up controls correctly', () => {
    const futureGallery = new FutureGallery('future-gallery');
    expect(futureGallery.controls.length).toBe(2);
  });

  // Add more tests for other methods and functionalities
});
