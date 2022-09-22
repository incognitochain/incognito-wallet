import { Dimensions, Clipboard } from 'react-native';
import { compose } from 'recompose';
import {
  ScrollViewBorder,
  Toast,
  RefreshControl,
  TouchableOpacity,
  View,
  Text,
} from '@src/components/core';
import { View2 } from '@src/components/core/View';
import { actionFetchTx } from '@src/redux/actions/history';
import {
  historyDetailFactoriesSelector,
  historyDetailSelector,
} from '@src/redux/selectors/history';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CopyIcon, OpenUrlIcon } from '@src/components/Icons';
import { Header } from '@src/components';
import { withLayout_2 } from '@src/components/Layout';
import { QrCodeAddressDefault } from '@src/components/QrCodeAddress';
import { BtnChevron, BtnCopy } from '@src/components/Button';
import HTML from 'react-native-render-html';
import LinkingService from '@src/services/linking';
import { ExHandler } from '@src/services/exception';
import { useNavigation } from 'react-navigation-hooks';
import { getDefaultAccountWalletSelector } from '@src/redux/selectors/shared';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '@src/styles';
import { styled } from './History.styled';

const Hook = React.memo((props) => {
  const {
    label,
    value,
    valueTextStyle,
    handleOpenUrl,
    openUrl,
    onPressDetail,
    showRightIconDetail,
    copyable,
    disabled,
    fullText = false,
    showDetail = false,
    detail = '',
    canResumeExpiredShield = false,
    canRetryInvalidAmountShield = false,
    isToggleDetail = false,
  } = props || {};
  const accountWallet = useSelector(getDefaultAccountWalletSelector);
  const { tx } = useSelector(historyDetailSelector);
  const [toggle, setToggle] = React.useState(isToggleDetail || false);
  const [resume, setResume] = React.useState(false);
  const [retry, setRetry] = React.useState(false);
  const navigation = useNavigation();
  const handleCopyText = () => {
    Clipboard.setString(value);
    Toast.showInfo('Copied');
  };
  const handleResumeExpiredShield = async () => {
    try {
      if (resume) {
        return;
      }
      await setResume(true);
      const result = await accountWallet.handleRetryExpiredShield({
        history: tx,
      });
      if (result) {
        Toast.showInfo(
          'Your request has been sent, we will process it soon. The history status will be updated',
        );
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      await setResume(false);
      navigation.goBack();
    }
  };
  const handleRetryInvalidAmountShield = async () => {
    try {
      if (retry) {
        return;
      }
      await setRetry(true);
      const result = await accountWallet.handleRetryExpiredShield({
        history: tx,
      });
      if (result) {
        Toast.showInfo(
          'Your request has been sent, we will process it soon. The history status will be updated',
        );
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      await setRetry(false);
      navigation.goBack();
    }
  };
  if (disabled) {
    return null;
  }
  
  return (
    <>
      <View style={[styled.rowText, fullText && styled.rowFullText]}>
        <Text
          style={[styled.labelText]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {`${label}:`}
        </Text>
        <View style={[styled.extra]}>
          <Text
            style={[styled.valueText, valueTextStyle]}
            numberOfLines={fullText ? 0 : 1}
            ellipsizeMode="middle"
          >
            {value}
          </Text>
          {canResumeExpiredShield && (
            <TouchableOpacity
              style={styled.btnResumeOrRetry}
              onPress={handleResumeExpiredShield}
            >
              <Text style={styled.textBtnResumeOrRetry}>
                {`Resume${resume ? '...' : ''}`}
              </Text>
            </TouchableOpacity>
          )}
          {canRetryInvalidAmountShield && (
            <TouchableOpacity
              style={styled.btnResumeOrRetry}
              onPress={handleRetryInvalidAmountShield}
            >
              <Text style={styled.textBtnResumeOrRetry}>
                {`Retry${retry ? '...' : ''}`}
              </Text>
            </TouchableOpacity>
          )}
          {copyable && (
            <TouchableOpacity
              style={styled.rowTextTouchable}
              onPress={handleCopyText}
            >
              <CopyIcon style={styled.copyIcon} />
            </TouchableOpacity>
          )}
          {openUrl && (
            <TouchableOpacity
              style={styled.rowTextTouchable}
              onPress={handleOpenUrl}
            >
              <OpenUrlIcon style={styled.linkingIcon} />
            </TouchableOpacity>
          )}
          {showDetail && (
            <BtnChevron
              style={styled.btnChevron}
              size={18}
              toggle={toggle}
              onPress={() => setToggle(!toggle)}
            />
          )}
        </View>
      </View>
      {toggle && (
        <TouchableOpacity
          style={styled.detailContainer}
          activeOpacity={1}
          onPress={() => {
            if (typeof onPressDetail === 'function') {
              onPressDetail();
            }
          }}
        >
          <HTML
            html={`<p>${detail}</p>`}
            imagesMaxWidth={Dimensions.get('window').width}
            onLinkPress={(e, href) => {
              LinkingService.openUrl(href);
            }}
            tagsStyles={{
              a: { ...styled?.p, ...styled?.a },
              p: { ...styled?.p, ...valueTextStyle },
            }}
          />
          {showRightIconDetail && (
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={valueTextStyle?.color || COLORS.lightGrey36}
            />
          )}
        </TouchableOpacity>
      )}
    </>
  );
});

const History = () => {
  const factories = useSelector(historyDetailFactoriesSelector);
  const { tx, fetching } = useSelector(historyDetailSelector);
  const dispatch = useDispatch();
  if (factories.length === 0) {
    return null;
  }
  console.log('factories::: ', factories);
  const handleRefresh = () => dispatch(actionFetchTx());
  const onCopyData = () => {
    Clipboard.setString(JSON.stringify(tx));
    Toast.showSuccess('Copied');
  };
  const navigation = useNavigation();
  return (
    <View2 style={styled.container}>
      <Header
        title="Transaction detail"
        customHeaderTitle={
          <BtnCopy style={{ marginLeft: 10 }} isHeader onPress={onCopyData} />
        }
      />
      <ScrollViewBorder
        refreshControl={
          <RefreshControl refreshing={fetching} onRefresh={handleRefresh} />
        }
      >
        {factories.map((hook, index) => (
          <Hook key={index} {...hook} />
        ))}
        {tx?.shouldRenderQrShieldingAddress && (
          <QrCodeAddressDefault
            label="Shielding address"
            address={tx?.address}
            isPending={tx?.isShielding}
            symbol={tx?.symbol}
            min={tx?.minShield}
          />
        )}
        <View style={{ height: 50 }} />
      </ScrollViewBorder>
    </View2>
  );
};

History.propTypes = {};

export default compose(withLayout_2)(React.memo(History));
