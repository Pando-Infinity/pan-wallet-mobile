import React from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import PropTypes from 'prop-types';

const SendIcon = ({ height, width, color, ...otherProps }) => {
  return (
    <Svg height={height} width={width} {...otherProps}>
      <Circle cx="20" cy="20" r="20" fill="#C3FFDE" fillOpacity="0.2" />
      <G clipPath="url(#clip0_15275_53524)">
        <Path
          d="M23.3333 12.667L26 15.3337L23.3333 18.0003"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14 19.333V17.9997C14 17.2924 14.281 16.6142 14.781 16.1141C15.2811 15.614 15.9594 15.333 16.6667 15.333H26"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M16.6667 27.3333L14 24.6667L16.6667 22"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M26 20.667V22.0003C26 22.7076 25.719 23.3858 25.219 23.8859C24.7189 24.386 24.0406 24.667 23.3333 24.667H14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_15275_53524">
          <Rect
            width="16"
            height="16"
            fill="white"
            transform="translate(12 12)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

SendIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};

SendIcon.defaultProps = {
  color: '#61CA91',
  width: 40,
  height: 40,
};

export default SendIcon;
