import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import Slider from './Slider';
import { COLOR, FONTS } from 'constants';

const SliderGasFee = ({
  label,
  gasFee,
  gasFeeUsd,
  onValuesChange,
  values,
  max,
  infoProps,
  sliderProps,
  isHiddenSlider,
  ...otherProps
}) => {
  const { style: infoStyle, ...otherInfoProps } = infoProps;

  return (
    <View {...otherProps}>
      <View style={[styles.infoWrapper, infoStyle]} {...otherInfoProps}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.price}>{gasFee}</Text>
        <Text style={styles.priceUsd}>({gasFeeUsd})</Text>
      </View>

      {!isHiddenSlider && (
        <Slider
          values={values}
          max={max}
          onValuesChange={onValuesChange}
          {...sliderProps}
        />
      )}
    </View>
  );
};

SliderGasFee.propTypes = {
  label: PropTypes.string,
  gasFee: PropTypes.string,
  gasFeeUsd: PropTypes.string,
  onValuesChange: PropTypes.func,
  values: PropTypes.array,
  max: PropTypes.number,
  infoProps: PropTypes.shape({
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }),
  sliderProps: PropTypes.object,
  isHiddenSlider: PropTypes.bool,
};

SliderGasFee.defaultProps = {
  infoProps: { style: {} },
};

const styles = StyleSheet.create({
  infoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    color: COLOR.white,
    ...FONTS.t14r,
    flex: 1,
  },
  price: {
    color: COLOR.white,
    ...FONTS.t16r,
    marginRight: 2,
  },
  priceUsd: {
    color: COLOR.textSecondary,
    ...FONTS.t14r,
  },
});

export default SliderGasFee;
