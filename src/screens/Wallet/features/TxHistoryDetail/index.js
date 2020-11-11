/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { retryExpiredDeposit } from '@src/services/api/history';
import { ExHandler } from '@src/services/exception';
import { Toast, Button } from '@src/components/core';
import Header from '@src/components/Header';
import routeNames from '@src/router/routeNames';
import withTxHistoryDetail from './TxHistoryDetail.enhance';
import styles from './styles';
import TxHistoryDetail from './TxHistoryDetail';

class TxHistoryDetailContainer extends Component {
  state = {
    shouldShowTxModal: false,
    errorTx: false,
    txOutchain: '',
    shouldEnableBtn: false,
  };

  goBack = () => {
    const { navigation } = this.props;
    navigation.pop();
  };

  handleRetryExpiredDeposit = async (data, isDecentralized) => {
    try {
      if (data) {
        const { txOutchain } = this.state;
        if (isDecentralized) {
          if (txOutchain === '') {
            return;
          }
          let newData = { ...data.history, TxOutchain: txOutchain };
          await retryExpiredDeposit(newData);
        } else {
          await retryExpiredDeposit(data);
        }
        const decentralizedMSg =
          'Your request has been sent, we will process it soon.';
        const centralizedMSg =
          'Your request has been sent, we will process it soon. The history status will be updated';

        Toast.showInfo(isDecentralized ? decentralizedMSg : centralizedMSg);
        this.goBack();
      }
    } catch (e) {
      new ExHandler(
        e,
        'Sorry, we can not process this expired deposit request. Please try again.',
      ).showErrorToast();
    }
  };
  renderModalTXOutchain = () => {
    const { shouldShowTxModal, errorTx, shouldEnableBtn } = this.state;
    return (
      <Modal
        transparent
        animationType="none"
        visible={shouldShowTxModal}
        onRequestClose={() => {}}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            this.setState({
              shouldShowTxModal: false,
              errorTx: false,
              shouldEnableBtn: false,
            });
          }}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.titleModal}>
                  If you have already sent funds to the deposit address, just
                  enter your transaction ID here. Your balance will update
                  within 24 hours.
                </Text>
                <TextInput
                  onChangeText={(text) => {
                    if (text.replace(/ /g, '').length === 0) {
                      this.setState({ errorTx: true, shouldEnableBtn: false });
                    } else {
                      this.setState({
                        txOutchain: text,
                        errorTx: false,
                        shouldEnableBtn: true,
                      });
                    }
                  }}
                  returnKeyType="done"
                  placeholder="TransactionID"
                  numberOfLines={1}
                  style={styles.txField}
                />
                <Text style={[styles.titleModal, styles.warning]}>
                  {errorTx ? 'Tx required' : ''}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    style={[styles.submitBTN, { opacity: errorTx ? 0.8 : 1 }]}
                    disabled={!shouldEnableBtn}
                    title="Submit"
                    onPress={async () => {
                      const { txOutchain } = this.state;
                      const { data } = this.props;
                      if (txOutchain !== '') {
                        await this.handleRetryExpiredDeposit(data, true);
                        this.setState({
                          shouldShowTxModal: false,
                          errorTx: false,
                        });
                      } else {
                        this.setState({ errorTx: true });
                      }
                    }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  onGoBack = () => this.props?.navigation?.navigate(routeNames.WalletDetail);

  render() {
    const { data } = this.props;
    let decentralized = data?.history?.decentralized;
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <TxHistoryDetail
          {...this.props}
          onRetryExpiredDeposit={() => {
            if (decentralized) {
              this.setState({ shouldShowTxModal: true });
            } else {
              this.handleRetryExpiredDeposit(data?.history, false);
            }
          }}
        />
        {this.renderModalTXOutchain()}
      </View>
    );
  }
}

TxHistoryDetailContainer.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default withTxHistoryDetail(TxHistoryDetailContainer);
