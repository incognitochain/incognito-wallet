import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withNavigationFocus } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { Image, Linking } from 'react-native';
import { ActivityIndicator, TouchableOpacity, View } from '@components/core';
import { MAIN_WEBSITE } from '@src/constants/config';
import chevronLeft from '@assets/images/icons/chevron-left-icon.png';
import BackButton from '@src/components/BackButton';
import LogManager from '@src/services/LogManager';
import LocalDatabase from '@src/utils/LocalDatabase';
import { CircleBack } from '@src/components/Icons';
import NavigationService from '@src/services/NavigationService';
import Header from '@src/components/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { hasNotch } from 'react-native-device-info';
import { COLORS } from '@src/styles';
import _ from 'lodash';
import styles from './style';

var isBackable = false;
const Community = ({ navigation, isFocused }) => {
  const webViewRef = useRef();
  const [loading, setLoading] = useState(true);
  const [backable, setBackable] = useState(false);
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (isFocused) {
      const { uri: _uri } = navigation?.state?.params || {};
      if (_uri) {
        webViewRef?.current?.injectJavaScript(`location.href = '${_uri}';`);
        navigation?.setParams({ uri: null });
        return setUrl(_uri);
      }
      // Check if the cache is existing
      LocalDatabase.getUriWebviewCommunity()
        .then(val => {
          if (val) {
            var pattern = /^((http|https|ftp):\/\/)/;
            if (!pattern.test(url)) {
              setUrl(val);
            } else {
              setUrl(MAIN_WEBSITE);
            }
          } else {
            setUrl(MAIN_WEBSITE);
          }
        })
        .catch(err => {
          setUrl(MAIN_WEBSITE);
        });
    }
  }, []);

  const goBack = () => {
    if (!backable) {
      setUrl(MAIN_WEBSITE);
      webViewRef?.current?.reload();
    } else {
      webViewRef?.current?.goBack();
    }
  };
  const goForward = () => {
    webViewRef.current.goForward();
  };

  const stateHandler = (state) => {
    if (state?.url?.includes('about:blank')) {
      setBackable(state?.canGoBack);
      // setUrl(MAIN_WEBSITE);
      setUrl(state?.url);
    } else {
      setBackable(state?.canGoBack);
      // No need to clarify here
      // setUrl(MAIN_WEBSITE);
      // setUrl(`${state?.url}`);
    }
  };

  const goHome = async () => {
    setUrl(MAIN_WEBSITE);
    await LocalDatabase.setUriWebviewCommunity(MAIN_WEBSITE);
    setTimeout(() => {
      webViewRef?.current?.reload();
    }, 750);
  };

  const reload = () => {
    try {
    webViewRef?.current?.reload();
    } catch (err) {
      console.log(err?.message || '');
    }
  };

  const renderBottomBar = () => {
    return (
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => goBack()} style={styles.back}>
          <Ionicons
            name="ios-arrow-back"
            size={30}
            color={COLORS.colorGreyBold}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => goForward()} style={styles.back}>
          <Ionicons
            name="ios-arrow-forward"
            size={30}
            color={COLORS.colorGreyBold}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.back}>
          {/* <SimpleLineIcons name="home" size={25} color={COLORS.colorGreyBold} /> */}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => reload()} style={styles.back}>
          <Ionicons name="ios-refresh" size={30} color={COLORS.colorGreyBold} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Community" style={{ paddingLeft: 20 }} />
      <WebView
        key={`${url}`}
        startInLoadingState
        onLoadEnd={(data) => {
          setLoading(false);
        }}
        onShouldStartLoadWithRequest={event => {
          if (event.url.startsWith('http')) {
            return true;
          }
          return false;
        }}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1"
        source={{ uri: url }}
        ref={webViewRef}
        useWebKit
        onNavigationStateChange={stateHandler}
        injectedJavaScript={`
        (function() {
          function wrap(fn) {
            return function wrapper() {
              var res = fn.apply(this, arguments);
              window.ReactNativeWebView.postMessage('navigationStateChange');
              return res;
            }
          }
      
          history.pushState = wrap(history.pushState);
          history.replaceState = wrap(history.replaceState);
          window.addEventListener('popstate', function() {
            window.ReactNativeWebView.postMessage('navigationStateChange');
          });
        })();
      
        true;
      `}
        onMessage={async ({ nativeEvent: state }) => {
          if (state.data === 'navigationStateChange') {
            if (typeof state?.url === 'string' && state.url.includes(MAIN_WEBSITE)) {
              await LocalDatabase.setUriWebviewCommunity(state?.url);
            }
          }
        }}
      />
      {/* {loading && <ActivityIndicator style={styles.loading} />} */}
      {/* No need to add back button here */}
      {/* {backable && (
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Image
            style={{
              height: 18,
              width: '100%',
            }}
            resizeMode="contain"
            resizeMethod="resize"
            source={chevronLeft}
          />
        </TouchableOpacity>
      )} */}
      {renderBottomBar()}
    </View>
  );
};

Community.propTypes = {
  navigation: PropTypes.object.isRequired,
  isFocused: PropTypes.bool.isRequired,
};

export default withNavigationFocus(Community);
