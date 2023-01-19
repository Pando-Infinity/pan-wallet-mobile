import React from 'react';
import {
  Text,
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  ImageBackground,
  Linking,
} from 'react-native';
import { IMAGES, APP_THEMES, SCREEN_NAME, STRINGS } from 'constants';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { URLConst } from '../../constants';

const { FONTS, COLOR, SIZES } = APP_THEMES;

const SetupWalletScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  function createButton() {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: COLOR.btnImportColor }]}
          onPress={() => {
            navigation.navigate(SCREEN_NAME.importWalletScreen);
          }}>
          <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
            {t(STRINGS.importYourWallet)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate(SCREEN_NAME.secureYourWalletScreen)
          }>
          <LinearGradient
            style={styles.gradient}
            colors={COLOR.buttonColors}
            locations={[0, 0, 0.54, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}>
            <Text style={{ color: COLOR.white, ...FONTS.t16b }}>
              {t(STRINGS.createNewWallet)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View
          style={{
            width: '100%',
            marginVertical: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: SIZES.regular,
              color: COLOR.textSecondary,
            }}>
            {t(STRINGS.byProcessing)}
          </Text>

          <Text
            style={{
              fontSize: 12,
              fontWeight: SIZES.bold,
              marginLeft: 3,
              color: COLOR.termsColor,
            }}
            onPress={() =>
              Linking.openURL(URLConst.terms_and_conditions).catch()
            }>
            {t(STRINGS.terms)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.setupWalletBackGround}
        resizeMode="cover"
        style={{
          flex: 1,
        }}>
        <View style={{ marginTop: '15%' }}>
          <Text style={styles.largeTile}>{t(STRINGS.SetupWalletTitle)}</Text>
          <Text style={styles.subTitle}>{t(STRINGS.SetupWalletSubTitle)}</Text>
        </View>

        <View
          style={{ flex: 5, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={IMAGES.setupImage} />
        </View>

        <View
          style={{
            flex: 3,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {createButton()}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  largeTile: {
    ...FONTS.t30b,
    textAlign: 'left',
    marginHorizontal: 16,
    marginTop: 10,
    color: COLOR.white,
  },
  subTitle: {
    ...FONTS.t14r,
    marginHorizontal: 16,
    lineHeight: 20,
    marginTop: 10,
    color: COLOR.white,
  },
  image: {
    resizeMode: 'contain',
    width: SIZES.width * 0.8,
    height: SIZES.width * 0.8,
  },
  btn: {
    height: SIZES.buttonHeight,
    width: '90%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    top: '20%',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    height: 50,
    width: '100%',
  },
});

export default SetupWalletScreen;
