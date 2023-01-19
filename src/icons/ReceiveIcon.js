import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import PropTypes from 'prop-types';

const ReceiveIcon = ({ height, width, color, ...otherProps }) => {
  return (
    <Svg height={height} width={width} {...otherProps}>
      <Circle cx="20" cy="20" r="20" fill="#CDE8FF" fillOpacity="0.2" />
      <Path
        d="M26 22V24.6667C26 25.0203 25.8595 25.3594 25.6095 25.6095C25.3594 25.8595 25.0203 26 24.6667 26H15.3333C14.9797 26 14.6406 25.8595 14.3905 25.6095C14.1405 25.3594 14 25.0203 14 24.6667V22"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.6667 18.667L20 22.0003L23.3334 18.667"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 22V14"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

ReceiveIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};

ReceiveIcon.defaultProps = {
  color: '#65B6FC',
  width: 40,
  height: 40,
};

export default ReceiveIcon;
