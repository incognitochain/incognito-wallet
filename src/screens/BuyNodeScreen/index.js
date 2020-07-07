import React, { useRef, useState, useEffect } from 'react';
import { Animated, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Button, View, Image, ScrollView, ActivityIndicator } from '@components/core';
import nodeImg from '@src/assets/images/node/buy_node_s.png';
import { selectedPrivacySeleclor, accountSeleclor } from '@src/redux/selectors';
import theme from '@src/styles/theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import linkingService from '@services/linking';
import { TextField } from 'react-native-material-textfield';
import CurrentBalance from '@components/CurrentBalance';
import { connect, useSelector, useDispatch } from 'react-redux';
import { LineView } from '@src/components/Line';
import { COLORS, FONT } from '@src/styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LogManager from '@src/services/LogManager';
import { Icon } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown';
import { checkEmailValid, checkFieldEmpty } from '@src/utils/validator';
import APIService from '@src/services/api/miner/APIService';
import TokenCustomSelect from '@src/components/TokenSelect/TokenCustomSelect';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import { actionToggleModal } from '@src/components/Modal';
import AccountModal from '@src/components/Modal/AccountModal/modal.account';
import { CONSTANT_CONFIGS } from '@src/constants';
import { ScreenWidth } from '@src/utils/devices';
import Header from '@src/components/Header';
import { BtnInfo, ButtonBasic } from '@src/components/Button';
import BtnInformation from '@src/components/Button/BtnInformation';
import BtnMoreInfo from '@src/components/Button/BtnMoreInfo';
import { ArrowRightGreyIcon } from '@src/components/Icons';
import styles from './style';
import { BtnSelectAccount } from '../SelectAccount';


const dataCountry = require('../../assets/rawdata/country.json');

const TOP_MOTTO_HEADER = 'A beautiful plug and play device that protects the world from surveillance. Power privacy for people. Earn crypto.';
const MOTTO_HEADER = 'As a Node owner, you:';
const MOTTO =
  `•  Protect people from the dangers of surveillance.
•  Give everyone a way to use crypto privately.
•  Own a share of the Incognito network.
•  Earn block rewards in PRV, and transaction fees in BTC, ETH, and more.`;

