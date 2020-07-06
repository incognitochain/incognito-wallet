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
import { BtnInfo } from '@src/components/Button';
import BtnInformation from '@src/components/Button/BtnInformation';
import BtnMoreInfo from '@src/components/Button/BtnMoreInfo';
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

const EMAIL = 'email';
// For animated total view
const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = 0;

const BuyNodeScreen = () => {
  let emailRef = useRef();
  let firstNameRef = useRef();
  let lastNameRef = useRef();
  let addressRef = useRef();
  let cityRef = useRef();
  let postalCodeRef = useRef();
  let phoneRef = useRef();
  let scrollViewRef = useRef();

  const [errTf, setErrTF] = useState({});
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [price, setPrice] = useState(399);
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

  // Get all pToken for internal app, only accept with these coins
  const getPTokenList = async (resPTokenSupportsPartner) => {
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
          <Text style={theme.text.boldTextStyleLarge}>{`$${price}`}</Text>
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

  const renderTotal = () => {
    let countableToken = getCountCoinPayable();
    console.log(LogManager.parseJsonObjectToJsonString(countableToken));
    return (
      <View
        style={theme.MARGIN.marginTopAvg}
        onLayout={
          event => setYTotal(event?.nativeEvent?.layout?.y || 0)
        }
      >
        {renderTotalItem('Shipping', shippingFee === 0 ? 'FREE' : `$${shippingFee}`, theme.text.mediumTextBold, theme.text.mediumTextBold)}
        {renderTotalItem(`Ships ${shippingHour}`, '', theme.text.regularTextMotto)}
        {shippingFee > 0 ? renderTotalItem('Duties or taxed may be payable depending on your locality', '', theme.text.regularTextMotto) : null}
        <LineView color={COLORS.white} style={theme.MARGIN.marginBottomDefault} />
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
        // Set price default
        setPrice(399);
      }
    }
  };

  const renderPayment = () => {
    return (
      <View style={[theme.FLEX.rowSpaceBetween, theme.MARGIN.marginTopAvg]}>
        <Text style={[theme.text.boldTextStyleMedium, { marginTop: 5 }]}>Pay with privacy coins</Text>
        <View style={{width: ScreenWidth * 0.4}}>
          <View style={styles.wallet}>
            <BtnSelectAccount />
          </View>
          <CurrentBalance
            balanceStyle={styles.balance}
            tokenStyle={{ fontSize: FONT.SIZE.regular }}
            isNestedCurrentBalance
            containerStyle={{
              marginHorizontal: 0,
              paddingHorizontal: 0,
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
        </View>
      </View>
    );
  };

  const onFocusField = () => {
    let { errors = {} } = errTf;

    for (let name in errors) {
      let ref = name?.current;

      if (ref && ref.isFocused()) {
        delete errors[name];
      }
    }

    setErrTF(errors);
  };
  const getShippingFee = async (value) => {
    let region = contactData.region ?? regions[0]?.value;
    await APIService.getShippingFee(contactData.city || '', value ? value : contactData?.code, contactData.postalCode || '', region || '', contactData.address || '')
      .then(val => {
        if (val && val?.Result) {
          setShippingFee(val?.Result?.ShippingFee || 0);
          setPrice(val?.Result?.Price || 0);

          // Update price specified
          checkSelectedTokenIdAndUpdateDynamicPrice(pTokenSupport, pTokenSupportsPartner, tokenId);
        }
      });
  };

  // Update region by countryname change 
  const updateRegionByCountryName = async (countryValue) => {
    for (let i = 0; i < dataCountry.length; i++) {
      if (dataCountry[i].value.includes(countryValue)) {
        let region = dataCountry[i].regions;
        await setRegions(region);
      }
    }
  };

  const checkErrEmail = (valid) => {
    let error = errTf;
    error[EMAIL] = !valid ? 'Email is invalid' : '';

    // We have to do this for asynchornous updatable
    setErrTF(prevError => ({ ...prevError, ...error }));
  };
  const checkErrEmpty = (field, valid) => {
    let error = errTf;
    error[`${field}`] = !valid ? 'Field required' : '';

    // We have to do this for asynchornous updatable
    setErrTF(prevError => ({ ...prevError, ...error }));
  };

  // Update regions by country changes
  const changeRegionsDataAndSetCountryCode = async (countryValue) => {
    let countryCode = '';
    for (let i = 0; i < dataCountry.length; i++) {
      if (dataCountry[i].value === countryValue) {
        await setContactData({ ...contactData, code: dataCountry[i].countryShortCode, country: dataCountry[i].value });
        countryCode = dataCountry[i].countryShortCode;
        let dataRegions = dataCountry[i].regions;
        await setRegions(dataRegions);
      }
    }
    return countryCode;
  };

  const renderContactInformation = () => {
    return (
      <View
        style={theme.MARGIN.marginTopDefault}
        onLayout={
          event => setYContact(event?.nativeEvent?.layout?.y || 0)
        }
      >
        <Text style={[theme.text.defaultTextStyle, { fontSize: FONT.SIZE.medium }]}>Shipping address</Text>
        <TextField
          keyboardType='email-address'
          autoCapitalize='none'
          autoCorrect={false}
          ref={emailRef}
          inputContainerStyle={{ marginTop: -5 }}
          onSubmitEditing={() => { firstNameRef && firstNameRef?.current?.focus(); }}
          enablesReturnKeyAutomatically
          onFocus={() => onFocusField()}
          onChangeText={async (text) => {
            await setContactData({ ...contactData, email: text });
            await checkErrEmail(checkEmailValid(text).valid);
            getShippingFee();
          }}
          returnKeyType='next'
          label='Email'
          error={errTf?.email}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -10 }}>
          <TextField
            inputContainerStyle={[styles.halfInput, { overflow: 'hidden', }]}
            ref={firstNameRef}
            onSubmitEditing={() => { lastNameRef && lastNameRef?.current?.focus(); }}
            keyboardType='default'
            autoCapitalize='none'
            autoCorrect={false}
            enablesReturnKeyAutomatically
            // onFocus={() => onFocusField()}
            onChangeText={async (text) => {
              await setContactData({ ...contactData, firstName: text });
              await checkErrEmpty('firstName', checkFieldEmpty(text));
              getShippingFee();
            }}
            maxLength={50}
            returnKeyType='next'
            label='First name'
            errorColor='white'
            error={errTf?.firstName}
          />
          <TextField
            inputContainerStyle={[styles.halfInput, { overflow: 'hidden', }]}
            ref={lastNameRef}
            onSubmitEditing={() => { cityRef && cityRef?.current?.focus(); }}
            keyboardType='default'
            autoCapitalize='none'
            autoCorrect={false}
            maxLength={50}
            enablesReturnKeyAutomatically
            onFocus={() => onFocusField()}
            onChangeText={async (text) => {
              await setContactData({ ...contactData, lastName: text });
              await checkErrEmpty('lastName', checkFieldEmpty(text));
              getShippingFee();
            }}
            returnKeyType='next'
            label='Last name'
            error={errTf?.lastName}
          />
        </View>

        <Dropdown
          label='Country/Region'
          data={dataCountry}
          inputContainerStyle={{ marginTop: -5 }}
          value={contactData?.country || ''}
          onChangeText={async (value) => {
            await setContactData({ ...contactData, country: value, region: '' });
            await updateRegionByCountryName(value);
            let code = await changeRegionsDataAndSetCountryCode(value);
            await getShippingFee(code);
          }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: -5 }}>
          <Dropdown
            inputContainerStyle={{ width: (ScreenWidth - 40) / 2, marginTop: 2 }}
            label='State'
            data={regions}
            value={regions[0]?.value || ''}
            onChangeText={async (value) => {
              await setContactData({ ...contactData, region: value });
              await getShippingFee();
            }}
          />
          <TextField
            // editable={false}
            direction='rtl'
            inputContainerStyle={{ width: (ScreenWidth - 40) / 2 - 15, overflow: 'hidden', }}
            ref={cityRef}
            keyboardType='default'
            autoCapitalize='none'
            autoCorrect={false}
            enablesReturnKeyAutomatically
            onFocus={() => onFocusField()}
            maxLength={50}
            onSubmitEditing={() => { addressRef && addressRef?.current?.focus(); }}
            onChangeText={async (text) => {
              await setContactData({ ...contactData, city: text });
              await checkErrEmpty('city', checkFieldEmpty(text));
              getShippingFee();
            }}
            returnKeyType='next'
            label='City'
            error={errTf?.city}
          />
        </View>
        <TextField
          ref={addressRef}
          inputContainerStyle={{ width: (ScreenWidth - 40) }}
          keyboardType='default'
          autoCapitalize='none'
          autoCorrect={false}
          onSubmitEditing={() => { postalCodeRef && postalCodeRef?.current?.focus(); }}
          enablesReturnKeyAutomatically
          maxLength={50}
          onFocus={() => onFocusField()}
          onChangeText={async (text) => {
            await setContactData({ ...contactData, address: text });
            await checkErrEmpty('address', checkFieldEmpty(text));
            getShippingFee();
          }}
          returnKeyType='next'
          label='Address'
          error={errTf?.address}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 0 }}>
          <TextField
            inputContainerStyle={{ width: (ScreenWidth - 40) / 2 - 15, overflow: 'hidden', }}
            keyboardType='default'
            autoCapitalize='none'
            autoCorrect={false}
            ref={postalCodeRef}
            onSubmitEditing={() => { phoneRef && phoneRef?.current?.focus(); }}
            enablesReturnKeyAutomatically
            maxLength={50}
            onFocus={() => onFocusField()}
            onChangeText={async (text) => {
              await setContactData({ ...contactData, postalCode: text });
              await checkErrEmpty('postalCode', checkFieldEmpty(text));
              getShippingFee();
            }}
            returnKeyType='next'
            label='Postal code'
            error={errTf?.postalCode}
          />
          <TextField
            inputContainerStyle={{ width: (ScreenWidth - 40) / 2 - 15, overflow: 'hidden', }}
            keyboardType='numeric'
            autoCapitalize='none'
            autoCorrect={false}
            ref={phoneRef}
            enablesReturnKeyAutomatically
            maxLength={50}
            onFocus={() => onFocusField()}
            onChangeText={async (text) => {
              await setContactData({ ...contactData, phone: text });
              getShippingFee();
            }}
            returnKeyType='done'
            label='Phone (optional)'
          />
        </View>
      </View>
    );
  };

  // Show contact section for user typing
  const onShowContactForShipping = () => {
    setShowContactForShipping(true);
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
    return showContactForShipping && !(contactData.email &&
      contactData.firstName &&
      contactData.lastName &&
      contactData.address &&
      contactData.country &&
      contactData.postalCode);
  };

  const renderButtonProcess = () => {
    return (
      <Button
        title={showContactForShipping ? 'Confirm purchase' : 'Add destination'}
        onPress={async () => {
          if (!showContactForShipping) {
            // Show contact section
            await onShowContactForShipping();
            scrollViewRef?.current?.scrollToEnd({ animated: true });
          } else {
            // Payment for device
            onPaymentProcess();
          }
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
      <Header title="Get Node" rightHeader={<BtnMoreInfo onPress={()=>{NavigationService.navigate(routeNames.NodeBuyHelp); }} />} />
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
          {renderContactInformation()}
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
