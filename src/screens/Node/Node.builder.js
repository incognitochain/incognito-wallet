import LocalDatabase from '@utils/LocalDatabase';
import Device from '@models/device';

export const formatNodeAccount = async (data) => {
  if (data) {
    const { email,
      fullname,
      id,
      token,
      phone,
      user_hash,
      gender,
      credit,
      last_update_task,
      created_at,
      country,
      birth,
      city,
      code,
      refresh_token
    } = data;
    const user = {
      email: email,
      fullname: fullname,
      id: id,
      token: token,
      refresh_token: refresh_token,
      user_hash: user_hash,
      last_update_task: last_update_task,
      birth: birth,
      city: city,
      code: code,
      country: country,
      created_at: created_at,
      credit: credit,
      gender: gender,
      phone: phone
    };
    await LocalDatabase.saveUserInfo(JSON.stringify(user));
  }
  /* Because sign_up mean didnt add NODE */
  return [];
};

export const formatBodyGetNodesInfo = async () => {
  let devices = (await LocalDatabase.getListDevices()) || [];
  return devices.map(item => {
    const nodeDevice  = Device.getInstance(item);
    const { IsPNode, QRCode, PublicKey, PublicKeyMining : BLS } = nodeDevice;
    return IsPNode ? { QRCode } : { PublicKey, BLS };
  });
};

export const formatNodesInfoFromApi = (listNodes) => {
  return (listNodes || []).map(node => ({
    qrCode:                   node?.QRCode,
    publicKey:                node?.PublicKey,
    bls:                      node?.BLS,
    isInAutoStaking:          node?.IsInAutoStaking,
    isInCommittee:            node?.IsInCommittee,
    isAutoStake:              node?.IsAutoStake,
    pendingWithdrawal:        node?.PendingWithdrawal,
    pendingUnstake:           node?.PendingUnstake,
    isUnstaked:               node?.IsUnstaked,
    isStaked:                 node?.IsStaked,
    lastestFirmwareVersion:   node?.LastestFirmwareVersion,
    rewards:                  (node?.Rewards || []).map((reward) => ({
      tokenID: reward?.TokenID,
      decimals: reward?.Decimals,
      Symbol: reward?.Symbol,
      amount: reward?.Amount
    }))
  }));
};