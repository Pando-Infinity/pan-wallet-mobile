import React from 'react';
import PropTypes from 'prop-types';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { STRINGS, SCREEN_NAME, FONTS, COLOR, ICONS, SIZES } from 'constants';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import TokenItem from './TokenItem';

const TokenCollection = ({ data, walletID, walletChain }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.below}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(SCREEN_NAME.selectToken, {
            id: walletID.current,
            chain: walletChain.current,
          })
        }>
        <View style={styles.tokenList}>
          <Image
            source={ICONS.tokenList}
            style={styles.tokenListImage}
            resizeMode="cover"
          />
          <View style={styles.tokenListLabel}>
            <Text style={{ ...FONTS.t14b, color: COLOR.white }}>
              {t(STRINGS.manage_token_list)}
            </Text>
            <Text style={{ ...FONTS.t12r, color: COLOR.textSecondary }}>
              {t(STRINGS.add_remove_token)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {data !== null ? (
        <FlatList
          scrollEnabled={false}
          data={data}
          renderItem={({ item }) => <TokenItem item={item} />}
          keyExtractor={(_, index) => index}
        />
      ) : null}
    </View>
  );
};

TokenCollection.propTypes = {
  data: PropTypes.array,
  walletID: PropTypes.object,
  walletChain: PropTypes.object,
};

const styles = StyleSheet.create({
  below: {
    flex: 5,
    paddingHorizontal: 16,
    marginBottom: SIZES.height * 0.1,
  },
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
    flex: 1,
  },
});

export default TokenCollection;
