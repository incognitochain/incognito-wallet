import http from '@src/services/http';
import axios from 'axios';

const CancelToken = axios.CancelToken;
let cancel;

export const checkBandWidth = (imageURIParam) => {
  const downloadSizeInBits = 12000000;
  const metric = 'MBps';

  const imageURI = imageURIParam ? imageURIParam : 'https://i.pinimg.com/originals/c8/a4/9c/c8a49c6babe79c2efd4a6963c931df3e.jpg';

  return new Promise((resolve, reject) => {
    const startTime = (new Date()).getTime();

    http.get(imageURI, {
      fileCache: false, 
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel = c;
      })}).then((res) => {
      const endTime = (new Date()).getTime();
      const duration = (endTime - startTime) / 1000;
      const speed = (downloadSizeInBits / (1024 * 1024 * duration));

      resolve({ metric, speed, duration });
    })
      .catch(reject);
  });
};

export const cancelCheckBandWidth = () => {
  cancel && cancel?.();
  console.log('Cancelled');
};