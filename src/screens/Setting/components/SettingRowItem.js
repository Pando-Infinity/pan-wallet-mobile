import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONTS, ICONS } from 'constants';
import { Image } from 'react-native';

const SettingRowItem = ({
  style,
  label,
  description,
  textValue,
  ...otherProps
}) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.wrapper, style]}
      {...otherProps}>
      <View>
        <Text style={styles.label}>{label}</Text>
        {Boolean(description) && <Text style={styles.desc}>{description}</Text>}
      </View>

      <View style={styles.rightWrapper}>
        <Text numberOfLines={1} style={styles.textValue}>
          {textValue}
        </Text>
        <Image source={ICONS.rightButton} height={24} width={24} />
      </View>
    </TouchableOpacity>
  );
};

SettingRowItem.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  textValue: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

SettingRowItem.defaultProps = {};

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 56,
    backgroundColor: COLOR.neutralSurface2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingRight: 16,
    paddingLeft: 24,
  },
  rightWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  label: {
    ...FONTS.t14b,
    color: COLOR.white,
  },
  desc: {
    ...FONTS.t12r,
    color: COLOR.textSecondary,
    marginTop: 4,
  },
  textValue: {
    ...FONTS.t16r,
    textAlign: 'right',
    color: COLOR.white,
    marginRight: 12,
  },
});

export default memo(SettingRowItem);
