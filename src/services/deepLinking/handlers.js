/**
 * UraNashel
 * tan@incognito.com
 */
import NavigationService from '@src/services/NavigationService';
import RouteKeys from '../../router/routeNames';

// This will helpful for only with param more
// This will go to Home, default route of app, and do a lot steps if needed
export const handleHomeDeepLinking = ({params: {hash}}) => () => {
  try {
    NavigationService.navigate(RouteKeys.Home, {
      code: hash
    });
  } catch (error) {
    console.log(error);
  }
};

// This will helpful for only route
// This will be added more screens after that if needed.
// For now, no need to config here.
export const handleRouteDeeplinking = ({params: {routeKey}}) => () => {
  try {
    switch (routeKey) {
    case RouteKeys.Profile: {
      NavigationService.navigate(RouteKeys.Profile);
      break;
    }
    case RouteKeys.Home: {
      NavigationService.navigate(RouteKeys.Home);
      break;
    }
    case RouteKeys.Wallet: {
      NavigationService.navigate(RouteKeys.Wallet);
      break;
    }
    case RouteKeys.Community: {
      NavigationService.navigate(RouteKeys.Community);
      break;
    }
    case RouteKeys.Node: {
      NavigationService.navigate(RouteKeys.Node);
      break;
    }
    default:
      return NavigationService.navigate(RouteKeys.Home);
    }
  } catch (error) {
    console.log(error);
  }
};

// Only for send
// For specified case, it should be a navigator separately
// Params might be address, amount....
export const handleSendDeepLinking = ({params: {paramId}}) => () => {
  try {
    NavigationService.navigate(RouteKeys.SendCrypto, {
      paramId: paramId,
      data: {}
    });
  } catch (error) {
    console.log(error);
  }
};