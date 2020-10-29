import http from '@services/http';
import { formatBodyGetNodesInfo } from '@screens/Node/Node.builder';

export const apiGetNodesInfo = async () => {
  return new Promise(async (resolve, reject) => {
    const body = await formatBodyGetNodesInfo();
    return http
      .post('pnode/get-node-info', body)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};