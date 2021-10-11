import React from 'react';
import Svg, { Path } from 'react-native-svg';
import {TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';

const SVGComponent = ({ color, size }) => (
  <Svg
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    fill="none"
  >
    <Path
      d="M18.0364 21H8.15426C7.85215 21 7.56241 20.8799 7.34878 20.6663C7.13515 20.4527 7.01514 20.1629 7.01514 19.8608C7.01514 19.5587 7.13515 19.269 7.34878 19.0553C7.56241 18.8417 7.85215 18.7217 8.15426 18.7217H18.0364C18.218 18.7212 18.392 18.6489 18.5205 18.5205C18.6489 18.392 18.7212 18.218 18.7217 18.0364V8.15426C18.7217 7.85215 18.8417 7.56241 19.0553 7.34878C19.269 7.13515 19.5587 7.01514 19.8608 7.01514C20.1629 7.01514 20.4527 7.13515 20.6663 7.34878C20.8799 7.56241 21 7.85215 21 8.15426V18.0364C20.9985 18.8219 20.6858 19.5749 20.1304 20.1304C19.5749 20.6858 18.8219 20.9985 18.0364 21Z"
      fill={color}
    />
    <Path
      d="M13.9356 3H5.7339C5.00883 3 4.31345 3.28804 3.80074 3.80074C3.28804 4.31345 3 5.00883 3 5.7339V13.9356C3 14.6607 3.28804 15.3561 3.80074 15.8688C4.31345 16.3815 5.00883 16.6695 5.7339 16.6695H13.9356C14.6607 16.6695 15.3561 16.3815 15.8688 15.8688C16.3815 15.3561 16.6695 14.6607 16.6695 13.9356V5.7339C16.6695 5.00883 16.3815 4.31345 15.8688 3.80074C15.3561 3.28804 14.6607 3 13.9356 3ZM13.0243 10.9757H10.9757V13.0243C10.9757 13.3264 10.8557 13.6162 10.6421 13.8298C10.4284 14.0434 10.1387 14.1634 9.83658 14.1634C9.53446 14.1634 9.24472 14.0434 9.03109 13.8298C8.81747 13.6162 8.69745 13.3264 8.69745 13.0243V10.9757H6.6452C6.34309 10.9757 6.05335 10.8557 5.83972 10.6421C5.62609 10.4284 5.50608 10.1387 5.50608 9.83658C5.50608 9.53446 5.62609 9.24472 5.83972 9.03109C6.05335 8.81747 6.34309 8.69745 6.6452 8.69745H8.69745V6.6452C8.69745 6.34309 8.81747 6.05335 9.03109 5.83972C9.24472 5.62609 9.53446 5.50608 9.83658 5.50608C10.1387 5.50608 10.4284 5.62609 10.6421 5.83972C10.8557 6.05335 10.9757 6.34309 10.9757 6.6452V8.69745H13.0243C13.3264 8.69745 13.6162 8.81747 13.8298 9.03109C14.0434 9.24472 14.1634 9.53446 14.1634 9.83658C14.1634 10.1387 14.0434 10.4284 13.8298 10.6421C13.6162 10.8557 13.3264 10.9757 13.0243 10.9757Z"
      fill={color}
    />
  </Svg>
);

const AddGroupIcon = React.memo(({ onPress, color, size }) => {
  return (
    <TouchableOpacity onPress={() => typeof onPress === 'function' && onPress()}>
      <SVGComponent color={color} size={size} />
    </TouchableOpacity>
  );
});

SVGComponent.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired
};

AddGroupIcon.defaultProps = {
  color: '#5995F0',
  size: 24,
};

AddGroupIcon.propTypes = {
  onPress: PropTypes.func.isRequired,
  color: PropTypes.string,
  size: PropTypes.number
};

export default AddGroupIcon;
