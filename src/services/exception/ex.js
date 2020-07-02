import _ from 'lodash';
import {Toast} from '@src/components/core';
import CustomError from './customError/customError';
import Message from './customError/message';
import ERROR from './customError/code';

const CODES = {
  CAN_NOT_SEND_TX: '-4002',
  CAN_NOT_SEND_PTOKEN_TX: '-1003',
  OLD_REPLACEMENT: '-1022',
  REPLACEMENT: '-6009',
  DOUBLE_SPEND: '-6005',
  NOT_ENOUGH_COIN: 'WEB_JS_ERROR(-5)',
  INVALID_FEE: '-1016',
  INVALID_TX: '-1001',
  INVALID_INPUT: '-1003',
  INVALID_TIME: '-6008',
};

const MESSAGES = {
  PENDING_TX:
    'Please wait for your previous transaction to finish processing. Simply try again later.',
  CAN_NOT_SEND_TX:
    'It looks like your transaction didn\'t go through.  Please wait a few minutes and try again',
  GENERAL: 'Something went wrong. Please try again.',
};

const isValidException = exception => {
  if (exception instanceof Error) {
    return true;
  }

  if (exception?.message && exception?.name && exception?.stack) {
    return true;
  }

  return false;
};

class Exception {
  /**
   *
   * @param {any} exception
   * @param {string} defaultMessage
   * `exception` can be a Error object or a string
   * `defaultMessage` will be used as friendly message (which displays to users, not for debugging)
   */
  constructor(
    exception: any,
    defaultMessage: string = 'Opps! Something went wrong.',
  ) {
    if (isValidException(exception)) {
      this.exception = exception;

      // find friendly message
      if (exception.name === CustomError.TYPES.KNOWN_ERROR) {
        this.message = exception?.message;
        this.debugMessage = exception?.rawError?.stack;
      } else if (exception.name === CustomError.TYPES.API_ERROR) {
        Message[(this.exception?.code)] &&
          (this.message = Message[this.exception.code]);
      } else if (exception.name === CustomError.TYPES.WEB_JS_ERROR) {
        Message[(this.exception?.code)] &&
          (this.message = Message[this.exception.code]);
      }
    } else if (typeof exception === 'string') {
      this.exception = new Error(exception);
    }

    if (!this.exception) {
      this.exception = new Error('Unknown error');
    }

    /**
     * Message for debug
     */
    this.debugMessage = this.debugMessage ?? this.exception?.message;

    /**
     * Message for UI (display to user)
     */
    this.message =
      this.message ??
      this._getUnexpectedMessageError(exception, defaultMessage);

    this._log2Console();
  }

  _getUnexpectedMessageError(exception, defaultMessage) {
    const message = exception?.message || '';

    if (message) {
      return `${defaultMessage}\n${message ? message : ''}`;
    }

    return defaultMessage;
  }

  /**
   *
   * @param {string} message
   * override exception message.
   * Use for debug, log,...
   */
  setDebugMessage(message: string) {
    this.debugMessage = message;
    return this;
  }

  /**
   *
   * @param {string} message
   * Override exception message.
   * Use for UI
   */
  setMessage(message: string) {
    this.message = message;
    return this;
  }

  // private method
  _getLog() {
    const log = `
      EXCEPTION ${this.exception?.name}
      Time: ${new Date().toUTCString()}
      User message: ${this.message}
      Debug message: ${this.debugMessage}
      Error code: ${this.exception?.code}
      StackTrace: ${this.exception?.stackTrace}
      StackTraceCode: ${this.exception?.stackTraceCode}
      Stack: ${this.exception.stack}
    `;

    return log;
  }

  // private method
  _log2Console() {
    const log = this._getLog();
    log && console.debug(log);
  }

  /**
   * write log to memory or display on console.
   * Uses both memory & console as default.
   */
  writeLog({useDisk = false, useConsole = true} = {}) {
    if (useDisk) {
      // TODO write log to file, or memory?
    }

    if (!__DEV__ && useConsole) {
      // only use on production, we always log to console on dev already!
      this._log2Console();
    }

    return this;
  }

