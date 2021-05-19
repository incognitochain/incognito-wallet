import React, {useState} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { debounce, isEmpty } from 'lodash';
import accountService from '@services/wallet/accountService';
import { PRV_ID } from '@screens/Dex/constants';

export const AIR_DROP = 'air-drop';

const enhance = WrappedComp => props => {
  const { account, wallet, pTokens } = props;
  const [steps, setSteps] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(null);

  const sleep = () => (new Promise((resolve) => setTimeout(resolve, 4000)));

  const editStep = (key, isSuccess) => {
    setSteps(steps => {
      const stepIndex = steps.findIndex(step => step.key === key);
      steps[stepIndex] = {
        ...steps[stepIndex],
        success: isSuccess
      };
      return steps;
    });
  };

  const handleRequestAirdrop = async () => {
    setCurrentStep(AIR_DROP);
    await sleep();
    editStep(AIR_DROP, true);
  };

  const handleConvertPRV = async ({
    accountWallet,
    unspentCoins
  }) => {
    setCurrentStep(PRV_ID);
    const { errors } = await accountWallet.createAndSendConvertNativeToken(unspentCoins);
    editStep(PRV_ID, errors.length === 0);
  };

  const handleConvertPToken = async ({
    accountWallet,
    unspentCoins
  }) =>{
    let errorsList = [];
    for (const unspentCoin of unspentCoins) {
      try {
        const { tokenId: tokenID, balance } = unspentCoin;
        setCurrentStep(tokenID);
        await accountWallet.createAndSendConvertPToken({ tokenID, balance });
      } catch (errors) {
        errorsList = errorsList.concat(errors);
      }
      editStep(unspentCoin?.tokenId, true);
    }
  };

  const handleLoadUnspentCoins = async () => {
    const {
      unspentCoins,
      accountInstance: accountWallet
    } = await accountService.getUnspentCoinsV1(account, wallet, false);

    const prvUnspent = unspentCoins.find((coin) => coin.tokenId === PRV_ID);
    const pTokenUnspent = unspentCoins.filter((coin) => coin.tokenId !== PRV_ID && coin.balance > 0);
    return {
      accountWallet,
      prvUnspent,
      pTokenUnspent
    };
  };

  const getConvertSteps = (coins) => {
    const airdropStep = [{ name: 'Requesting airdrop', key: AIR_DROP }];
    const convertSteps = coins.reduce((prev, coin) => {
      let steps = prev;
      const { tokenId, balance } = coin;
      if (tokenId === PRV_ID && balance > 100) {
        steps.push({ name: 'Convert PRV', key: tokenId, tokenName: 'PRV' });
      }
      if (tokenId !== PRV_ID && balance > 0) {
        const token = pTokens.find(token => token.tokenId === tokenId);
        steps.push({ name: `Convert ${token?.name}`, key: tokenId, tokenName: token?.name });
      }
      return steps;
    }, []);

    return airdropStep.concat(convertSteps);
  };

  const handleConvert = debounce(async () => {
    setAppLoading(true);
    /** get unspent coins */
    let {
      accountWallet,
      prvUnspent,
      pTokenUnspent
    } = await handleLoadUnspentCoins();

    /** load unspent coins success */
    // pTokenUnspent = [
    //   {
    //     tokenId: '4584d5e9b2fc0337dfb17f4b5bb025e5b82c38cfa4f54e8a3d4fcdd03954ff82',
    //     balance: 1000
    //   }, {
    //     tokenId: 'b20810f4d2a1dde8046028819d9fa12549e04ce14fb299594da8cfca9be5d856',
    //     balance: 1000
    //   }, {
    //     tokenId: 'b6a00a514e9b0cdedcacf045b06ca873a447d56d0ca22c083e03aa78f1f027ea',
    //     balance: 1000
    //   }, {
    //     tokenId: 'f99fcaa35f9d1bb80b6d6533b8393003b1e6ff384fb572768341b0cb7310ca89',
    //     balance: 1000
    //   }, {
    //     tokenId: '5f138f1ff6df1aac25a1cb1ab000a6dc9a58e3fe0c453aea54bb3f7af3ba3d34',
    //     balance: 1000
    //   }, {
    //     tokenId: 'f3c421e4d7520936f3916a878ab361ef3fd6a831e81063ca3e7b80ab4d15a84e',
    //     balance: 1000
    //   }
    // ];

    setSteps(getConvertSteps([prvUnspent].concat(pTokenUnspent)));

    setAppLoading(false);

    /** request airdrop */
    await handleRequestAirdrop();

    if (!isEmpty(prvUnspent) && prvUnspent.balance > 100) {
      await handleConvertPRV({
        accountWallet,
        unspentCoins: prvUnspent
      });
    }

    await handleConvertPToken({
      accountWallet,
      unspentCoins: pTokenUnspent
    });

    setCurrentStep(null);
  }, 500);

  React.useEffect(() => {
    handleConvert();
  }, []);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          steps,
          appLoading,
          currentStep
        }}
      />
    </ErrorBoundary>
  );
};

export default enhance;
