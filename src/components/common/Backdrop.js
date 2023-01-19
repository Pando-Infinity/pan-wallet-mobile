import React from 'react';
import PropTypes from 'prop-types';
import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { COLOR } from '../../constants';

const Backdrop = ({ open }) => {
  return open ? (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: COLOR.blackOpacity04 },
      ]}
    />
  ) : (
    <></>
  );
};

Backdrop.propTypes = {
  open: PropTypes.bool,
};

export default Backdrop;
