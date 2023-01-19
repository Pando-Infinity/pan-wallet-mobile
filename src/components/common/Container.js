import React from 'react';
import PropTypes from 'prop-types';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { IMAGES } from 'constants';

const Container = ({ children, style, childrenProps }) => {
  const { style: containerStyle } = childrenProps;

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={[styles.backgroundImage, style]}
        resizeMode="cover">
        <View style={[styles.container, containerStyle]}>{children}</View>
      </ImageBackground>
    </View>
  );
};

Container.propTypes = {
  childrenProps: PropTypes.object,
  style: PropTypes.object,
  children: PropTypes.node,
};

Container.defaultProps = {
  childrenProps: {},
  style: {},
};

export default Container;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 56,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'space-between',
  },
});
