import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLOR, FONTS, SIZES } from 'constants';
import { compactAddress, getChainIcon } from 'utils/util';

const WalletInfo = ({ currentAddressInfo }) => {
  const [walletName, address, icon] = useMemo(() => {
    const formatAddress = compactAddress(currentAddressInfo.address);
    const imageIcon = getChainIcon(currentAddressInfo.chain);
    return [currentAddressInfo.name, formatAddress, imageIcon];
  }, [currentAddressInfo]);

  return (
    <View style={styles.root}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Image source={icon} style={styles.coinImage} />
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.walletName}>{walletName}</Text>
          <Text style={styles.address}>{address}</Text>
        </View>
      </View>
    </View>
  );
};

WalletInfo.propTypes = {
  addressList: PropTypes.array,
  sheetRef: PropTypes.object,
  onOpenModal: PropTypes.func,
  currentAddressInfo: PropTypes.object,
};

WalletInfo.defaultProps = {
  addressList: [],
  currentAddressInfo: {},
};

export default WalletInfo;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: SIZES.simpleHeightTextField,
    backgroundColor: COLOR.neutralSurface2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 12,
    marginTop: 16,
    marginBottom: 30,
  },
  walletName: {
    ...FONTS.t14b,
    color: COLOR.white,
  },
  coinImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  address: {
    ...FONTS.t12r,
    color: COLOR.textSecondary,
  },
});
