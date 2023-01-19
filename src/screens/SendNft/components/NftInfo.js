import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import { COLOR, FONTS } from 'constants';
import { CustomImage } from 'components/common';

const NftInfo = ({
  imageSrc,
  nftId,
  price,
  priceUsd,
  symbol,
  ...otherProps
}) => {
  return (
    <View style={styles.wrapper} {...otherProps}>
      <View style={styles.imageWrapper}>
        <CustomImage imageUrl={imageSrc} style={styles.image} />
        {Boolean(nftId) && (
          <View style={styles.idWrapper}>
            <Text style={styles.id}>{nftId}</Text>
          </View>
        )}
      </View>
      {Boolean(price) && (
        <Text style={styles.price}>{`${price} ${symbol}`}</Text>
      )}
      {Boolean(priceUsd) && (
        <Text style={styles.priceUsd}>{`~ ${priceUsd}`}</Text>
      )}
    </View>
  );
};

NftInfo.propTypes = {
  imageSrc: PropTypes.string,
  nftId: PropTypes.string,
  price: PropTypes.number,
  priceUsd: PropTypes.string,
  symbol: PropTypes.string,
};

NftInfo.defaultProps = {
  price: 0,
  priceUsd: 0,
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 176,
    height: 158,
  },
  price: {
    color: COLOR.white,
    ...FONTS.t30b,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  priceUsd: {
    color: COLOR.textSecondary,
    ...FONTS.t16r,
    textAlign: 'center',
  },
  idWrapper: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLOR.gray3,
    borderRadius: 12,
    padding: 4,
  },
  id: {
    color: COLOR.white,
    ...FONTS.t11r,
  },
});

export default NftInfo;
