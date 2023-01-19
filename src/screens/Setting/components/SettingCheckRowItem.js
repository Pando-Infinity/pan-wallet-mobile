import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONTS, ICONS } from 'constants';

const SettingCheckRowItem = ({
  isChecked,
  style,
  label,
  description,
  ...otherProps
}) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.wrapper(isChecked), style]}
      {...otherProps}>
      {isChecked && <Image source={ICONS.checkIcon} style={styles.checkIcon} />}
      <View>
        <Text style={styles.label}>{label}</Text>
        {Boolean(description) && <Text style={styles.desc}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};

SettingCheckRowItem.propTypes = {
  isChecked: PropTypes.bool,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  textValue: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

SettingCheckRowItem.defaultProps = {};

const styles = StyleSheet.create({
  wrapper: isChecked => ({
    minHeight: 56,
    backgroundColor: COLOR.neutralSurface2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
    paddingLeft: isChecked ? 8 : 40,
  }),
  label: {
    ...FONTS.t14b,
    color: COLOR.white,
  },
  desc: {
    ...FONTS.t12r,
    color: COLOR.textSecondary,
    marginTop: 4,
  },
  checkIcon: {
    marginRight: 8,
  },
});

export default memo(SettingCheckRowItem);
