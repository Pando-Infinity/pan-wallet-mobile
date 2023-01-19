import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { STRINGS, ICONS, FONTS, SCREEN_NAME, SIZES, COLOR } from 'constants';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  setListAddress,
  setListWallet,
} from 'stores/reducer/dataListWalletSlice';

const HomeHeader = ({ walletData, listAddressRef }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleNavigateToWalletList = () => {
    dispatch(setListWallet(walletData));
    dispatch(setListAddress(listAddressRef.current));
    navigation.navigate(SCREEN_NAME.walletList);
  };

  return (
    <View style={styles.headerTop}>
      <Text style={{ ...FONTS.t30b, color: COLOR.white }}>
        {t(STRINGS.wallet)}
      </Text>
      <TouchableOpacity
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={handleNavigateToWalletList}>
        <Image
          source={ICONS.walletSetting}
          style={{ height: SIZES.iconSize, width: SIZES.iconSize }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
};

HomeHeader.propTypes = {
  listAddressRef: PropTypes.object,
  walletData: PropTypes.array,
};

HomeHeader.defaultProps = {};

const styles = StyleSheet.create({
  headerTop: {
    width: SIZES.width,
    paddingHorizontal: SIZES.width * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default HomeHeader;
