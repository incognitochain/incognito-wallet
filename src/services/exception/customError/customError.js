import MESSAGE from './message';
import types from './types';
import { genCode } from './utils';

class CustomError extends Error {
  /**
   * 
   * @param {string | number} code 
   * @param {string} name
   * @param {string} name
   * @param {string} message
   * @param {object} rawError error object, ex: new Error();
   */
  constructor(code, { name, message, rawError } = {}) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.name = name || CustomError.TYPES.KNOWN_ERROR;
    this.message = message || 'Unknown error';
    this.rawError = rawError;
    this.code = code;

    // must to check the code of KNOWN_ERROR
    if (this.name === CustomError.TYPES.KNOWN_ERROR) {
      if (MESSAGE[code]) {
        this.message = MESSAGE[code];
      } else {
        throw new Error(`Invalid ${this.name} code! (code ${code})`);
      }
    } else if (this.name === CustomError.TYPES.API_ERROR) {
      this.handleApiError(code);
    } else if (this.name === CustomError.TYPES.WEB_JS_ERROR) {
      this.handleWebJsError(code);
    }

    // Custom debugging information
    this.date = new Date();
  }

  handleApiError(code) {
    this.code = genCode(types.API_ERROR, code);
  }

  handleWebJsError(code) {
    this.code = genCode(types.WEB_JS_ERROR, code);
  }
}

CustomError.TYPES = types;

export default CustomError;