const BuyNodeScreen = () => {
  let scrollViewRef = useRef();

  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [price, setPrice] = useState(0);
  const [priceDefault, setPriceDefault] = useState(0);
  const [shippingHour, setShippingHour] = useState('');
  const [currentTokenId, setCurrentTokenId] = useState('0000000000000000000000000000000000000000000000000000000000000004');
  const [pTokenSupport, setPTokenSupport] = useState([]);
  const [pTokenSupportsPartner, setPTokenSupportsPartner] = useState([]);

  const [showContactForShipping, setShowContactForShipping] = useState(false);

  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentAccount, setCurrentAccount] = useState(useSelector(accountSeleclor.defaultAccount));
  const [contactData, setContactData] = useState({});
  const [scrollY] = useState(new Animated.Value(0));

  const [yTotal, setYTotal] = useState(0);
  const [, setYContact] = useState(0);


  const dispatch = useDispatch();
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);

  const { symbol, tokenId } = selectedPrivacy;
  const account = useSelector(accountSeleclor.defaultAccount);
  const selectedPrivacyWithAccountChange = useSelector(selectedPrivacySeleclor.getPrivacyDataBaseOnAccount)(currentAccount);
  // const wallet = useSelector(wallet);

  useEffect(() => {
    setDataDefault();
    setDefaultTokenId();
    getSystemConfig();
    getSystemPrice();
  }, []);

  const setDataDefault = () => {
    // Default US
    setContactData({ ...contactData, country: dataCountry[0]?.value, code: dataCountry[0].countryShortCode });
    setRegions(dataCountry[0]?.regions);
  };

  const setDefaultTokenId = async () => {
    dispatch(setSelectedPrivacy(currentTokenId));
  };

  // Get token system config
  const getSystemConfig = async () => {
    APIService.getSystemConfig()
      .then(data => {
        if (data?.BuyNodePTokensPartner) {
          let resPTokenSupportsPartner = JSON.parse(data?.BuyNodePTokensPartner);
          setPTokenSupportsPartner(resPTokenSupportsPartner);
          getPTokenList(resPTokenSupportsPartner);
          getSystemPrice();
        }
        if (data?.MinerShipInfo) {
          let minerShipInfo = data?.MinerShipInfo;
          setShippingHour(minerShipInfo);
        }
      })
      .catch((err) => {
        console.log('Could not get system config for buying device' + err.message);
      });
  };
  // Get token system config
  const getSystemPrice = async () => {
    APIService.getSystemPrice()
      .then(data => {
        if (data && typeof data === 'number') {
          setPriceDefault(data || 0);
          setPrice(data || 0);
        }
      })
      .catch((err) => {
        console.log('Could not get system config for buying device' + err.message);
      });
  };

  // Get all pToken for internal app, only accept with these coins
  const getPTokenList = async (resPTokenSupportsPartner = []) => {
    APIService.getPTokenSupportForBuyingDevice()
      .then(data => {
        let res = data;
        setPTokenSupport(res);
        // Check current tokenId
        checkSelectedTokenIdAndUpdateDynamicPrice(res, resPTokenSupportsPartner, tokenId);
      })
      .catch(() => {
        console.log('Could not get support token for buying device');
      });
  };

  const renderNodeImgAndPrice = () => {
    let subTotal = (price + shippingFee) * currentQuantity;
    return (
      <View style={[styles.containerHeader, theme.MARGIN.marginTopDefault]}>
        <View>
          <Image style={[theme.IMAGES.node, theme.SHADOW.imageAvatar]} resizeMode="contain" source={nodeImg} />
        </View>
        <View style={{ width: '100%' }}>
          <Text style={theme.text.boldTextStyleLarge}>{`$${subTotal}`}</Text>
          <Text style={theme.text.regularTextMotto}>1 year warranty</Text>
          <Text style={theme.text.regularTextMotto}>30-day returns</Text>
        </View>
      </View>
    );
  };
  const renderMotto = () => {
    return (
      <View style={theme.MARGIN.marginTopDefault}>
        <Text style={[theme.MARGIN.marginBottomDefault, theme.text.regularTextMotto]}>{TOP_MOTTO_HEADER}</Text>
      </View>
    );
  };

  const renderActionSheet = () => {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignContent:'center', alignItems: 'center'}}>
        <Text style={[theme.text.boldTextStyleMedium]}>Quantity</Text>
        <View style={[theme.FLEX.rowSpaceBetween]}>
          <View style={theme.FLEX.rowSpaceBetween}>
            <TouchableOpacity
              style={[theme.MARGIN.marginRightDefault, styles.incBtn, {backgroundColor: currentQuantity === 1 ? COLORS.colorGreyLight : COLORS.colorGreyBold}]}
              disabled={currentQuantity == 1}
              onPress={() => {
                if (currentQuantity - 1 > 0) {
                  setCurrentQuantity(currentQuantity - 1);
                }
              }}
            >
              <AntDesign name="minus" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={[theme.text.boldTextStyleLarge, theme.MARGIN.marginRightDefault]}>{`${currentQuantity < 10 ? `0${currentQuantity}` : `${currentQuantity}`}`}</Text>
            <TouchableOpacity
              style={[{backgroundColor: currentQuantity === 5 ? COLORS.colorGreyLight : COLORS.colorGreyBold}, styles.incBtn]}
              disabled={currentQuantity == 5}
              onPress={() => {
                if (currentQuantity + 1 <= 5) {
                  setCurrentQuantity(currentQuantity + 1);
                }
              }}
            >
              <AntDesign name="plus" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderTotalItem = (text, value, styleText, styleValue) => {
    return (
      <View style={[theme.FLEX.fullWidth, theme.FLEX.rowSpaceBetween, theme.MARGIN.marginBottomSmall]}>
        <Text style={[theme.text.defaultTextStyle, theme.FLEX.alignViewSelfCenter, styleText]}>{`${text}`}</Text>
        <Text style={[theme.text.mediumText, theme.FLEX.alignViewSelfCenter, styleValue]}>{`${value}`}</Text>
      </View>
    );
  };
  const renderDestination = (onPress) => {
    return (
      <View>
        <View style={[theme.FLEX.fullWidth, theme.FLEX.rowSpaceBetween, theme.MARGIN.marginBottomSmall]}>
          <Text style={[theme.text.defaultTextStyle, theme.FLEX.alignViewSelfCenter, theme.text.mediumTextBold]}>Destination</Text>
          <TouchableOpacity onPress={onPress} style={styles.btnAdd}>
            <Text style={[theme.text.mediumText, theme.FLEX.alignViewSelfCenter]}>{contactData?.address ? 'Change' : 'Add'}</Text>
          </TouchableOpacity>
        </View>
        {contactData?.address && <Text style={[theme.text.regularTextMotto, theme.MARGIN.marginBottomSmall]}>{`${contactData?.address}, ${contactData?.city}, ${contactData?.region}, ${contactData?.country}`}</Text>}
      </View>
    );
  };

  const getShippingFee = async (data) => {
    let region = data.region ?? regions[0]?.value;
    await APIService.getShippingFee(data.countryCode || '', data.countryCode || '', data.countryCode || '', region || '', data.address || '')
      .then(val => {
        if (val && val?.Result) {
          setShippingFee(val?.Result?.ShippingFee || 0);

          // Update price specified
          checkSelectedTokenIdAndUpdateDynamicPrice(pTokenSupport, pTokenSupportsPartner, tokenId);
        }
      });
  };

  const updateAddress = async (data) => {
    setRegions(data?.region);
    await setContactData({ ...contactData, 
      email: data?.email,
      phone: data?.phone, 
      postalCode: data?.postalCode, 
      lastName: data?.lastName, 
      firstName: data?.firstName, 
      countryCode: data?.countryCode, 
      city: data?.city, 
      address: data?.address,
      region: data?.region});
    getShippingFee(data);
  };

  const renderTotal = () => {
    let countableToken = getCountCoinPayable();
    return (
      <View
        style={theme.MARGIN.marginTopAvg}
        onLayout={
          event => setYTotal(event?.nativeEvent?.layout?.y || 0)
        }
      >
        {renderDestination(()=>{
          if (contactData?.address) {
            NavigationService.navigate(routeNames.DestinationBuyNode, {
              updateAddressF: (data) => { 
                updateAddress(data); 
                setTimeout(() => {
                  NavigationService.goBack();
                }, 200);
              }, 
              data: contactData
            });
          } else {
            NavigationService.navigate(routeNames.DestinationBuyNode, {
              updateAddressF: (data) => { 
                updateAddress(data); 
                setTimeout(() => {
                  NavigationService.goBack();
                }, 200);
              }
            });
          }
        })}
        {renderTotalItem('Shipping', shippingFee === 0 ? 'FREE' : `$${shippingFee}`, theme.text.mediumTextBold, theme.text.mediumTextBold)}
        {renderTotalItem(`Ships ${shippingHour}`, '', theme.text.regularTextMotto)}
        {shippingFee > 0 ? renderTotalItem('Duties or taxed may be payable depending on your locality', '', theme.text.regularTextMotto) : null}
        {renderTotalItem('Total', `${countableToken?.res} ${symbol}`, theme.text.mediumTextBold, theme.text.mediumTextBold)}
        {renderTotalItem('', ` 1 ${symbol} = $${countableToken?.priceUSDT}`, {}, theme.text.regularTextMotto)}
        <LineView color={COLORS.colorGrey} />
      </View>
    );
  };

  const handleSelectToken = tokenId => {
    setCurrentTokenId(tokenId);
    dispatch(setSelectedPrivacy(tokenId));

    // Update price dynamically for DAI token
    checkSelectedTokenIdAndUpdateDynamicPrice(pTokenSupport, pTokenSupportsPartner, tokenId);
  };

  const checkSelectedTokenIdAndUpdateDynamicPrice = (pTokenSupport, pTokenSupportsPartner, tokenId) => {
    if (typeof pTokenSupport != 'object' || typeof pTokenSupportsPartner != 'object') {
      console.log('Response value from server not correct');
      return;
    }
    // Update price dynamically for DAI token
    let IDTokenDAI = '';
    for (let i = 0; i < pTokenSupport.length; i++) {
      if (pTokenSupport[i]?.TokenID === tokenId) {
        IDTokenDAI = pTokenSupport[i]?.ID;
        break;
      }
    }
    // Foreach in pTokenPartnerSupport, update price
    for (let j = 0; j < pTokenSupportsPartner.length; j++) {
      if (pTokenSupportsPartner[j]?.ID === IDTokenDAI) {
        IDTokenDAI = pTokenSupportsPartner[j]?.ID;
        // Set price
        setPrice(Number(pTokenSupportsPartner[j]?.Price || 0));
        break;
      } else {
        setPrice(priceDefault);
      }
    }
  };

  const renderPayment = () => {
    return (
      <View style={[theme.FLEX.rowSpaceBetween, theme.MARGIN.marginTopAvg]}>
        <Text style={[theme.text.boldTextStyleMedium]}>Pay with privacy coins</Text>
        <View style={{width: ScreenWidth * 0.4, flexDirection: 'row', justifyContent: 'flex-end',  alignItems: 'center'}}>
          <CurrentBalance
            balanceStyle={styles.balance}
            tokenStyle={{ fontSize: FONT.SIZE.regular }}
            isNestedCurrentBalance
            selectContainer={{
              borderWidth: 0,
              borderColor: 'white',
            }}
            containerStyle={{
              marginHorizontal: 0,
              paddingHorizontal: 0,
              borderWidth: 0,
              borderColor: 'white',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
            hideBalanceTitle
            select={
              (
                <TokenCustomSelect iconStyle={{ width: 100, paddingLeft: 50, }} customListPToken={pTokenSupport} onSelect={handleSelectToken} />
              )
            }
          />
          <AntDesign name="right" size={18} />
        </View>
      </View>
    );
  };

  // Process payment flow
  const onPaymentProcess = async () => {
    setLoading(true);
    APIService.checkOutOrder(
      contactData.email,
      contactData.code,
      contactData.address,
      contactData.city,
      contactData.region,
      contactData.postalCode,
      contactData.phoneNumber,
      currentTokenId,
      Number(currentQuantity),
      contactData.firstName,
      contactData.lastName)
      .then(data => {
        setLoading(false);
        NavigationService.navigate(routeNames.PaymentBuyNodeScreen, {
          'paymentDevice': {
            'Address': data?.Address,
            'TotalAmount': data?.TotalAmount,
            'TotalPrice': data?.TotalPrice,
            'OrderID': data?.OrderID
          }
        });
      })
      .catch(error => {
        setLoading(false);
        throw new Error('Can not checkout your order ' + error.message);
      });
  };

  // Disable button process for better behavior
  const shouldDisableButtonProcess = () => {
    return (!contactData.email ||
      !contactData.firstName ||
      !contactData.lastName ||
      !contactData.address ||
      !contactData.country ||
      !contactData.postalCode);
  };

  const renderButtonProcess = () => {
    return (
      <Button
        title="Confirm purchase"
        onPress={async () => {
          // Payment for device
          onPaymentProcess();
        }}
        style={[theme.MARGIN.marginTopDefault, theme.BUTTON.BLACK_TYPE]}
        disabled={shouldDisableButtonProcess()}
      />
    );
  };

  // Get count of token payable
  const getCountCoinPayable = () => {
    let subTotal = (price + shippingFee) * currentQuantity;
    let result = 0;
    let priceUSDT = 0;
    for (let i = 0; i < pTokenSupport.length; i++) {
      if (currentTokenId === pTokenSupport[i]?.TokenID) {
        let priceUSD = pTokenSupport[i]?.PriceUsd;
        priceUSDT = priceUSD;
        result = (subTotal / priceUSD).toFixed(4);
        break;
      }
    }
    return {res: parseFloat(result), priceUSDT: priceUSDT};
  };

  return (
    <View style={styles.container}>
      <Header title="Get Node" rightHeader={<BtnSelectAccount />} />
      <ScrollView
        refreshControl={(
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              getSystemConfig();
            }}
          />
        )}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }]
        )}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
        // containerContentStyle={styles.container}
        // I want to scroll into current focusing container for better UX
        onContentSizeChange={(contentWidth, contentHeight) => { showContactForShipping && scrollViewRef?.current?.scrollTo({ y: 600, animated: true }); }}
      >
        <KeyboardAwareScrollView style={{ backgroundColor: 'white' }} showsVerticalScrollIndicator={false} enableOnAndroid>
          {renderNodeImgAndPrice()}
          {renderMotto()}
          {renderActionSheet()}
          {renderPayment()}
          {renderTotal()}
          {renderButtonProcess()}

          {loading && <ActivityIndicator style={theme.FLEX.absoluteIndicator} />}

        </KeyboardAwareScrollView>

      </ScrollView>
      {/* {renderFloatingPriceView()} */}
    </View>
  );
};

BuyNodeScreen.propTypes = {
};


const mapState = (state) => ({
  wallet: state.wallet,
  account: accountSeleclor.defaultAccount(state),
});

const mapDispatch = {
  setSelectedPrivacy,
};

export default connect(mapState, mapDispatch)(BuyNodeScreen);
