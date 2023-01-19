import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, FONTS } from 'constants';

const RowSpaceBetweenItem = ({
  label,
  value,
  style,
  labelStyle,
  valueStyle,
  icon,
  ...otherProps
}) => {
  return (
    <View style={[styles.item, style]} {...otherProps}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {icon}
      </View>
      <Text style={[styles.value, valueStyle]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

RowSpaceBetweenItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
  style: PropTypes.object,
  labelStyle: PropTypes.object,
  valueStyle: PropTypes.object,
  icon: PropTypes.node,
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: COLOR.textSecondary,
    ...FONTS.t14r,
  },
  value: {
    color: COLOR.white,
    ...FONTS.t16r,
  },
});

export default RowSpaceBetweenItem;
