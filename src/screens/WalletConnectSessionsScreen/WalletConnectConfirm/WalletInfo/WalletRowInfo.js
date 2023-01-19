import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLOR, FONTS, TOKEN_SYMBOL } from 'constants';
import { compactAddress, getChainIcon } from 'utils/util';

const WalletRowInfo = ({ onPress, chain, address, name }) => {
  const icon = useMemo(() => getChainIcon(chain), [chain]);

  return (
    <TouchableOpacity style={styles.root} onPress={onPress}>
      <Image source={icon} style={styles.icon} />
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.walletName}>{name}</Text>
          <Text style={styles.address}>{compactAddress(address)}</Text>
        </View>
        <Text style={styles.chainName}>{chain}</Text>
      </View>
    </TouchableOpacity>
  );
};

WalletRowInfo.propTypes = {
  onPress: PropTypes.func,
  address: PropTypes.string,
  name: PropTypes.string,
  chainType: PropTypes.string,
  chain: PropTypes.oneOf(Object.values(TOKEN_SYMBOL)),
};

export default WalletRowInfo;

const styles = StyleSheet.create({
  root: {
    height: 72,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLOR.gray5,
    paddingHorizontal: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  walletName: { color: COLOR.white, ...FONTS.t14b },
  address: {
    marginLeft: 6,
    color: COLOR.textSecondary,
    ...FONTS.t12r,
  },
  chainName: {
    color: COLOR.textSecondary,
    marginTop: 4,
    ...FONTS.t12r,
  },
});
