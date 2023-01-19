import React from 'react';
import {StyleSheet, View, Animated} from 'react-native';
import {APP_THEMES} from '../../constants';
const {COLOR, SIZES} = APP_THEMES;

const Paginator = ({data, scrollX}) => {
  const width = SIZES.width;
  const indicatorSize = 10;
  const indicatorActiveSize = 32;
  const opacityDefault = 0.4;
  const opacityActive = 1;
  return (
    <View style={style.container}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [indicatorSize, indicatorActiveSize, indicatorSize],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [opacityDefault, opacityActive, opacityDefault],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            style={[style.dot, {width: dotWidth, opacity}]}
            key={i.toString()}
          />
        );
      })}
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLOR.pageControlIndicatorColor,
    marginHorizontal: 8,
  },
});

export default Paginator;
