import { Dimensions, View, Text, Clipboard } from 'react-native';
import { compose } from 'recompose';
import {
  ScrollView,
  Toast,
  RefreshControl,
  TouchableOpacity,
} from '@src/components/core';
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
import { BtnChevron, BtnCopy, BtnResume } from '@src/components/Button';
import HTML from 'react-native-render-html';
import LinkingService from '@src/services/linking';
import { ExHandler } from '@src/services/exception';
import { useNavigation } from 'react-navigation-hooks';
import { getDefaultAccountWalletSelector } from '@src/redux/selectors/shared';
import { styled } from './History.styled';

const Hook = React.memo((props) => {
  const {
    label,
    value,
    valueTextStyle,
    handleOpenUrl,
    openUrl,
    copyable,
    disabled,
    fullText = false,
    showDetail = false,
    detail = '',
    canResumeExpiredShield = false,
    canRetryInvalidAmountShield = false,
  } = props || {};
  const accountWallet = useSelector(getDefaultAccountWalletSelector);
  const { tx } = useSelector(historyDetailSelector);
  const [toggle, setToggle] = React.useState(false);
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
        <HTML
          html={`<p>${detail}</p>`}
          imagesMaxWidth={Dimensions.get('window').width}
          onLinkPress={(e, href) => {
            LinkingService.openURL(href);
          }}
          tagsStyles={{
            a: { ...styled?.p, ...styled?.a },
            p: styled?.p,
          }}
        />
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
  const handleRefresh = () => dispatch(actionFetchTx());
  const onCopyData = () => {
    Clipboard.setString(JSON.stringify(tx));
    Toast.showSuccess('Copied');
  };
  return (
    <View style={styled.container}>
      <Header
        title="Transaction detail"
        customHeaderTitle={
          <BtnCopy style={{ marginLeft: 10 }} onPress={onCopyData} />
        }
      />
      <ScrollView
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
      </ScrollView>
    </View>
  );
};

History.propTypes = {};

export default compose(withLayout_2)(React.memo(History));
