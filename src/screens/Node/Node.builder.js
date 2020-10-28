import LocalDatabase from '@utils/LocalDatabase';

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