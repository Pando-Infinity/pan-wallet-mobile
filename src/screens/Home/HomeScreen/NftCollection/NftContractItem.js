import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONTS, IMAGES, TOKEN_NAME } from 'constants';
import { CustomImage } from 'components/common';

const NftContractItem = ({
  name,
  image,
  networkName,
  quantity,
  style,
  quantityStyle,
  ...otherProps
}) => {
  const networkIcon = useMemo(() => {
    switch (networkName) {
      case TOKEN_NAME.ethereum:
        return IMAGES.eth_icon;
      case TOKEN_NAME.smartChain:
        return IMAGES.bsc_icon;
      case TOKEN_NAME.solana:
        return IMAGES.sol_icon;
      default:
        return [];
    }
  }, [networkName]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.wrapper, style]}
      {...otherProps}>
      <CustomImage imageUrl={image} style={styles.image} />
      <View style={styles.infoWrapper}>
        {Boolean(networkIcon) && (
          <Image source={networkIcon} style={styles.icon} />
        )}
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      {Boolean(quantity) && (
        <View style={styles.quantityWrapper}>
          <Text style={[styles.quantity, quantityStyle]}>{quantity}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

NftContractItem.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  networkName: PropTypes.oneOf(Object.values(TOKEN_NAME)),
  quantity: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  quantityStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

NftContractItem.defaultProps = {};

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
    padding: 6,
    backgroundColor: COLOR.gray3,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: COLOR.white,
    ...FONTS.t14b,
    fontWeight: '700',
    maxWidth: '90%',
  },
  icon: {
    height: 24,
    width: 24,
    marginRight: 6,
  },
  quantityWrapper: {
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
  quantity: {
    color: COLOR.white,
    ...FONTS.t14r,
  },
});

export default NftContractItem;
