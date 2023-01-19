import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLOR, FONTS, ICONS, IMAGES, SIZES, STRINGS } from '../../constants';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { SettingCheckRowItem } from './components';

const ChooseLanguageScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const [listLanguage, setListLanguage] = useState([]);
  const [code, setCode] = useState('');

  const setLanguage = () => {
    i18n.changeLanguage(code).done();
    Platform.OS === 'android'
      ? NativeModules.MultilingualModule.updateLanguage(code)
      : NativeModules.MultilanguageModule.updateLanguage(code);
  };

  const renderItem = ({ item }) => {
    const isChecked = item.code === code;
    return (
      <SettingCheckRowItem
        label={item.language}
        style={[styles.container_item]}
        onPress={() => setCode(item.code)}
        isChecked={isChecked}
      />
    );
  };

  useEffect(() => {
    const list = [];
    languages.valueOf().forEach(item => {
      const obj = {
        code: item.code,
        language: t(`languageName:${item.code}`),
      };
      list.push(obj);
    });
    setListLanguage(list);
  }, []);

  useEffect(() => {
    setCode(i18n.language);
  }, []);

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
          {t(STRINGS.languageSetting)}
        </Text>

        <TouchableOpacity
          style={styles.button_save}
          onPress={() => {
            setLanguage();
            navigation.goBack();
          }}>
          <Text style={[FONTS.t14r, styles.text_save]}>{t(STRINGS.save)}</Text>
        </TouchableOpacity>
      </View>

      {/*List language*/}
      <FlatList
        data={listLanguage}
        renderItem={renderItem}
        style={styles.flatList}
      />
    </ImageBackground>
  );
};

const languages = require('../../../assets/jsons/language/language.json');

ChooseLanguageScreen.propTypes = {
  navigation: PropTypes.object,
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

  flatList: {
    marginTop: 34,
  },

  container_item: {
    marginBottom: SIZES.simpleSpace,
    marginHorizontal: 16,
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

export default ChooseLanguageScreen;
