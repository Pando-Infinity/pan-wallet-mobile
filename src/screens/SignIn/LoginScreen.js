import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  IMAGES,
  ICONS,
  STRINGS,
  APP_THEMES,
  COLOR,
  SCREEN_NAME,
  CONSTANTS,
} from 'constants';
import { useTranslation } from 'react-i18next';
import CustomTextInput from 'components/CustomTextInput/CustomTextInput';
import CustomButton from 'components/CustomButton/CustomButton';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';
import stringFormat from 'components/StringFormat/StringFormat';
import { KeychainRepository, storage } from 'databases';
import { useDispatch, useSelector } from 'react-redux';
import { setVisibleModal } from 'stores/reducer/isVisibleModalSlice';
import ShowEraseQuestion from './ResetWalletScreen/ShowEraseQuestion';
import { optionalConfigObjectFunction } from 'models/LocalizedData';
import TouchID from 'react-native-touch-id';
import { biometryTypeValue, biometryTypeLabel } from 'constants/BiometricType';
import { setStatusResetPassword } from 'stores/reducer/passwordSlice';
import PropTypes from 'prop-types';
import { pushScreenTimeOut } from 'utils/util';
import { useIsFocused } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const disPatch = useDispatch();
  const isFocused = useIsFocused();

  const optionalConfigObject = optionalConfigObjectFunction(t);

  const switchState = storage.getBoolean(CONSTANTS.isEnableSwitchStateKey);

  const { isVisibleModal } = useSelector(state => state.isVisibleModal);
  const { hiddenUnlockSignIn } = useSelector(state => state.hiddenUnlockSignIn);
  const statusResetPassword = useSelector(state => state.password.resetStatus);

  const [yourPassword, setYourPassword] = useState();
  const [isErrorPassword, setErrorPassword] = useState(false);
  const [isDisableButton, setDisableButton] = useState(true);
  const [errorCount, setErrorCount] = useState(CONSTANTS.maximumError);
  const [biometryType, setBiometryType] = useState('');
  const [isEnable, setIsEnable] = useState(switchState);

  const passwordInvalid = t(STRINGS.passwordInvalidLogin);
  const biometryAlertTitle = t(STRINGS.biometry_disable_alert_title);
  const biometryAlertMessenger = t(STRINGS.biometry_disable_alert_messenger);

  const biometricsLabel = useMemo(() => {
    let label = biometryType;

    if (biometryType === biometryTypeValue.Biometrics) {
      label = STRINGS.biometrics.toLowerCase();
    }

    return t(label);
  }, [biometryType, t]);

  const isSupported = () => {
    TouchID.isSupported(optionalConfigObject)
      .then(type => {
        if (type === true) {
          setBiometryType(biometryTypeValue.Biometrics);
        } else {
          switch (type) {
            case biometryTypeValue.FaceID: {
              setBiometryType(biometryTypeLabel.FaceID);
              break;
            }
            case biometryTypeValue.TouchID: {
              setBiometryType(biometryTypeLabel.TouchID);
              break;
            }
            default: {
              setBiometryType(biometryTypeLabel.null);
              break;
            }
          }
        }
      })
      .catch(() => {
        setBiometryType(biometryTypeLabel.null);
      });
  };

  const saveIsEnableSwitchState = () => {
    storage.set(CONSTANTS.isEnableSwitchStateKey, isEnable);
  };

  const biometryDisableAlert = () => {
    Alert.alert(
      stringFormat(`${biometryAlertTitle}`, [`${biometryType}`]),
      stringFormat(`${biometryAlertMessenger}`, [`${biometryType}`]),
      [
        {
          text: t(STRINGS.close),
          style: 'cancel',
        },
        {
          text: t(STRINGS.open_settings),
          onPress: () => Linking.openSettings(),
        },
      ],
    );
  };

  const authenticateCheck = () => {
    TouchID.authenticate('', optionalConfigObject).catch(() => {
      biometryDisableAlert();
      setIsEnable(false);
    });
  };

  const renderUnlockLabel = () => {
    if (biometryType === biometryTypeValue.null) {
      return t(STRINGS.rememberMe);
    } else {
      return stringFormat(t(STRINGS.UnlockWith), [biometricsLabel]);
    }
  };

  const toggleSwitch = () => {
    setIsEnable(previousState => !previousState);
    storage.set(CONSTANTS.isEnableSwitchStateKey, !isEnable);
    storage.set(
      CONSTANTS.isGoHomeWithRememberMeKey,
      biometryType === biometryTypeLabel.null,
    );
    if (!isEnable) {
      if (biometryType !== biometryTypeValue.null) {
        TouchID.isSupported()
          .then(authenticateCheck)
          .catch(() => setBiometryType(biometryTypeValue.null));
      } else {
        setBiometryType(biometryTypeValue.null);
      }
    }
  };

  const createSwitch = () => {
    return (
      <Switch
        trackColor={{
          false: COLOR.trackColorDisable,
          true: COLOR.trackColorEnable,
        }}
        thumbColor="white"
        ios_backgroundColor={COLOR.trackColorDisable}
        onChange={toggleSwitch}
        value={isEnable}
      />
    );
  };

  const clickHandlerSigIn = async () => {
    if (errorCount > 1) {
      if ((await getAndCheckPassword(yourPassword)) === true) {
        pushScreenTimeOut(navigation, disPatch);
      } else {
        setErrorPassword(true);
        setErrorCount(errorCount - 1);
      }
    } else {
      storage.set(CONSTANTS.saveCurrentDateTimeWhenLockedKey, true);
      navigation.navigate(SCREEN_NAME.lockedScreen);
    }
  };

  const setStatusPassword = () => {
    if (statusResetPassword) {
      disPatch(setStatusResetPassword(false));
    }
  };

  useEffect(() => {
    saveIsEnableSwitchState();
    setStatusPassword();
  }, []);

  useEffect(() => {
    if (isFocused) {
      isSupported();
      setYourPassword();
    }
  }, [isFocused]);

  return (
    <HideKeyboard>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={IMAGES.createPassWorkBackGround}
          style={{ flex: 1 }}
          resizeMode="cover">
          <KeyboardAvoidingView
            keyboardVerticalOffset={10}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <View style={styles.body}>
              <Text style={styles.welcomeBack}>{t(STRINGS.welcomeBack)}</Text>

              <View style={{ marginTop: SIZES.height * 0.05 }}>
                <CustomTextInput
                  autoFocus={true}
                  isPassword={true}
                  label={t(STRINGS.your_password)}
                  width={'100%'}
                  getData={input => {
                    if (input.length >= 8) {
                      setYourPassword(input);
                      setDisableButton(false);
                    } else {
                      setErrorPassword(false);
                      setDisableButton(true);
                    }
                  }}
                  error={isErrorPassword}
                  onFocus={() => setErrorPassword(false)}
                  resetTextData={statusResetPassword}
                />

                <Text style={styles.errorLabel}>
                  {isErrorPassword
                    ? stringFormat(`${passwordInvalid}`, [`${errorCount}`])
                    : ''}
                </Text>

                {!hiddenUnlockSignIn ? (
                  <View style={styles.switchButton}>
                    <Text style={{ ...FONTS.t16r, color: COLOR.white }}>
                      {renderUnlockLabel()}
                    </Text>
                    {createSwitch()}
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.footer}>
              <CustomButton
                width={SIZES.width - SIZES.simpleMargin * 2}
                height={SIZES.buttonHeight}
                label={t(STRINGS.signIn)}
                icon={ICONS.arrowRight}
                isDisable={isDisableButton}
                onPress={() => {
                  clickHandlerSigIn().done();
                }}
              />
            </View>
          </KeyboardAvoidingView>

          <View style={styles.resetWalletView}>
            <Text style={styles.eraseLabel}>{t(STRINGS.eraseWallet)}</Text>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                disPatch(setVisibleModal(true));
              }}>
              <Text
                style={[
                  styles.resetWalletLabel,
                  {
                    color: isVisibleModal ? COLOR.white : COLOR.systemRedLight,
                  },
                ]}>
                {t(STRINGS.resetWallet)}
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <ShowEraseQuestion navigation={navigation} />
      </View>
    </HideKeyboard>
  );
};

const { SIZES, FONTS } = APP_THEMES;
const { getPassword } = KeychainRepository;

//get password from Keychain
const getAndCheckPassword = password => {
  return getPassword()
    .then(result => {
      return password === result;
    })
    .catch(() => {
      return false;
    });
};

LoginScreen.propTypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  body: {
    flex: 8,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  resetWalletView: {
    marginHorizontal: 16,
    marginVertical: SIZES.heightScreen * 0.06,
  },
  welcomeBack: {
    ...FONTS.t30b,
    color: COLOR.white,
  },
  errorLabel: {
    ...FONTS.t12r,
    color: COLOR.systemRedLight,
    marginTop: 8,
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
    marginTop: 24,
  },
  switchButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default LoginScreen;