  /**
   * Show a toast to UI, use `message` as default.
   * If __DEV__ is true, `debugMessage` will be displayed too.
   */
  showErrorToast(showCode = false) {
    let msg = this.message;
    if (__DEV__) {
      msg = `${msg}\n****** DEBUG ******\n(${this.debugMessage})`;
    }

    if (showCode) {
      return Toast.showError(this.getMessage(msg));
    }

    msg && Toast.showError(msg);
    return this;
  }

  /**
   * Show a toast to UI, use `message` as default.
   * If __DEV__ is true, `debugMessage` will be displayed too.
   */
  showWarningToast() {
    let msg = this.message;
    if (__DEV__) {
      msg = `${msg}\n****** DEBUG ******\n(${this.debugMessage})`;
    }
    msg && Toast.showWarning(msg);
    return this;
  }

  getMessage(defaultMessage) {
    try {
      if (this.exception.stackTrace) {
        const stackCode = _.toString(this.exception.stackTraceCode) || '';
        if (
          stackCode.indexOf(CODES.REPLACEMENT) === 0 ||
          stackCode.indexOf(CODES.DOUBLE_SPEND) === 0 ||
          stackCode.includes(
            `${CODES.CAN_NOT_SEND_PTOKEN_TX}: ${CODES.OLD_REPLACEMENT}`,
          )
        ) {
          return `${MESSAGES.PENDING_TX} (${ERROR.PENDING_TX})`;
        }

        if (stackCode.indexOf(CODES.INVALID_FEE) === 0) {
          return `${MESSAGES.CAN_NOT_SEND_TX} (${ERROR.INVALID_FEE})`;
        }

        if (
          stackCode ===
            `${CODES.CAN_NOT_SEND_PTOKEN_TX}: ${CODES.INVALID_TX}` ||
          stackCode === `${CODES.CAN_NOT_SEND_TX}: ${CODES.INVALID_TX}`
        ) {
          return `${MESSAGES.CAN_NOT_SEND_TX} (${ERROR.INVALID_ACCOUNT})`;
        }

        if (stackCode.indexOf(CODES.INVALID_TIME) === 0) {
          return `${MESSAGES.CAN_NOT_SEND_TX} (${ERROR.INVALID_TIME})`;
        }

        return `${MESSAGES.CAN_NOT_SEND_TX} (${stackCode})`;
      }

      if (this.exception.code === CODES.NOT_ENOUGH_COIN) {
        return `${MESSAGES.PENDING_TX} (${ERROR.PENDING_TX}) (${CODES.NOT_ENOUGH_COIN})`;
      }

      if (this?.exception?.code?.toLowerCase().includes('api_error')) {
        return `${this.message} (${this.exception.code})`;
      }

      return `${defaultMessage || MESSAGES.GENERAL} (${this.exception.code})`;
    } catch (error) {
      return error.message;
    }

    // return `${this.exception.message} ${this.exception.stack}`;
  }

  /**
   * re-throw the exception, this must be end of chain.
   */
  throw() {
    throw this.exception;
  }

  getMessageError() {
    const exception = this.exception;
    if (isValidException(exception)) {
      const name = exception?.name || null;
      const code = exception?.code || null;
      const message = exception?.message || MESSAGES.GENERAL;
      if (name) {
        switch (name) {
        case CustomError.TYPES.WEB_JS_ERROR:
        case CustomError.TYPES.API_ERROR: {
          return Message[code] ? Message[code] : message;
        }
        case CustomError.TYPES.KNOWN_ERROR: {
          return message;
        }
        default:
          return message;
        }
      }
    }
    if (typeof exception === 'string') {
      return exception;
    }
    return MESSAGES.GENERAL;
  }

  toastMessageError() {
    return Toast.showError(this.getMessageError());
  }

  getCodeError(){
    const exception = this.exception;
    if (isValidException(exception)) {
      return exception?.code;
    }
    return null;
  }

}

export default Exception;
