import React from 'react';
import {
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
  SCREEN_NAME,
  SIZES,
  STRINGS,
} from '../../constants';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { SettingRowItem } from './components';

const GeneralSettingScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

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
          {t(STRINGS.general_setting)}
        </Text>
      </View>

      {/*Currency*/}
      <SettingRowItem
        label={t(STRINGS.currency)}
        onPress={() => navigation.navigate(SCREEN_NAME.chooseCurrencyScreen)}
        style={[styles.button_text, styles.item]}
        textValue={fiatCurrency}
      />

      {/*Language*/}
      <SettingRowItem
        label={t(STRINGS.language)}
        textValue={t(`languageName:${i18n.language}`)}
        onPress={() => navigation.navigate(SCREEN_NAME.chooseLanguageScreen)}
        style={styles.item}
      />
    </ImageBackground>
  );
};

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

  button_text: {
    marginTop: 34,
    marginBottom: SIZES.simpleSpace,
  },

  item: {
    marginHorizontal: 16,
  },
});

export default GeneralSettingScreen;
