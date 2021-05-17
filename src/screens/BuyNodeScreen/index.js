import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { RefreshControl } from 'react-native';
import {
  ActivityIndicator,
  FlexView,
  LoadingContainer,
  RoundCornerButton,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from '@components/core';
import theme from '@src/styles/theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import APIService from '@src/services/api/miner/APIService';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import Header from '@src/components/Header';
import { withLayout_2 } from '@components/Layout';
import { Row } from '@src/components';
import {
  getNodePrice,
  getPTokenSupportForBuyingDevice,
} from '@services/api/node';
import { ExHandler } from '@services/exception';
import BasicInfo from '@screens/BuyNodeScreen/BasicInfo';
import Quantity from '@screens/BuyNodeScreen/Quantity';
import Currency from '@screens/BuyNodeScreen/Currency';
import Address from '@screens/BuyNodeScreen/Address';
import LocalDatabase from '@utils/LocalDatabase';
import formatUtil from '@utils/format';
import accountService from '@services/wallet/accountService';
import { COINS } from '@src/constants';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import { compose } from 'recompose';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MainItem from '@screens/BuyNodeScreen/MainItem';
import SubItem from '@screens/BuyNodeScreen/SubItem';
import { COLORS } from '@src/styles';
import convertUtil from '@utils/convert';
import { useFocusEffect } from 'react-navigation-hooks';

const BuyNodeScreen = (props) => {
  const [loadingData, setLoadingData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supportToken, setSupportToken] = useState({});
  const [shippingHour, setShippingHour] = useState('');
  const [currentTokenId, setCurrentTokenId] = useState(COINS.PRV_ID);
  const [pTokenSupport, setPTokenSupport] = useState([]);
  const [pTokenSupportsPartner, setPTokenSupportsPartner] = useState([]);
  const [prvBalance, setPrvBalance] = useState(0);
  const [coinBalance, setCoinBalance] = useState(0);
  const [fee, setFee] = useState({});

  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [contactData, setContactData] = useState({});
  const [usdPrice, setUSDPrice] = useState(0);
  const [baseUSDPrice, setBaseUSDPrice] = useState(0);

  const { account, wallet } = props;

  let { shippingFee } = contactData;

  if (!shippingFee || !_.isNumber(shippingFee)) {
    shippingFee = 0;
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentTokenId]),
  );

  useEffect(() => {
    if (account && supportToken) {
      getBalance();
    }
  }, [account, supportToken]);

  useEffect(() => {
    const supportToken = pTokenSupport?.find(
      (item) => item.tokenId === currentTokenId,
    );
    if (pTokenSupport.length > 0 && supportToken) {
      setSupportToken(supportToken);
    }
  }, [pTokenSupport, currentTokenId, pTokenSupportsPartner]);

  useEffect(() => {
    const coinPartner = pTokenSupportsPartner.find(
      (item) => item.ID === supportToken.id,
    );
    if (coinPartner) {
      const newUsdPrice = coinPartner.Price;

      if (newUsdPrice !== usdPrice) {
        setUSDPrice(newUsdPrice);
      }
    } else if (usdPrice !== baseUSDPrice) {
      setUSDPrice(baseUSDPrice);
    }
  }, [usdPrice, pTokenSupportsPartner, supportToken]);

  useEffect(() => {
    getNetworkFee();
  }, [supportToken]);

  const getBalance = async () => {
    setPrvBalance(null);
    setCoinBalance(null);

    const prvBalance = await accountService.getBalance(
      account,
      wallet,
      COINS.PRV_ID,
    );
    let coinBalance = prvBalance;

    if (supportToken?.tokenId !== COINS.PRV_ID) {
      coinBalance = await accountService.getBalance(
        account,
        wallet,
        currentTokenId,
      );
      console.debug(
        'GET BALANCE',
        coinBalance,
        currentTokenId,
        account.PaymentAddress,
      );
    }

    setPrvBalance(prvBalance);
    setCoinBalance(coinBalance);
  };

  const loadData = async () => {
    try {
      setLoadingData(true);
      await getSystemConfig();
      await getDevicePrice();
      await getPTokenList();
      await getNetworkFee();

      const contactData = await LocalDatabase.getShipAddress();
      if (contactData && !_.isEmpty(contactData)) {
        updateAddress(contactData);
      }
    } catch (e) {
      new ExHandler(e, 'Could not get data').showErrorToast(true);
    } finally {
      setLoadingData(false);
    }
  };

  const getNetworkFee = async () => {
    let fee = {
      id: COINS.PRV_ID,
      value: MAX_FEE_PER_TX,
      coin: COINS.PRV,
    };

    if (
      supportToken &&
      supportToken.tokenId !== COINS.PRV_ID &&
      currentTokenId !== COINS.PRV_ID
    ) {
      try {
        fee = {
          id: currentTokenId,
          value: null,
          coin: supportToken,
        };
      } catch {
        //
      }
    }
    setFee(fee);
  };

  // Get token system config
  const getSystemConfig = async () => {
    APIService.getSystemConfig()
      .then((data) => {
        if (data?.BuyNodePTokensPartner) {
          let resPTokenSupportsPartner = JSON.parse(
            data?.BuyNodePTokensPartner,
          );
          setPTokenSupportsPartner(resPTokenSupportsPartner);
          getPTokenList(resPTokenSupportsPartner);
        }
        if (data?.MinerShipInfo) {
          let minerShipInfo = data?.MinerShipInfo;
          setShippingHour(minerShipInfo);
        }
      })
      .catch((err) => {
        console.log(
          'Could not get system config for buying device' + err.message,
        );
      });
  };

  const getDevicePrice = async () => {
    try {
      const price = await getNodePrice();
      setUSDPrice(price);
      setBaseUSDPrice(price);
    } catch (e) {
      new ExHandler(e, 'Could not get device\'s price').showErrorToast(true);
    }
  };

  // Get all pToken for internal app, only accept with these coins
  const getPTokenList = async () => {
    return getPTokenSupportForBuyingDevice()
      .then((data) => setPTokenSupport(data))
      .catch(() => {
        console.log('Could not get support token for buying device');
      });
  };

  const getShippingFee = async (data) => {
    console.debug('SHIP', currentTokenId);

    await APIService.getShippingFee(
      data.countryCode || '',
      data.countryCode || '',
      data.countryCode || '',
      data.region || '',
      data.address || '',
      currentTokenId,
    ).then((result) => {
      if (result) {
        data.shippingFee = result.ShippingFee || 0;
        setContactData(data);

        LocalDatabase.setShipAddress(data);
      }
    });
  };

  const updateAddress = async (data) => {
    await setContactData({
      ...contactData,
      email: data?.email,
      phone: data?.phone,
      postalCode: data?.postalCode,
      lastName: data?.lastName,
      firstName: data?.firstName,
      country: data?.country,
      countryCode: data?.countryCode,
      city: data?.city,
      address: data?.address,
      region: data?.region,
    });
    await getShippingFee(data);
  };

  const renderTotal = () => {
    const data = getTotal();
    return (
      <View>
        <MainItem
          title="Shipping"
          value={shippingFee === 0 ? 'FREE' : `$${shippingFee}`}
        />
        <SubItem description={`Ships ${shippingHour}`} />
        {shippingFee > 0 && (
          <SubItem
            marginTop={15}
            description="Duties or taxes may be payable depending on your locality."
          />
        )}

        <MainItem title="Total" value={`$${data?.totalUSD}`} />

        <MainItem
          title={`Pay with ${supportToken.symbol}`}
          value={`${data?.totalCoin} ${supportToken.symbol}`}
        />

        <Text
          style={[
            theme.text.regularSizeMediumFontGrey,
            { alignSelf: 'flex-end', marginTop: 15 },
          ]}
        >
          {`1 ${supportToken.symbol} = $${formatUtil.amountFull(
            _.floor(supportToken.priceUsd, supportToken.pDecimals),
            0,
          )}`}
        </Text>
      </View>
    );
  };

  const handleSelectToken = (token) => {
    setCurrentTokenId(token.tokenId);
  };

  // Process payment flow
  const onPaymentProcess = async () => {
    console.debug('PAYMENT', currentTokenId);
    setLoading(true);
    APIService.checkOutOrder(
      contactData.email,
      contactData.countryCode,
      contactData.address,
      contactData.city,
      contactData.region,
      contactData.postalCode,
      contactData.phoneNumber,
      currentTokenId,
      Number(currentQuantity),
      contactData.firstName,
      contactData.lastName,
    )
      .then((data) => {
        const usdPrice = data.TotalPrice * currentQuantity;
        const displayAmount = data.TotalAmount;
        const originalAmount = convertUtil.toOriginalAmount(
          displayAmount,
          supportToken.pDecimals,
        );
        const exchangeRate = formatUtil.amountFull(
          _.floor(usdPrice / displayAmount, 9),
          0,
        );
        setLoading(false);
        NavigationService.navigate(routeNames.PaymentBuyNodeScreen, {
          paymentAddress: data?.Address,
          amount: originalAmount,
          coin: supportToken,
          orderId: data?.OrderID,
          prvBalance: prvBalance,
          coinBalance: coinBalance,
          exchangeRate,
          fee: fee,
        });
      })
      .catch((error) => {
        setLoading(false);
        throw new Error('Can not checkout your order ' + error.message);
      });
  };

  // Disable button process for better behavior
  const shouldDisableButtonProcess = () => {
    return (
      !contactData.email ||
      !contactData.firstName ||
      !contactData.lastName ||
      !contactData.address ||
      !contactData.country ||
      !contactData.postalCode
    );
  };

  const renderButtonProcess = () => {
    return (
      <RoundCornerButton
        title="Confirm purchase"
        onPress={async () => {
          // Payment for device
          onPaymentProcess();
        }}
        style={[theme.BUTTON.NODE_BUTTON, { marginBottom: 20, marginTop: 30 }]}
        disabled={shouldDisableButtonProcess()}
      />
    );
  };

  const getTotal = () => {
    let totalUSD = (usdPrice + shippingFee) * currentQuantity;
    let totalCoin =
      totalUSD / _.floor(supportToken.priceUsd, supportToken.pDecimals);

    let totalCoinBalance = _.ceil(totalCoin, supportToken.pDecimals);
    totalCoin = formatUtil.amountFull(totalCoinBalance, 0);
    totalUSD = formatUtil.amountFull(totalUSD, 0);

    totalCoinBalance = convertUtil.toOriginalAmount(
      totalCoinBalance,
      supportToken.pDecimals,
    );

    return {
      totalUSD,
      totalCoin,
      totalCoinBalance,
    };
  };

  if (loadingData) {
    return <LoadingContainer />;
  }

  return (
    <FlexView>
      <Header title="Get Node" accountSelectable />
      <ScrollView
        refreshControl={(
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              getSystemConfig();
              getDevicePrice();
            }}
          />
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        paddingBottom
      >
        <KeyboardAwareScrollView
          style={{ backgroundColor: 'white' }}
          showsVerticalScrollIndicator={false}
          enableOnAndroid
        >
          <BasicInfo usdPrice={usdPrice} contactData={contactData} />
          <Quantity
            onChangeQuantity={setCurrentQuantity}
            quantity={currentQuantity}
          />
          <Currency
            coinSymbol={supportToken.symbol}
            coins={pTokenSupport}
            onSelectCoin={handleSelectToken}
          />
          <Address onUpdateAddress={updateAddress} contactData={contactData} />
          {contactData?.email && (
            <>
              {renderTotal()}
              {renderButtonProcess()}
              {loading && (
                <ActivityIndicator style={theme.FLEX.absoluteIndicator} />
              )}
            </>
          )}
          <TouchableOpacity
            onPress={() =>
              NavigationService.navigate(routeNames.NodeReturnPolicy)
            }
          >
            <Row spaceBetween center style={{ marginTop: 30 }}>
              <Text style={theme.text.greyTextBoldMediumSize}>
                Returns & warranty policy
              </Text>
              <AntDesign name="right" size={18} color={COLORS.newGrey} />
            </Row>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </ScrollView>
    </FlexView>
  );
};

BuyNodeScreen.propTypes = {
  account: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
};

export default compose(
  withLayout_2,
  withDefaultAccount,
)(BuyNodeScreen);
