import React, { useRef, useState } from 'react';
import { Text, ScrollView, View, Button } from '@src/components/core';
import Header from '@src/components/Header';
import theme from '@src/styles/theme';
import { FONT } from '@src/styles';
import { checkEmailValid, checkFieldEmpty } from '@src/utils/validator';
import { TextField } from 'react-native-material-textfield';
import { Dropdown } from 'react-native-material-dropdown';
import { ScreenWidth } from '@src/utils/devices';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from './style';

const EMAIL = 'email';
const dataCountry = require('../../assets/rawdata/country.json');

const DestinationBuyNode = () => {
  let emailRef = useRef();
  let firstNameRef = useRef();
  let lastNameRef = useRef();
  let addressRef = useRef();
  let cityRef = useRef();
  let postalCodeRef = useRef();
  let phoneRef = useRef();
  let scrollViewRef = useRef();

  const [regions, setRegions] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [price, setPrice] = useState(399);
  const [shippingHour, setShippingHour] = useState('');

  const [pTokenSupport, setPTokenSupport] = useState([]);
  const [pTokenSupportsPartner, setPTokenSupportsPartner] = useState([]);

  const [showContactForShipping, setShowContactForShipping] = useState(false);

  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [contactData, setContactData] = useState({});

  const [errTf, setErrTF] = useState({});

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
      >
        <Dropdown
          label='Country/Region'
          data={dataCountry}
          inputContainerStyle={{ marginTop: -5 }}
          value={contactData?.country || ''}
          onChangeText={async (value) => {
            await setContactData({ ...contactData, country: value, region: '' });
            await updateRegionByCountryName(value);
            let code = await changeRegionsDataAndSetCountryCode(value);
          }}
        />
        <Dropdown
          inputContainerStyle={{ marginTop: 2 }}
          label='State'
          data={regions}
          value={regions[0]?.value || ''}
          onChangeText={async (value) => {
            await setContactData({ ...contactData, region: value });
          }}
        />
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
          }}
          returnKeyType='next'
          label='Email'
          error={errTf?.email}
        />
        
        <TextField
          inputContainerStyle={[{ overflow: 'hidden', }]}
          ref={firstNameRef}
          onSubmitEditing={() => { lastNameRef && lastNameRef?.current?.focus(); }}
          keyboardType='default'
          autoCapitalize='none'
          autoCorrect={false}
          enablesReturnKeyAutomatically
          onFocus={() => onFocusField()}
          onChangeText={async (text) => {
            await setContactData({ ...contactData, firstName: text });
            await checkErrEmpty('firstName', checkFieldEmpty(text));
          }}
          maxLength={50}
          returnKeyType='next'
          label='First name'
          errorColor='white'
          error={errTf?.firstName}
        />
        <TextField
          inputContainerStyle={[{ overflow: 'hidden', }]}
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
          }}
          returnKeyType='next'
          label='Last name'
          error={errTf?.lastName}
        />
        <TextField
          // editable={false}
          direction='rtl'
          inputContainerStyle={{ width: (ScreenWidth - 40), overflow: 'hidden', }}
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
          }}
          returnKeyType='next'
          label='City'
          error={errTf?.city}
        />
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
          }}
          returnKeyType='next'
          label='Address'
          error={errTf?.address}
        />
        <TextField
          inputContainerStyle={{ width: (ScreenWidth - 40), overflow: 'hidden', }}
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
          }}
          returnKeyType='next'
          label='Postal code'
          error={errTf?.postalCode}
        />

        <TextField
          inputContainerStyle={{ width: (ScreenWidth - 40), overflow: 'hidden', }}
          keyboardType='numeric'
          autoCapitalize='none'
          autoCorrect={false}
          ref={phoneRef}
          enablesReturnKeyAutomatically
          maxLength={50}
          onFocus={() => onFocusField()}
          onChangeText={async (text) => {
            await setContactData({ ...contactData, phone: text });
          }}
          returnKeyType='done'
          label='Phone (optional)'
        />

      </View>
    );
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

  return (
    <View style={styles.container}>
      <Header title="Destination" />
      <KeyboardAwareScrollView extraScrollHeight={50} extraHeight={50} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}}>
        {renderContactInformation()}
        <Button
          title="Add destination"
          onPress={async () => {
            
          }}
          style={[theme.MARGIN.marginTopDefault, theme.BUTTON.BLACK_TYPE]}
          disabled={shouldDisableButtonProcess()}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default React.memo(DestinationBuyNode);
