import { RoundCornerButton, TextInput } from '@components/core';
import Loader from '@components/DialogLoader';
import routeNames from '@routers/routeNames';
import BaseScreen from '@screens/BaseScreen';
import { CONSTANT_MINER } from '@src/constants';
import { DEVICES } from '@src/constants/miner';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import { onClickView } from '@src/utils/ViewUtil';
import LocalDatabase from '@utils/LocalDatabase';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useImperativeHandle, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { getTimeZone } from 'react-native-localize';
import Header from '@src/components/Header';
import theme from '@src/styles/theme';
import { COLORS } from '@src/styles';
import { withLayout_2 } from '@components/Layout';
import VirtualNodeService from '@services/VirtualNodeService';
import Device from '@models/device';
import styles from './style';

const SHORT_DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
const FULL_DOMAIN_REGEX = /^(http)|(https):\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
const IP_ADDRESS_REGEX = /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(:[0-9]+)?$/;
const LOCALHOST_REGEX = /^localhost(:[0-9]+)?$/;

export const TAG = 'AddSelfNode';
const ViewInput = React.forwardRef((props,ref)=>{
  const { item,item_container_input,label } = styles;
  let inputView = useRef(null);
  const [text,setText] = useState('');
  useImperativeHandle(ref, () => ({
    getText: () => {
      return text;
    }
  }));

  return (
    <TextInput
      ref={inputView}
      placeholderTextColor={COLORS.colorGreyMedium}
      maxLength={200}
      labelStyle={label}
      onChangeText={(t) => setText(t)}
      underlineColorAndroid="transparent"
      inputStyle={styles.input}
      inputContainerStyle={item_container_input}
      containerStyle={item}
      placeholder="192.168.1.1:9334"
      label="IP address or domain"
      defaultValue={text}
      autoCapitalize="none"
      clearable
      ellipsizeMode="tail"
    />
  );
});
class AddSelfNode extends BaseScreen {

  constructor(props) {
    super(props);
    const {accountList = [],defaultAccountName= ''} = props;

    this.state = {
      accountList:accountList,
      loading:false,
      defaultAccountName:defaultAccountName,
      selectedAccount:undefined,
      isConnected: false,
      isShowListAccount:false
    };

    this.inputView = React.createRef();
    this.inputPort = '9334';
  }

  componentDidMount(){
    super.componentDidMount();
  }
  componentWillUnmount() {
    super.componentWillUnmount();
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if(!_.isEqual(nextProps?.accountList,prevState.accountList)){
      const { accountList = [] } = nextProps;
      return {
        accountList:accountList??[]
      };
    }
    return null;
  }

  validateHost = async (host)=> {
    if (host === 'localhost' || SHORT_DOMAIN_REGEX.test(host) || FULL_DOMAIN_REGEX.test(host) || IP_ADDRESS_REGEX.test(host)) {
      let isValid = true;
      if (IP_ADDRESS_REGEX.test(host)) {
        const parts = _.split(host, ':');
        const ip = parts[0];
        const ipParts = _.split(ip, '.');
        isValid = ipParts.every(item => {
          const number = _.toNumber(item);
          return number <= 255;
        });
      }

      if (isValid) {
        return isValid;
      }
    }

    throw new CustomError(ErrorCode.node_invalid_host);
  }

  async parseHost(host) {
    let port;
    let address;

    if (IP_ADDRESS_REGEX.test(host) || LOCALHOST_REGEX.test(host)) {
      const listLocalDevice = await LocalDatabase.getListDevices();
      const parts =  _.split(host,':')||[];
      address = _.trim(parts[0]);
      port = parts.length > 1 ?_.trim(parts[parts.length-1]):this.inputPort;
      port = !_.isEmpty(port) && _.isNumber(Number(port))?port:this.inputPort;
      const duplicatedNode = listLocalDevice.find(({ minerInfo }) => minerInfo.ipAddress === address && minerInfo.port === port);

      if (duplicatedNode) {
        throw new CustomError(ErrorCode.node_duplicate);
      }
    } else if (FULL_DOMAIN_REGEX.test(host) || SHORT_DOMAIN_REGEX.test(host)) {
      address = host;
      port = '';
    }

    const userJson = await LocalDatabase.getUserInfo();
    const user = userJson.toJSON();
    const {
      email,
      id,
      created_at,
    } = user;
    const deviceName =  address ;

    console.log('DeviceName', deviceName, address, port);

    const time = Date.now().toString();
    const account = {};
    return {
      minerInfo: {
        account: account,
        ipAddress: address,
        port: port
      },
      product_name: deviceName,
      created_from: Platform.OS,
      address: 'NewYork',
      address_long: 0.0,
      address_lat: 0.0,
      platform: CONSTANT_MINER.PRODUCT_TYPE,
      product_type: DEVICES.VIRTUAL_TYPE,
      timezone: getTimeZone(),
      user_id: id,
      email: email,
      id: id,
      product_id: `${DEVICES.VIRTUAL_TYPE}-${time}`,
      created_at: created_at,
      deleted: false,
      is_checkin: 1,
    };
  }

  handleSetUpPress = onClickView( async ()=>{
    this.setState({ loading: true });
    try {
      const userJson = await LocalDatabase.getUserInfo();
      const host = _.trim(this.inputView.current?.getText()).toLowerCase();

      console.log(TAG,'handleSetUpPress host = ',host);
      if (userJson && !_.isEmpty(host)) {
        await this.validateHost(host);
        let listLocalDevice = await LocalDatabase.getListDevices();
        // const isImportPrivateKey = _.isEmpty(selectedAccount?.PrivateKey);
        const deviceJSON = await this.parseHost(host);
        const device = Device.getInstance(deviceJSON);
        const newBLSKey  = await VirtualNodeService.getPublicKeyMining(device);
        if (newBLSKey) {
          device.PublicKeyMining = newBLSKey;
        }
        listLocalDevice = [device, ...listLocalDevice];
        this.setState({ loading: false });
        await LocalDatabase.saveListDevices(listLocalDevice);
        this.goToScreen(routeNames.Node, {
          refresh: new Date().getTime()
        });
        return true;
      }
    } catch (error) {
      new ExHandler(error,'Can\'t add virtual node').showErrorToast();
    } finally {
      this.setState({ loading: false });
    }
  });

  render() {
    const {loading} = this.state;
    return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <Loader loading={loading} />
        <KeyboardAvoidingView contentContainerStyle={{flex:1}} keyboardVerticalOffset={200} behavior="padding">
          <Header
            title="Node Virtual"
          />
          <ViewInput ref={this.inputView} />
          <RoundCornerButton
            style={[styles.button, theme.BUTTON.NODE_BUTTON]}
            onPress={this.handleSetUpPress}
            title='Add'
          />
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

AddSelfNode.propTypes = {
  wallet: PropTypes.objectOf(PropTypes.object),
  accountList: PropTypes.arrayOf(PropTypes.object),
  defaultAccountName:PropTypes.string
};
AddSelfNode.defaultProps = {
  accountList:[],
  defaultAccountName:''
};

const AddSelfNodeComponent = AddSelfNode;

export default withLayout_2(AddSelfNodeComponent);
