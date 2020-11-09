import TYPES from '../types';
import { codeCreator } from '../utils';

const knownError = codeCreator(TYPES.KNOWN_ERROR);

/**
 * ONLY FOR KNOWN ERRORS (Errors are thrown in the app)
 */


// place error codes here
// should seperate codes by component
// format: component_code_id

const app = {
  timeout_promise: knownError(-2),
  firebase_init_failed: knownError(-8),
  network_make_request_failed: knownError(-9),
  wallet_can_not_create_new_wallet: knownError(-14),
  wallet_can_not_load_existed_wallet: knownError(-15),
  user_login_failed: knownError(-27),
  master_key_name_existed: knownError(-100),
};

const document_picker = {
  document_picker_oversize: knownError(-43),
  document_picker_must_be_png: knownError(-44)
};

const estimateFee = {
  estimate_fee_with_zero_balance: knownError(-1),
  estimate_fee_does_not_support_type_of_fee: knownError(-29)
};

const getStarted = {
  getStarted_can_not_create_wallet_on_existed: knownError(-10),
  getStarted_load_token_failed: knownError(-24),
};

const withdraw = {
  withdraw_balance_must_not_be_zero: knownError(-12),
  withdraw_gen_withdraw_address_failed: knownError(-13)
};

const createAccount = {
  createAccount_failed: knownError(-16),
  createAccount_existed_name: knownError(-17)
};
const home = {
  home_load_following_token_failed: knownError(-18),
  home_load_balance_failed: knownError(-19)
};

const importAccount = {
  importAccount_failed: knownError(-20),
  importAccount_existed: knownError(-21),
};

const node = {
  node_duplicate: knownError(-22),
  node_invalid_host: knownError(-23),
  node_auth_firebase_fail:knownError(-32),
  node_verify_code_fail:knownError(-33),
  node_create_account_fail: knownError(-34),
  node_can_not_connect_hotspot: knownError(-35),
  node_pending_withdrawal: knownError(-36),
  node_can_not_get_wifi_name: knownError(-37),
};

const validator = {
  payment_address_empty: knownError(-25),
};

const staking = {
  click_stake: knownError(-26),
};

const papps = {
  paaps_invalid_daap_url: knownError(-28),
  papp_can_not_opened: knownError(-41),
  papp_the_token_is_not_supported: knownError(-42)
};

const addBep2Token = {
  addBep2Token_not_found: knownError(-30)
};

const addErc20Token = {
  addErc20Token_not_found: knownError(-31)
};

const dex = {
  WITHDRAW_FAIL: knownError(-40),
  NOT_ENOUGH_NETWORK_FEE_ADD: knownError(-61),
};

const chain = {
  INVALID_ACCOUNT: knownError(-1001),

  INVALID_TIME: knownError(-1002),

  INVALID_FEE: knownError(-1016),

  PENDING_TX: knownError(-6005),

  FULLNODE_DOWN: knownError(-9999),
};

const masterKey = {
  invalid_master_key_name: knownError(-101),
  invalid_mnemonic: knownError(-102),
  duplicate_mnemonic: knownError(-103),
};


export default {
  ...app,
  ...estimateFee,
  ...getStarted,
  ...withdraw,
  ...createAccount,
  ...importAccount,
  ...home,
  ...node,
  ...validator,
  ...staking,
  ...papps,
  ...addBep2Token,
  ...addErc20Token,
  ...dex,
  ...document_picker,
  ...chain,
  ...masterKey,
};
