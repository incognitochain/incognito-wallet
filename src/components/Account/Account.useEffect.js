import lowerCase from 'lodash/lowerCase';
import { useSelector } from 'react-redux';
import { accountSeleclor } from '@src/redux/selectors';
import { validator } from '@src/components/core/reduxForm';
import { formValueSelector, isValid } from 'redux-form';
import trim from 'lodash/trim';
import PropTypes from 'prop-types';

const validateAccountExist = () => 'Keychain name is exist!';

const validatePrivateKeyExist = () => 'Keychain key is exist!';

const isRequired = validator.required();

const useAccount = (props) => {
  const { form } = props;
  const accountList = useSelector(accountSeleclor.listAccountSelector);
  const isFormValid = useSelector((state) => isValid(form?.formName)(state));
  const selector = formValueSelector(form?.formName);
  const accountNameToLowercase = lowerCase(
    trim(useSelector((state) => selector(state, form?.accountName)) || ''),
  );
  const privateKey = trim(
    useSelector((state) => selector(state, form?.privateKey)) || '',
  );
  const isPrivateKeyExist = accountList.find(
    (account) => account?.privateKey === privateKey,
  );
  const isAccountExist = accountList.find(
    (account) => lowerCase(account?.accountName) === accountNameToLowercase,
  );
  const getAccountValidator = () => {
    const validate = [...validator.combinedAccountName];
    // if (isAccountExist) {
    //   validate.push(validateAccountExist);
    // }
    return validate;
  };
  const getPrivateKeyValidator = () => {
    const validate = [isRequired];
    // if (!!privateKey && isPrivateKeyExist) {
    //   validate.push(validatePrivateKeyExist);
    // }
    return validate;
  };
  return {
    isFormValid,
    getAccountValidator,
    getPrivateKeyValidator,
    isAccountExist,
    isPrivateKeyExist,
  };
};

useAccount.propTypes = {
  form: PropTypes.shape({
    accountName: PropTypes.string.isRequired,
    privateKey: PropTypes.string,
    formName: PropTypes.string.isRequired,
  }).isRequired,
};

export default useAccount;
