import http from '@src/services/http';
import PToken from '@models/pToken';
import moment from 'moment';

const url = 'pool/request-unstake';

export const unstakePNode = ({ productId, qrCode, paymentAddress }) => {
  return http.post(url, {
    ProductID: productId,
    QRCode: qrCode,
    PaymentAddress: paymentAddress,
  });
};

export const getUnstakePNodeStatus = async ({ paymentAddress }) => {
  try {
    const data = await http.get(url, {
      params: {
        PaymentAddress: paymentAddress,
      }
    });

    return data.Status;
  } catch {
    return 0;
  }
};

export const getPTokenSupportForBuyingDevice = () => {
  return http.get('order/tokens-support')
    .then(res => res.map(token => new PToken(token)));
};

export const getNodePrice = () => {
  return http.get('order/price');
};

/**
 * Get last update firmware time
 * @param {string} qrCode
 * @param {string} version
 * @returns {Promise<moment>}
 */
export const getLastUpdateFirmwareTime = async (qrCode, version) => {
  const url = `system/last-update-firmware?DeviceID=${qrCode}&Version=${version}`;
  const data = await http.get(url);
  return moment(data.CreatedAt);
};

/**
 * Set last update firmware time
 * @param {string} qrCode
 * @param {string} version
 * @returns {Promise<void>}
 */
export const setLastUpdatefirmwareTime = async (qrCode, version) => {
  const url = `system/last-update-firmware?DeviceID=${qrCode}&Version=${version}`;
  return http.post(url, {
    Version: version,
    DeviceID: qrCode,
  });
};
