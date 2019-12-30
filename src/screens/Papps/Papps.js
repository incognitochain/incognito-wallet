import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Container, Button, View, ScrollView, TextInput } from '@src/components/core';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import routeNames from '@src/router/routeNames';
import { COLORS } from '@src/styles';
// import rollDiceImg from '@src/assets/images/papp/diceroll.png';
import helloWorldImg from '@src/assets/images/papp/helloworld.png';
import PappItem from './PappItem';
import styles from './style';

const PAPPS = [
  {
    id: 1,
    name: 'Hello World',
    image: helloWorldImg,
    url: 'http://35.185.237.133/',
    title: 'Hello World',
    desc: 'This is a demonstration of a basic pApp'
  },
  // {
  //   id: 1,
  //   name: 'Get crypto rich',
  //   image: rollDiceImg,
  //   url: 'https://enigmatic-sea-09447.herokuapp.com/',
  //   title: 'Get crypto rich',
  //   desc: 'Predict the outcome,  shake the dice, win the crypto.'
  // }
];

class Papps extends PureComponent {
  constructor() {
    super();
    this.state = {
      url: 'http://192.168.1.180:3000',
    };
  }

  urlValidator = (url) => {
    // eslint-disable-next-line
    if (!url) throw new CustomError(ErrorCode.paaps_invalid_daap_url);
    return true;
  }

  onGo = (pApp = {}) => {
    try {
      const { url } = this.state;
      const { name, url: pappUrl } = pApp;
      const _url = pappUrl || url;

      if (this.urlValidator(_url)) {
        const { navigation } = this.props;
        navigation.navigate(routeNames.pApp, { url: _url, appName: name ?? _url });
      }
    } catch (e) {
      new ExHandler(e, 'Sorry, we can not open this Papp.').showErrorToast();
    }
  }

  onChangeUrl = url => {
    this.setState({ url }); 
  }

  handleAddProtocol = () => {
    this.setState(({ url }) => {
      return { url: url ? url : 'http://' };
    }); 
  }

  render() {
    const { url } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <TextInput
            autoCapitalize='none'
            placeholder='Search or enter website URL'
            placeholderTextColor={COLORS.lightGrey4}
            style={styles.input}
            inputStyle={{ color: COLORS.white }}
            value={url}
            onChangeText={this.onChangeUrl}
            onFocus={this.handleAddProtocol}
          />
          <Button title='GO' style={styles.submitBtn} onPress={this.onGo} />
        </View>
        <ScrollView contentContainerStyle={{ minHeight: '100%' }}>
          <Container style={styles.content}>
            {
              PAPPS.map(({ id, image, desc, name, url, title }) => (
                <PappItem
                  style={styles.pappItem}
                  key={id}
                  image={image}
                  title={title}
                  desc={desc}
                  url={url}
                  name={name}
                  onPress={() => this.onGo({ id, image, desc, name, url, title })}
                />
              ))
            }
          </Container>
        </ScrollView>
      </View>
    );
  }
}

Papps.propTypes = {
  navigation: PropTypes.object.isRequired
};

export default Papps;