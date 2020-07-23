import { CONSTANT_COMMONS } from '@src/constants';
import { ellipsisTail } from '@src/utils/ellipsis';
import { v4 } from 'uuid';

export const normalizedData = (item) => {
  return {
    id: item?.ID ? item?.ID : v4(),
    title: item?.Title ? ellipsisTail({ str: item?.Title, limit: 70 }) : '',
    desc: item?.Content ? item?.Content : '',
    time: item?.CreatedAt ? item?.CreatedAt : new Date().getTime() / 1000,
    type: item?.TypeNotification ? item?.TypeNotification : '',
    read: item?.IsRead === 'true' || item?.IsRead === true,
    tokenId: item?.TokenID ? item?.TokenID : CONSTANT_COMMONS.PRV_TOKEN_ID,
    publicKey: item?.PublicKey ? item?.PublicKey : '',
    screen: item?.Screen || '',
    screenParams: item?.ScreenParams || item?.screenParams || '',
  };
};

export const updateReadAll = (list = []) =>
  [...list].every((item) => item.read === true);

export const mappingData = (list) => list.map((item) => normalizedData(item));

export const delay = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
