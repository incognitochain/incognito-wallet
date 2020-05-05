import {handleHomeDeepLinking, handleRouteDeeplinking, handleSendDeepLinking} from './handlers';

export default [
  {
    name: 'incognito:',
    routes: [
      {
        expression: '/home/',
        callback: handleHomeDeepLinking,
      },
      {
        // expression: '/profile/:routeKey', // any route will be added, lay on backend support
        callback: handleRouteDeeplinking,
      },
      {
        expression: '/send/:address', // Might be amount/address params nested
        callback: handleSendDeepLinking,
      }
    ],
  },
];
