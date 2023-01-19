import React, { memo } from 'react';
import PropTypes from 'prop-types';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { StyleSheet } from 'react-native';
import { SIZES, COLOR } from 'constants';

const Slider = ({ min, onValuesChange, ...otherProps }) => {
  return (
    <MultiSlider
      min={min}
      snapped
      allowOverlap
      markerStyle={styles.marker}
      selectedStyle={styles.selected}
      unselectedStyle={styles.unselected}
      sliderLength={SIZES.width - SIZES.simpleMargin * 3}
      onValuesChange={onValuesChange}
      {...otherProps}
    />
  );
};

Slider.propTypes = {
  min: PropTypes.number,
  onValuesChange: PropTypes.func,
};

Slider.defaultProps = {
  min: 0,
};

const styles = StyleSheet.create({
  marker: {
    backgroundColor: COLOR.actionMain1,
    borderColor: COLOR.actionMain1,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  selected: {
    backgroundColor: COLOR.shade10,
  },
  unselected: {
    backgroundColor: COLOR.shade10,
  },
});

export default memo(Slider);
