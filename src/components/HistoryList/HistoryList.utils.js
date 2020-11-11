import {
  ConfirmedTx,
  FailedTx,
  SuccessTx,
} from '@src/services/wallet/WalletService';
import { CONSTANT_COMMONS } from '@src/constants';
import { COLORS } from '@src/styles';

const getStatusDataShield = (history) => {
  const { statusCode, statusMessage } = history;
  let statusColor;
  const {
    STATUS_CODE_SHIELD_CENTRALIZED,
    STATUS_CODE_SHIELD_DECENTRALIZED,
  } = CONSTANT_COMMONS.HISTORY;
  if (history?.isDecentralized) {
    if (STATUS_CODE_SHIELD_DECENTRALIZED.COMPLETE === statusCode) {
      statusColor = COLORS.green;
    } else {
      statusColor = COLORS.colorGreyBold;
    }
  } else {
    if (STATUS_CODE_SHIELD_CENTRALIZED.COMPLETE.includes(statusCode)) {
      statusColor = COLORS.green;
    } else {
      statusColor = COLORS.colorGreyBold;
    }
  }
  return { statusColor, statusMessage };
};

const getStatusDataUnShield = (history) => {
  const { statusCode, statusMessage } = history;
  const {
    STATUS_CODE_UNSHIELD_CENTRALIZED,
    STATUS_CODE_UNSHIELD_DECENTRALIZED,
  } = CONSTANT_COMMONS.HISTORY;
  let statusColor;
  if (history?.isDecentralized) {
    if (STATUS_CODE_UNSHIELD_DECENTRALIZED.COMPLETE === statusCode) {
      statusColor = COLORS.green;
    } else {
      statusColor = COLORS.colorGreyBold;
    }
  } else {
    if (STATUS_CODE_UNSHIELD_CENTRALIZED.COMPLETE === statusCode) {
      statusColor = COLORS.green;
    } else {
      statusColor = COLORS.colorGreyBold;
    }
  }
  return { statusColor, statusMessage };
};

export const getStatusData = (history) => {
  const { status } = history;
  if (history?.isShieldTx) {
    const statusData = getStatusDataShield(history);
    return statusData;
  }
  if (history?.isUnshieldTx) {
    const statusData = getStatusDataUnShield(history);
    return statusData;
  }
  let statusMessage;
  let statusColor;
  switch (status) {
  case CONSTANT_COMMONS.HISTORY.STATUS_TEXT.PENDING:
  case SuccessTx:
    statusMessage = 'Pending';
    break;
  case CONSTANT_COMMONS.HISTORY.STATUS_TEXT.SUCCESS:
  case ConfirmedTx:
    statusMessage = 'Complete';
    statusColor = COLORS.green;
    break;
  case CONSTANT_COMMONS.HISTORY.STATUS_TEXT.FAILED:
  case FailedTx:
    statusMessage = 'Failed';
    break;
  case CONSTANT_COMMONS.HISTORY.STATUS_TEXT.EXPIRED:
    statusMessage = 'Expired';
    break;
  default:
    statusMessage = '';
    statusColor = COLORS.colorGreyBold;
  }
  return {
    statusMessage,
    statusColor,
  };
};

export const getTypeData = (type, history, paymentAddress) => {
  let typeText;
  switch (type) {
  case CONSTANT_COMMONS.HISTORY.TYPE.UNSHIELD:
    typeText = 'Unshield';
    break;
  case CONSTANT_COMMONS.HISTORY.TYPE.SHIELD:
    typeText = history?.depositAddress ? 'Shield' : 'Receive';
    break;
  case CONSTANT_COMMONS.HISTORY.TYPE.SEND: {
    const isUTXO =
        history?.memo === 'Defragment' && history?.toAddress === paymentAddress;
    typeText = isUTXO
      ? 'Consolidation'
      : CONSTANT_COMMONS.HISTORY.META_DATA_TYPE[(history?.metaDataType)] ||
          'Send';
    if (typeText === CONSTANT_COMMONS.HISTORY.META_DATA_TYPE[90]) {
      typeText = 'Send';
    }
    break;
  }
  case CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE:
    typeText = history?.typeText || 'Receive';
    break;
  }
  return {
    typeText,
  };
};
