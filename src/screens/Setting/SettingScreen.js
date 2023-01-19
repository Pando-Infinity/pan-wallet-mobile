import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  STRINGS,
  IMAGES,
  FONTS,
  SIZES,
  COLOR,
  ICONS,
  SCREEN_NAME,
} from '../../constants';
import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { SettingRowItem } from './components';
import DeviceInfo from 'react-native-device-info/src/index';
import { format } from 'react-string-format';

const SettingScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const version = DeviceInfo.getVersion();
  const featuresSetting = generateFeaturesSetting(t, version);

  const renderItem = ({ item }) => {
    return (
      <SettingRowItem
        label={item.name}
        description={item.description}
        style={[styles.button_features, item.style]}
        onPress={() => {
          if (item.link) {
            Linking.openURL('https://www.coingecko.com/').catch(err =>
              console.error('Error', err),
            );
          } else {
            navigation.navigate(item.screenTo);
          }
        }}
      />
    );
  };

  return (
    <ImageBackground
      source={IMAGES.homeBackGround}
      style={styles.container}
      resizeMode={'cover'}>
      <Text style={[FONTS.t30b, styles.title]}>{t(STRINGS.settings)}</Text>

      <FlatList
        data={featuresSetting}
        renderItem={renderItem}
        style={styles.list_features}
      />

      <TouchableOpacity
        style={styles.button_log_out}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: SCREEN_NAME.loginScreen }],
          });
        }}>
        <Text style={[FONTS.t16b, styles.text_logout]}>
          {t(STRINGS.logout)}
        </Text>

        <Image source={ICONS.signOut} resizeMode={'cover'} />
      </TouchableOpacity>
    </ImageBackground>
  );
};

const generateFeaturesSetting = (t, version) => {
  return [
    {
      key: 1,
      name: t(STRINGS.general),
      description: t(STRINGS.currency_language),
      screenTo: SCREEN_NAME.generalSettingScreen,
    },

    {
      key: 2,
      name: t(STRINGS.security),
      description: t(STRINGS.security_privacy_settings),
      screenTo: SCREEN_NAME.securityAndPrivacyScreen,
    },
    /*Not have in version 1.0*/
    /*{
      key: 3,
      name: t(STRINGS.contact),
      description: '',
      screenTo: '',
    },

    {
      key: 4,
      name: t(STRINGS.auto_detect_token),
      description: t(STRINGS.multi_chain),
      screenTo: '',
    },*/

    {
      key: 5,
      name: t(STRINGS.wallet_connect_sessions),
      description: '',
      screenTo: SCREEN_NAME.walletConnectSessions,
    },

    {
      key: 6,
      name: t(STRINGS.about_pan_wallet),
      description: `${format(`${t(STRINGS.version)}`, version)}`,
      screenTo: SCREEN_NAME.aboutPanWalletScreen,
      style: { marginTop: 40 },
    },
    {
      key: 7,
      name: t(STRINGS.coingecko),
      description: t(STRINGS.data_provided_by_coinGecko),
      screenTo: '',
      link: 'https://www.coingecko.com/',
    },
  ];
};

SettingScreen.propTypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    marginStart: SIZES.simpleMargin,
    marginTop: SIZES.marginStatusbar,
    color: COLOR.white,
  },

  list_features: {
    marginTop: 32,
  },

  button_features: {
    marginBottom: SIZES.simpleSpace,
    marginHorizontal: 16,
  },

  button_log_out: {
    backgroundColor: COLOR.system_red_background,
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZES.width - SIZES.simpleMargin * 2,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: SIZES.heightScreen * 0.125,
    borderRadius: SIZES.simpleSpace,
    flexDirection: 'row',
    marginTop: SIZES.heightScreen * 0.05,
    marginStart: SIZES.simpleMargin,
  },

  text_logout: {
    color: COLOR.systemRedLight,
    marginRight: 13.75,
  },
});

export default SettingScreen;
