import React, { useEffect } from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import {
  APP_THEMES,
  IMAGES,
  SCREEN_NAME,
  TIME_OUT,
  CONSTANTS,
} from 'constants';
import { optionalConfigObjectFunction } from 'models/LocalizedData';
import { useTranslation } from 'react-i18next';
import { storage } from 'databases';
import TouchID from 'react-native-touch-id';
import PropTypes from 'prop-types';
import { pushScreenTimeOut } from 'utils/util';
import { useDispatch } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { biometryTypeValue } from 'constants/BiometricType';

const SplashScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const optionalConfigObject = optionalConfigObjectFunction(t);

  //biometric
  const authenticateCheck = () => {
    TouchID.authenticate('', optionalConfigObject)
      .then(() => {
        navigateScreenWithTimeTimeOut();
      })
      .catch(() => {
        navigation.navigate(SCREEN_NAME.loginScreen);
      });
  };

  // check which screen to go to next
  const nextScreen = () => {
    if (storage.getBoolean(CONSTANTS.didOpenHomeScreenKey) !== true) {
      setTimeout(() => {
        navigation.navigate(SCREEN_NAME.onBoardingScreen);
      }, 1000);
    } else {
      const didShowLockedScreen = getDidShowLockedScreen();
      if (didShowLockedScreen === true) {
        setTimeout(() => {
          navigation.navigate(SCREEN_NAME.lockedScreen);
        }, 1000);
      } else if (storage.getBoolean(CONSTANTS.hiddenSignIn) !== true) {
        const isTurnOnButtonBiometry = getTurnOnButtonBiometry();
        const isGoHomeWithRememberMe = getGoHomeWithRememberMe();
        if (isTurnOnButtonBiometry) {
          if (isGoHomeWithRememberMe) {
            setTimeout(() => {
              navigateScreenWithTimeTimeOut();
            }, 1000);
          } else {
            authenticateCheck();
          }
        } else {
          setTimeout(() => {
            navigation.navigate(SCREEN_NAME.loginScreen);
          }, 1000);
        }
      } else {
        setTimeout(() => {
          navigation.navigate(SCREEN_NAME.loginScreen);
        }, 1000);
      }
    }
  };

  const navigateScreenWithTimeTimeOut = () => {
    const isTimeOut = storage.getBoolean(TIME_OUT.timeOutState);
    if (isTimeOut) {
      pushScreenTimeOut(navigation, dispatch);
    } else {
      navigation.navigate(SCREEN_NAME.navigationBottomTab);
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    const isGoHomeWithRememberMe = getGoHomeWithRememberMe();
    TouchID.isSupported(optionalConfigObject)
      .then(type => {
        if (
          isGoHomeWithRememberMe &&
          (type === biometryTypeValue.FaceID ||
            type === biometryTypeValue.TouchID ||
            type)
        ) {
          storage.set(CONSTANTS.isEnableSwitchStateKey, false);
          storage.set(TIME_OUT.timeOutState, true);
          storage.set(CONSTANTS.isGoHomeWithRememberMeKey, false);
        }
      })
      .catch(() => {
        if (!isGoHomeWithRememberMe) {
          storage.set(CONSTANTS.isEnableSwitchStateKey, false);
        }
      })
      .finally(() => {
        nextScreen();
      });
  }, [isFocused, optionalConfigObject]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.splashScreenBG}
        style={{ flex: 1 }}
        resizeMode="cover">
        <View style={styles.body}>
          <Image
            source={IMAGES.panLogo}
            style={styles.image}
            resizeMode="cover"
          />

          <Image
            source={IMAGES.panWallet}
            style={{
              width: SIZES.width * 0.4,
              height: SIZES.height * 0.03,
              marginTop: 30,
            }}
            resizeMode="contain"
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const { SIZES, FONTS, COLOR } = APP_THEMES;

const getTurnOnButtonBiometry = () =>
  storage.getBoolean(CONSTANTS.isEnableSwitchStateKey); // if turn off biometric => goto Login Screen

const getDidShowLockedScreen = () =>
  storage.getBoolean(CONSTANTS.didShowLockedScreenKey);

const getGoHomeWithRememberMe = () =>
  storage.getBoolean(CONSTANTS.isGoHomeWithRememberMeKey); // if using Remember me => goHome

SplashScreen.propTypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SIZES.width * 0.6,
    height: SIZES.width * 0.6,
  },
  label: {
    ...FONTS.t30b,
    color: COLOR.white,
    marginTop: SIZES.height * 0.05,
  },
});

export default SplashScreen;
