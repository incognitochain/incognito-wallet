import React, { useRef, useState, useEffect } from 'react';
import { Text, ScrollView, View, Button } from '@src/components/core';
import Header from '@src/components/Header';
import theme from '@src/styles/theme';
import { FONT } from '@src/styles';
import { checkEmailValid, checkFieldEmpty } from '@src/utils/validator';
import { TextField } from 'react-native-material-textfield';
import { Dropdown } from 'react-native-material-dropdown';
import { ScreenWidth } from '@src/utils/devices';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigationParam } from 'react-navigation-hooks';
import LogManager from '@src/services/LogManager';
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
  const [regions, setRegions] = useState([]);
  const [contactData, setContactData] = useState({});

  const [errTf, setErrTF] = useState({});
  const updateAddressF = useNavigationParam('updateAddressF');
  let data = useNavigationParam('data');
  useEffect(()=>{
    if (data) {
      setContactData(data);
      emailRef?.current?.setValue(data?.email);
      firstNameRef?.current?.setValue(data?.firstName);
      lastNameRef?.current?.setValue(data?.lastName);
      addressRef?.current?.setValue(data?.address);
      cityRef?.current?.setValue(data?.city);
      postalCodeRef?.current?.setValue(data?.postalCode);
      phoneRef?.current?.setValue(data?.phone);
    }
  }, []);
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
        await setContactData({ ...contactData, country: countryValue, countryCode: dataCountry[i].countryShortCode, region: region[0].value });
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
          }}
        />
        <Dropdown
          inputContainerStyle={{ marginTop: 2 }}
          label='State'
          data={regions}
          value={contactData?.region || ''}
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
    return (!contactData.email ||
      !contactData.firstName ||
      !contactData.address ||
      !contactData.lastName ||
      !contactData.address ||
      !contactData.country ||
      !contactData.postalCode);
  };

  return (
    <View style={styles.container}>
      <Header title="Destination" />
      <KeyboardAwareScrollView extraScrollHeight={100} extraHeight={50} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}}>
        {renderContactInformation()}
        <Button
          title="Add destination"
          onPress={()=>updateAddressF(contactData)}
          style={[theme.MARGIN.marginTopDefault, theme.BUTTON.BLACK_TYPE]}
          disabled={shouldDisableButtonProcess()}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default React.memo(DestinationBuyNode);
