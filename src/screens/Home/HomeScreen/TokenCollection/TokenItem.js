import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SCREEN_NAME, FONTS, COLOR, SIZES } from 'constants';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency } from 'utils/format.util';
import { useSelector } from 'react-redux';
import { AvatarView } from 'components/CustionView/AvatarView';
import { formatPriceChangePercentage24h } from 'utils/util';

const TokenItem = ({ item }) => {
  const navigation = useNavigation();
  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(SCREEN_NAME.tokenDetailScreen, item);
      }}>
      <View style={styles.tokenList}>
        <View style={styles.tokenListImage}>
          <AvatarView size={SIZES.iconWidth} image={item.image} />
        </View>
        <View style={[styles.tokenListLabel, { width: '40%' }]}>
          <Text style={{ ...FONTS.t14b, color: COLOR.textPrimary }}>
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ ...FONTS.t12r, color: COLOR.textSecondary }}>
              {formatCurrency(item.price, fiatCurrency, 5)}
            </Text>

            <Text
              style={{
                ...FONTS.t12r,
                color:
                  item.change_percent_price > 0
                    ? COLOR.systemGreenLight1
                    : COLOR.systemRedLight,
                marginLeft: 12,
              }}>
              {formatPriceChangePercentage24h(item.change_percent_price)}
            </Text>
          </View>
        </View>
        <View style={styles.balanceView}>
          <Text
            style={{
              ...FONTS.t14b,
              color: COLOR.white,
              justifyContent: 'flex-end',
              textAlign: 'right',
            }}>
            {item?.balance} {item?.coinSymbol?.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

TokenItem.propTypes = {
  item: PropTypes.shape({
    image: PropTypes.number,
    name: PropTypes.string,
    price: PropTypes.number,
    balance: PropTypes.string,
    asset_id: PropTypes.string,
    change_percent_price: PropTypes.string,
    coinSymbol: PropTypes.string,
  }),
};

const styles = StyleSheet.create({
  tokenList: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
  },
  tokenListImage: {
    width: SIZES.iconWidth,
    height: SIZES.iconHeight,
  },
  tokenListLabel: {
    marginLeft: SIZES.width * 0.05,
    justifyContent: 'space-evenly',
  },
  balanceView: {
    width: '46%',
    paddingRight: 16,
    justifyContent: 'flex-start',
  },
});

export default TokenItem;
