import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  APP_THEMES,
  ICONS,
  IMAGES,
  STRINGS,
  SCREEN_NAME,
} from '../../constants';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/CustomButton/CustomButton';
import CircleTimerGradient from '../../components/CountDownCircleTimerGradient/CircleTimerGradient';
import stringFormat from '../../components/StringFormat/StringFormat';
import StyledText from 'react-native-styled-text';
import Const from '../../constants/constants';
import ShowEraseQuestion from './ResetWalletScreen/ShowEraseQuestion';
import { useSelector, useDispatch } from 'react-redux';
import { setVisibleModal } from 'stores/reducer/isVisibleModalSlice';
import { useNavigation } from '@react-navigation/native';
//storage
import { storage } from '../../databases';

const { FONTS, SIZES, COLOR } = APP_THEMES;

const LockedScreen = () => {
  //redux tool kit
  const disPatch = useDispatch(); // set data
  const navigation = useNavigation();
  //translate
  const { t } = useTranslation();
  //hook
  const [isDisable, setIsDisable] = useState(true);

  //save currentDate to storage when run Locked Screen
  const saveCurrentDate = () => {
    if (storage.getBoolean(Const.saveCurrentDateTimeWhenLockedKey) === true) {
      storage.set(Const.saveCurrentDateTimeWhenLockedKey, false);
      const currentDate = new Date().getTime();
      storage.set(Const.dateTimeLockedKey, currentDate);
    }
  };

  const didShowLockedScreen = () => {
    storage.set(Const.didShowLockedScreenKey, true);
  };

  const goBackSignIn = () => {
    storage.set(Const.didShowLockedScreenKey, false);
    // navigation.push(SCREEN_NAME.loginScreen);
    navigation.reset({
      index: 0,
      routes: [{ name: SCREEN_NAME.loginScreen }],
    });
  };

  useEffect(() => {
    saveCurrentDate();
    didShowLockedScreen();
  }, []);

  return (
    <View
      style={{
        flex: 1,
      }}>
      <ImageBackground
        source={IMAGES.backgroundConfirmPassword}
        style={{ flex: 1 }}
        resizeMode="cover">
        <View style={styles.header}>
          <Text
            style={{
              ...FONTS.t30b,
              color: COLOR.textPrimary,
              marginBottom: 12,
            }}>
            {t(STRINGS.panWalletLocked)}
          </Text>
          <Text
            style={{
              ...FONTS.t14r,
              color: COLOR.textSecondary,
              maxWidth: '90%',
            }}>
            <StyledText>
              {stringFormat(t(STRINGS.appIsTemporarily), [
                `${Const.lockedTime / 60}`,
                `${Const.maximumError}`,
              ])}
            </StyledText>
          </Text>
        </View>
        <View style={styles.body}>
          <CircleTimerGradient complete={() => setIsDisable(false)} />
        </View>
        <View style={styles.footer}>
          <CustomButton
            width={'100%'}
            height={SIZES.buttonHeight}
            label={t(STRINGS.re_attempt)}
            isDisable={isDisable}
            onPress={() => goBackSignIn()} //go back Sign In Screen
          />
          <Text style={styles.eraseLabel}>{t(STRINGS.eraseWallet)}</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => disPatch(setVisibleModal(true))}>
            <Text style={styles.resetWalletLabel}>
              {t(STRINGS.resetWallet)}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }} />
      </ImageBackground>

      <ShowEraseQuestion navigation={navigation} />
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    flex: 4,

    justifyContent: 'flex-end',
    marginHorizontal: 16,
  },
  supText: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  body: {
    flex: 7,

    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flex: 4,
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  eraseLabel: {
    ...FONTS.t14r,
    color: COLOR.white,
  },
  resetWalletLabel: {
    ...FONTS.t14b,
    color: COLOR.systemRedLight,
  },
  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
export default LockedScreen;
