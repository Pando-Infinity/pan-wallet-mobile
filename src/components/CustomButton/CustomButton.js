import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLOR, FONTS, SIZES } from '../../constants';

const CustomButton = ({
  onPress = () => {},
  isDisable,
  label,
  icon,
  width,
  height,
  styles,
  labelProps,
}) => {
  const { style: labelStyle, ...otherLabelProps } = labelProps;

  if (!isDisable) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          {
            width: width,
            height: height,
            backgroundColor: COLOR.actionDisabled,
            borderRadius: SIZES.radius,
          },
          styles,
        ]}>
        {
          <LinearGradient
            style={style.container}
            colors={COLOR.buttonColors}
            locations={[0, 0, 0.54, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}>
            <Text
              style={[{ color: COLOR.gray10, ...FONTS.t16b }, labelStyle]}
              {...otherLabelProps}>
              {label}
            </Text>
            {icon && <Image source={icon} style={style.imageStyle} />}
          </LinearGradient>
        }
      </TouchableOpacity>
    );
  } else {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[
          {
            width: width,
            height: height,
            backgroundColor: COLOR.actionDisabled,
            borderRadius: SIZES.radius,
          },
          styles,
        ]}>
        <View style={style.container}>
          <Text style={{ color: COLOR.textDisable, ...FONTS.t16b }}>
            {label}
          </Text>
          {icon && (
            <Image
              source={icon}
              style={{ tintColor: COLOR.textDisable, ...style.imageStyle }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }
};

CustomButton.propTypes = {
  onPress: PropTypes.func,
  isDisable: PropTypes.bool,
  label: PropTypes.string,
  icon: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  styles: PropTypes.object,
  labelProps: PropTypes.shape({
    style: PropTypes.object,
  }),
};

CustomButton.defaultProps = {
  labelProps: { style: {} },
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
  },
  imageStyle: {
    width: SIZES.iconSize,
    height: SIZES.iconSize,
    marginLeft: SIZES.spaceButton,
  },
});

export default CustomButton;
