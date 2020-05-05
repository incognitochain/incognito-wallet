/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable import/no-extraneous-dependencies */
import React, {Component} from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import PropTypes from 'prop-types';
import {Linking} from 'react-native';
import NavigationService from '@src/services/NavigationService';
import {isFunction, getDisplayName} from './utils';
import RouteKeys from '../../router/routeNames';

const withDeepLinking = deepLinkingHandler => WrappedComponent => {
  class WithDeepLinking extends Component {
    static propTypes = {
    	onGetInitialUrlError: PropTypes.func,
    	onCanOpenUrlError: PropTypes.func,
    	onUrlIsNotSupported: PropTypes.func,
    	onCannotHandleUrl: PropTypes.func,
    	appStore: PropTypes.object,
    	setDeepLink: PropTypes.func,
    };

    static defaultProps = {
    	onGetInitialUrlError: () => {},
    	onCanOpenUrlError: () => {},
    	onUrlIsNotSupported: () => {},
    	onCannotHandleUrl: () => {},
    	setDeepLink: () => {},
    };

    static displayName = `WithDeepLinking(${getDisplayName(WrappedComponent)})`;

    componentDidMount() {
    	const {onGetInitialUrlError} = this.props;

    	Linking.getInitialURL()
    		.then(url => this.handleURL(url))
    		.catch(err => onGetInitialUrlError(err));

    	Linking.addEventListener('url', this.handleURLReceive);
    }

    componentWillUnmount() {
    	Linking.removeEventListener('url', this.handleURLReceive);
    }

    get filteredProps() {
    	const {onGetInitialUrlError,
    		onCanOpenUrlError,
    		onUrlIsNotSupported,
    		onCannotHandleUrl,
    		...rest} = this.props;

    	return rest;
    }

    handleURLReceive = event => {
    	this.handleURL(event.url);
    };

    handleURL = url => {
    	if (!url) {
    		return;
    	}
    	const {onCanOpenUrlError,
    		onUrlIsNotSupported,
    		onCannotHandleUrl} = this.props;
    	Linking.canOpenURL(url)
    		.then(supported => {
    			if (!supported) {
    				return onUrlIsNotSupported(url);
    			}
    			const callback = deepLinkingHandler.getUrlCallback(url);
    			if (!isFunction(callback)) {
    				return onCannotHandleUrl(url);
    			}

    			callback(this.filteredProps);
    		})
    		.catch(err => onCanOpenUrlError(err));
    };

    render() {
    	return (
      		<WrappedComponent {...this.filteredProps} deepLinkingHandler={deepLinkingHandler} />
    	);
    }
  }

  return hoistNonReactStatics(WithDeepLinking, WrappedComponent);
};

export default withDeepLinking;
