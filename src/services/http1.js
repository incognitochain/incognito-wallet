import axios from 'axios';
import { CustomError, ErrorCode, ExHandler } from './exception';

const HEADERS = {'Content-Type': 'application/json'};
const TIMEOUT = 20000;

const instance = axios.create({
  baseURL: 'http://51.79.76.38:8096',
  timeout: TIMEOUT,
  headers: {
    ...HEADERS,
    Authorization: '',
  },
});

instance.interceptors.response.use(
  res => {
    const result = res?.data?.Result;
    return Promise.resolve(result);
  },
  errorData => {
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
    if (data && data.Error) {
      throw new CustomError(data.Error?.Code, {
        name: CustomError.TYPES.API_ERROR,
        message: data.Error?.Message,
      });
    }

    return Promise.reject(errorData);
  },
);

export default instance;
