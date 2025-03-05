export default class Base {
  constructor(debug = false) {
    this.debug = debug;
  }

  log(...args) {
    if (this.debug) {
      console.log(`DEBUG [${this.constructor.name}]:`, ...args);
    }
  }

  logObject(...args) {
    if (this.debug) {
      console.log(`DEBUG OBJECT [${this.constructor.name}]:`);
      console.dir(...args);
    }
  }
}