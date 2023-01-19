import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { STRINGS, FONTS, COLOR, SCREEN_NAME, IMAGES, SIZES } from 'constants';
import { useNavigation } from '@react-navigation/native';
import { bigNumberFormat } from 'utils/format.util';
import { useSelector } from 'react-redux';

const HomeBanner = ({ bottomSheetRef, walletID, walletNameUI, tokenList }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [total, setTotal] = useState(0);

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const hideTabBar = () => {
    navigation.setOptions({
      tabBarStyle: {
        position: 'absolute',
        borderTopWidth: 0,
        backgroundColor: COLOR.simpleBackground,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: SIZES.height * 0.1,
        elevation: 0,
        width: SIZES.width,
        display: 'none',
      },
    });
  };

  useEffect(() => {
    let totalBalance = 0;
    if (Array.isArray(tokenList) && tokenList.length > 0) {
      tokenList.forEach(token => {
        totalBalance += Number(token.balance) * Number(token.price) || 0;
      });
    }
    setTotal(totalBalance);
  }, [tokenList]);

  return (
    <View style={styles.headerContent}>
      <View style={styles.headerContentUp}>
        <Text style={{ ...FONTS.t16r, color: COLOR.white }}>
          {walletNameUI}
        </Text>
        <Text
          style={{ ...FONTS.t14r, color: COLOR.actionContrast }}
          onPress={() => {
            bottomSheetRef.current?.snapTo(0);
            hideTabBar();
            // updateListWalletData().done();
          }}>
          {t(STRINGS.change_wallet)}
        </Text>
      </View>

      <View style={styles.headerContentDown}>
        <View style={styles.headerContentDownLeft}>
          <Text style={{ ...FONTS.t12r, color: COLOR.white }}>
            {t(STRINGS.total_wallet_value)}
          </Text>
          <Text style={{ ...FONTS.t30b, color: COLOR.white }}>
            {bigNumberFormat(total, fiatCurrency, 2)}
          </Text>

          <Text
            style={{ ...FONTS.t12b, color: COLOR.textPrimary }}
            onPress={() => {
              navigation.navigate(SCREEN_NAME.transactionHistoryScreen, {
                id: walletID,
              });
            }}>
            {t(STRINGS.view_transaction_history)}
          </Text>
        </View>

        <View style={styles.headerContentDownRight}>
          <Image source={IMAGES.coinImage} resizeMode="cover" />
        </View>
      </View>
    </View>
  );
};

HomeBanner.propTypes = {
  bottomSheetRef: PropTypes.object,
  walletID: PropTypes.object,
  walletNameUI: PropTypes.string,
  tokenList: PropTypes.array,
};

const styles = StyleSheet.create({
  headerContent: {
    marginTop: 20,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContentUp: {
    height: 36,
    width: SIZES.width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLOR.surface3_alpha20,
    borderTopLeftRadius: SIZES.homeViewRadius,
    borderTopRightRadius: SIZES.homeViewRadius,
    paddingLeft: 24,
    paddingRight: 16,
  },
  headerContentDown: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    height: 114,
    backgroundColor: COLOR.shade6,
    width: SIZES.width * 0.9,
    borderBottomLeftRadius: SIZES.homeViewRadius,
    borderBottomRightRadius: SIZES.homeViewRadius,
  },
  headerContentDownLeft: {
    paddingLeft: 24,
    justifyContent: 'space-evenly',
    height: '100%',
    width: '65%',
  },
  headerContentDownRight: {
    height: '100%',
    width: '35%',
    alignItems: 'flex-end',
  },
});

export default HomeBanner;
