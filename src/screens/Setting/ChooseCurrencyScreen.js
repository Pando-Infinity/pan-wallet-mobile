import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  COLOR,
  FONTS,
  ICONS,
  IMAGES,
  SIZES,
  STRINGS,
  CONSTANTS,
  SCREEN_NAME,
} from '../../constants';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NativeAsyncStorage, storage } from '../../databases';
import { setFiat } from 'stores/reducer/fiatCurrencySLice';
import { SettingCheckRowItem } from './components';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    marginTop: SIZES.marginStatusbar,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  button_back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: SIZES.simpleSpace,
    position: 'absolute',
    start: 0,
    top: -10,
  },

  title: {
    color: COLOR.white,
  },

  container_item: {
    marginBottom: SIZES.simpleSpace,
    marginHorizontal: 16,
  },

  flatList: {
    marginTop: 34,
  },

  button_save: {
    position: 'absolute',
    end: 0,
    bottom: -16,
    marginEnd: SIZES.simpleSpace,
  },

  text_save: {
    margin: SIZES.simpleMargin,
    color: COLOR.white,
    textAlign: 'center',
  },
});

const listCurrency = require('../../../assets/jsons/currency/FiatCurrentcy.json');

const ChooseCurrencyScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState([]);
  const [currency, setCurrency] = useState([]);
  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);
  const dispatch = useDispatch();

  useEffect(() => {
    const list = [];
    listCurrency.valueOf().forEach(item => {
      const obj = {
        fiat: item.fiat,
        name: t(`fiatCurrencyName:${item.fiat}`),
      };
      list.push(obj);
    });
    setCurrencies(list);
    setCurrency(fiatCurrency);
  }, []);

  const renderItem = ({ item }) => {
    const isChecked = item.fiat === currency;
    return (
      <SettingCheckRowItem
        label={item.fiat}
        description={item.name}
        style={[styles.container_item]}
        isChecked={isChecked}
        onPress={() => {
          setCurrency(item.fiat);
        }}
      />
    );
  };

  return (
    <ImageBackground
      source={IMAGES.homeBackGround}
      style={styles.container}
      resizeMode={'cover'}>
      {/*header*/}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.button_back}>
          <Image source={ICONS.backButton} resizeMode={'cover'} />
        </TouchableOpacity>

        <Text style={[FONTS.t16b, styles.title]}>
          {t(STRINGS.currencySetting)}
        </Text>

        <TouchableOpacity
          style={styles.button_save}
          onPress={() => {
            dispatch(setFiat(currency));
            storage.set(CONSTANTS.fiatCurrency, currency);
            navigation.navigate(SCREEN_NAME.generalSettingScreen);
          }}>
          <Text style={[FONTS.t14r, styles.text_save]}>{t(STRINGS.save)}</Text>
        </TouchableOpacity>
      </View>

      {/*List currency*/}
      <FlatList
        data={currencies}
        renderItem={renderItem}
        style={styles.flatList}
      />
    </ImageBackground>
  );
};

export default ChooseCurrencyScreen;
