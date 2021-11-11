import React from 'react';
import Svg, { Path } from 'react-native-svg';
import {View} from 'react-native';
import PropTypes from 'prop-types';

const SelectMore = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12 1C9.8244 1 7.69766 1.64514 5.88872 2.85383C4.07978 4.06253 2.66989 5.78049 1.83732 7.79048C1.00476 9.80047 0.786922 12.0122 1.21136 14.146C1.6358 16.2798 2.68344 18.2398 4.22182 19.7782C5.7602 21.3165 7.72021 22.3642 9.854 22.7886C11.9878 23.2131 14.1995 22.9952 16.2095 22.1627C18.2195 21.3301 19.9375 19.9202 21.1462 18.1113C22.3549 16.3023 23 14.1756 23 12C23 9.08262 21.8411 6.28472 19.7782 4.22182C17.7153 2.15892 14.9174 1 12 1V1ZM12 20.25C10.3683 20.25 8.77325 19.7661 7.41654 18.8596C6.05984 17.9531 5.00241 16.6646 4.37799 15.1571C3.75357 13.6496 3.59019 11.9908 3.90852 10.3905C4.22685 8.79016 5.01258 7.32015 6.16637 6.16637C7.32015 5.01258 8.79016 4.22685 10.3905 3.90852C11.9908 3.59019 13.6496 3.75357 15.1571 4.37799C16.6646 5.00242 17.9531 6.05984 18.8596 7.41654C19.7661 8.77325 20.25 10.3683 20.25 12C20.25 14.188 19.3808 16.2865 17.8336 17.8336C16.2865 19.3808 14.188 20.25 12 20.25V20.25Z"
      fill="#FFC726"
    />
    <Path
      d="M16.8125 10.6891H13.54C13.4792 10.6891 13.4209 10.6649 13.378 10.622C13.335 10.579 13.3108 10.5207 13.3108 10.4599V7.18742C13.3111 6.95204 13.2209 6.72557 13.0588 6.55492C12.8966 6.38427 12.6751 6.28252 12.44 6.27075H11.5233C11.2883 6.28252 11.0667 6.38427 10.9046 6.55492C10.7425 6.72557 10.6522 6.95204 10.6525 7.18742V10.4599C10.6525 10.5207 10.6284 10.579 10.5854 10.622C10.5424 10.6649 10.4841 10.6891 10.4233 10.6891H7.1875C6.95212 10.6888 6.72565 10.7791 6.555 10.9412C6.38435 11.1033 6.2826 11.3248 6.27084 11.5599V12.4766C6.2826 12.7117 6.38435 12.9332 6.555 13.0953C6.72565 13.2575 6.95212 13.3477 7.1875 13.3474H10.46C10.5208 13.3474 10.5791 13.3716 10.622 13.4145C10.665 13.4575 10.6892 13.5158 10.6892 13.5766V16.8491C10.7003 17.0765 10.7956 17.2916 10.9566 17.4525C11.1175 17.6135 11.3326 17.7088 11.56 17.7199H12.4767C12.704 17.7088 12.9191 17.6135 13.0801 17.4525C13.2411 17.2916 13.3364 17.0765 13.3475 16.8491V13.5399C13.3475 13.4791 13.3716 13.4208 13.4146 13.3779C13.4576 13.3349 13.5159 13.3108 13.5767 13.3108H16.8492C17.0765 13.2996 17.2916 13.2043 17.4526 13.0434C17.6136 12.8824 17.7089 12.6673 17.72 12.4399V11.5233C17.6995 11.2963 17.5952 11.0851 17.4274 10.9309C17.2596 10.7766 17.0404 10.6904 16.8125 10.6891V10.6891Z"
      fill="#4C8BF5"
    />
  </Svg>
);


const UnSelectMore = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12 1C9.8244 1 7.69766 1.64514 5.88872 2.85383C4.07978 4.06253 2.66989 5.78049 1.83732 7.79048C1.00476 9.80047 0.786922 12.0122 1.21136 14.146C1.6358 16.2798 2.68344 18.2398 4.22182 19.7782C5.7602 21.3165 7.72021 22.3642 9.854 22.7886C11.9878 23.2131 14.1995 22.9952 16.2095 22.1627C18.2195 21.3301 19.9375 19.9202 21.1462 18.1113C22.3549 16.3023 23 14.1756 23 12C23 9.08262 21.8411 6.28472 19.7782 4.22182C17.7153 2.15892 14.9174 1 12 1V1ZM12 20.25C10.3683 20.25 8.77325 19.7661 7.41654 18.8596C6.05984 17.9531 5.00241 16.6646 4.37799 15.1571C3.75357 13.6496 3.59019 11.9908 3.90852 10.3905C4.22685 8.79016 5.01258 7.32015 6.16637 6.16637C7.32015 5.01258 8.79016 4.22685 10.3905 3.90852C11.9908 3.59019 13.6496 3.75357 15.1571 4.37799C16.6646 5.00242 17.9531 6.05984 18.8596 7.41654C19.7661 8.77325 20.25 10.3683 20.25 12C20.25 14.188 19.3808 16.2865 17.8336 17.8336C16.2865 19.3808 14.188 20.25 12 20.25V20.25Z"
      fill="#DDDDDD"
    />
    <Path
      d="M16.8125 10.6891H13.54C13.4792 10.6891 13.4209 10.6649 13.378 10.622C13.335 10.579 13.3108 10.5207 13.3108 10.4599V7.18742C13.3111 6.95204 13.2209 6.72557 13.0588 6.55492C12.8966 6.38427 12.6751 6.28252 12.44 6.27075H11.5233C11.2883 6.28252 11.0667 6.38427 10.9046 6.55492C10.7425 6.72557 10.6522 6.95204 10.6525 7.18742V10.4599C10.6525 10.5207 10.6284 10.579 10.5854 10.622C10.5424 10.6649 10.4841 10.6891 10.4233 10.6891H7.1875C6.95212 10.6888 6.72565 10.7791 6.555 10.9412C6.38435 11.1033 6.2826 11.3248 6.27084 11.5599V12.4766C6.2826 12.7117 6.38435 12.9332 6.555 13.0953C6.72565 13.2575 6.95212 13.3477 7.1875 13.3474H10.46C10.5208 13.3474 10.5791 13.3716 10.622 13.4145C10.665 13.4575 10.6892 13.5158 10.6892 13.5766V16.8491C10.7003 17.0765 10.7956 17.2916 10.9566 17.4525C11.1175 17.6135 11.3326 17.7088 11.56 17.7199H12.4767C12.704 17.7088 12.9191 17.6135 13.0801 17.4525C13.2411 17.2916 13.3364 17.0765 13.3475 16.8491V13.5399C13.3475 13.4791 13.3716 13.4208 13.4146 13.3779C13.4576 13.3349 13.5159 13.3108 13.5767 13.3108H16.8492C17.0765 13.2996 17.2916 13.2043 17.4526 13.0434C17.6136 12.8824 17.7089 12.6673 17.72 12.4399V11.5233C17.6995 11.2963 17.5952 11.0851 17.4274 10.9309C17.2596 10.7766 17.0404 10.6904 16.8125 10.6891V10.6891Z"
      fill="#9C9C9C"
    />
  </Svg>
);

const MoreIcon = React.memo(({ style, active }) => (
  <View style={style}>
    {active ? <SelectMore /> : <UnSelectMore />}
  </View>
));

MoreIcon.defaultProps = {
  style: null,
  active: false
};

MoreIcon.propTypes = {
  style: PropTypes.any,
  active: PropTypes.bool
};

export default MoreIcon;
