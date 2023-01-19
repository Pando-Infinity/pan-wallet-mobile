import React from 'react';
import Svg, { Path } from 'react-native-svg';
import PropTypes from 'prop-types';

const SendIcon = ({ height, width, color, ...otherProps }) => {
  return (
    <Svg height={height} width={width} {...otherProps}>
      <Path
        d="M40 20C40 31.0457 31.0457 40 20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20Z"
        fill="#D4D6FF"
        fillOpacity="0.2"
      />
      <Path
        d="M26 22V24.6667C26 25.0203 25.8595 25.3594 25.6095 25.6095C25.3594 25.8595 25.0203 26 24.6667 26H15.3333C14.9797 26 14.6406 25.8595 14.3905 25.6095C14.1405 25.3594 14 25.0203 14 24.6667V22"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M23.3334 17.3333L20 14L16.6667 17.3333"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 14V22"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

SendIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};

SendIcon.defaultProps = {
  color: '#CAAEF9',
  width: 40,
  height: 40,
};

export default SendIcon;
