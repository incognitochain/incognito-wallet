/**
 * FOR NOW, THIS IS GOOD ENOUGH
 */

class Log {
  constructor() {
    console.info('Production logger is enabled');
  }
  /**
   * This log will appear in both DEV & PROD
   * If you only want to log on DEV, use console.* built-in or "logDev" method
   */
  log() {
    console.debug.apply(null, arguments);
    return this;
  }

  /**
   * This log only will appear in DEV
   */
  logDev() {
    // if (__DEV__) {
    //   console.debug.apply(null, arguments);
    // }

    return this;
  }
}

export default new Log();
