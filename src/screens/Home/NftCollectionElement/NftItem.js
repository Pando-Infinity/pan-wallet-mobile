import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONTS, SIZES } from 'constants';
import { CustomImage } from 'components/common';

const NftItem = ({
  name,
  image,
  description,
  value,
  style,
  valueProps,
  ...otherProps
}) => {
  const { style: valueStyle, ...otherValueProps } = valueProps;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.wrapper, style]}
      {...otherProps}>
      <CustomImage imageUrl={image} style={styles.image} />
      <View style={styles.infoWrapper}>
        <Text style={styles.name}>{name}</Text>
        {description ? (
          <Text style={styles.desc} numberOfLines={1}>
            {description}
          </Text>
        ) : (
          <></>
        )}
      </View>
      {Boolean(value) && (
        <View style={styles.topValueWrapper}>
          <Text style={[styles.value, valueStyle]} {...otherValueProps}>
            {value ?? 0}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

NftItem.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  style: PropTypes.object,
  valueProps: PropTypes.shape({
    style: PropTypes.object,
  }),
  isHiddenDescription: PropTypes.bool,
};

NftItem.defaultProps = {
  item: {},
  valueProps: { style: {} },
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  image: {
    height: 148,
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  infoWrapper: {
    padding: SIZES.simpleSpace,
    backgroundColor: COLOR.gray3,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  name: {
    color: COLOR.white,
    ...FONTS.t12b,
    fontWeight: '700',
  },
  desc: {
    marginTop: 2,
    marginBottom: 4,
    color: COLOR.textSecondary,
    ...FONTS.t11r,
  },
  topValueWrapper: {
    height: 24,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLOR.gray3,
    paddingHorizontal: 4,
  },
  value: {
    color: COLOR.white,
    ...FONTS.t11r,
  },
});

export default NftItem;
