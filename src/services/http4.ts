import axios from 'axios';
import { CONSTANT_CONFIGS } from '@src/constants';
import { camelCaseKeys } from '@src/utils';
import createLogger from '@utils/logger';
import { DEBUG } from '@src/utils/logger';
import { CustomError, ErrorCode, ExHandler } from './exception';

const HEADERS = { 'Content-Type': 'application/json' };
const TIMEOUT = 20000;

const logger = createLogger('API');

const instance = axios.create({
  baseURL: CONSTANT_CONFIGS.API_BASE_URL4,
  timeout: TIMEOUT,
  headers: {
    ...HEADERS,
    Authorization: '',
  },
});

instance.interceptors.request.use(
  (config) => {
    /** In dev, intercepts request and logs it into console for dev */
    if (DEBUG) {
      logger('URL ', config.baseURL + config.url);
      logger('INFO HTTP: ', config);
    }
    return config;
  },
  (error) => {
    if (DEBUG) logger(error);
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (res) => {
    const result = res?.data?.Result;
    const error = res?.data?.Error;
    if (error) {
      return Promise.reject(camelCaseKeys(error));
    }
    logger('RESPONSE: ', result);
    return Promise.resolve(result);
  },
  (errorData) => {
    logger('ERROR RESPONSE: ', {
      errorData,
    });
    const errResponse = errorData?.response;

    // can not get response, alert to user
    if (errorData?.isAxiosError && !errResponse) {
      return new ExHandler(
        new CustomError(ErrorCode.network_make_request_failed),
      ).throw();
    }

    // get response of error
    // wrap the error with CustomError to custom error message, or logging
    const data = errResponse?.data;
    const message = data.Error;

    if (data && message) {
      if (typeof message === 'string') {
        throw new Error(message);
      } else {
        throw new CustomError(data.Error?.Code, {
          name: CustomError.TYPES.API_ERROR,
          message: data.Error?.Message,
        });
      }
    }

    return Promise.reject(errorData);
  },
);

export default instance;
/**
 * Document: https://github.com/axios/axios#instance-methodsaxios#request(config)
    axios#get(url[, config])
    axios#delete(url[, config])
    axios#head(url[, config])
    axios#options(url[, config])
    axios#post(url[, data[, config]])
    axios#put(url[, data[, config]])
    axios#patch(url[, data[, config]])
    axios#getUri([config])
 */
