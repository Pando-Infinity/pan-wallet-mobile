import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Switch,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { IMAGES, APP_THEMES, SCREEN_NAME, STRINGS, CONSTANTS } from 'constants';
const { FONTS, SIZES, COLOR } = APP_THEMES;
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import TouchID from 'react-native-touch-id';
import { useTranslation } from 'react-i18next';
import CustomButton from 'components/CustomButton/CustomButton';
import { KeychainRepository, storage } from 'databases';
import {
  optionalConfigObjectFunction,
  RegexDataFunction,
} from 'models/LocalizedData';
import { biometryTypeValue, biometryTypeLabel } from 'constants/BiometricType';
import stringFormat from 'components/StringFormat/StringFormat';
//redux
import { useDispatch, useSelector } from 'react-redux';
import { setStatusResetPassword } from 'stores/reducer/passwordSlice';
import CustomPasswordInput from 'components/inputs/CustomPasswordInput';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const CreatePassWordScreen = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const optionalConfigObject = optionalConfigObjectFunction(t);
  const RegexData = RegexDataFunction(t);
  const [isEnable, setIsEnable] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [supTextPasswordLabel, setSupTextPasswordLabel] = useState('');
  const [supTextPasswordStrength, setSupTextPasswordStrength] = useState('');
  const [colorStrength, setColorStrength] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [biometryType, setBiometryType] = useState('');
  const [isError, setIsError] = useState(false);
  const [isErrorConfirm, setIsErrorConfirm] = useState(false);
  const [supTextPasswordConfirm, setSupTextPasswordConfirm] = useState('');
  const [unlockLabel, setUnlockLabel] = useState('');

  const { showChangePasswordSC } = useSelector(
    state => state.showChangePasswordSC,
  );
  const { isShowLabelUnLockWithBiometric } = useSelector(
    state => state.isShowLabelUnLockWithBiometric,
  );
  const statusResetPassword = useSelector(state => state.password.resetStatus);
  const dispatch = useDispatch();

  const biometricsLabel = useMemo(() => {
    let label = biometryType;

    if (biometryType === biometryTypeValue.Biometrics) {
      label = STRINGS.biometrics.toLowerCase();
    }

    return t(label);
  }, [biometryType, t]);

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
          .catch(error => setBiometryType(biometryTypeValue.null));
      } else {
        setBiometryType(biometryTypeValue.null);
      }
    }
  };

  const toggleCheckBox = () => {
    setIsChecked(previousState => !previousState);
  };

  const initSupTextPassword = () => {
    if (password.length === 0) {
      setSupTextPasswordLabel(t(STRINGS.must8Character));
    } else if (confirmPassword.length === 0) {
      setSupTextPasswordConfirm('');
    }
  };

  const biometryAlertTitle = t(STRINGS.biometry_disable_alert_title);

  const biometryAlertMessenger = t(STRINGS.biometry_disable_alert_messenger);

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

  //check authenticate TouchID/FaceID
  const authenticateCheck = () => {
    TouchID.authenticate('', optionalConfigObject)
      .then(() => {
        // Alert.alert('Authenticated Successfully');
      })
      .catch(() => {
        biometryDisableAlert();
        setIsEnable(false);
        setBiometryType(biometryTypeValue.null);
      });
    renderUnlockLabel();
  };

  //check support touchID/faceID
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
    renderUnlockLabel();
  };

  const saveIsEnableSwitchState = () => {
    storage.set(CONSTANTS.isEnableSwitchStateKey, isEnable);
  };

  const setStatusPassword = () => {
    if (statusResetPassword) {
      dispatch(setStatusResetPassword(false));
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

  const createCheckBox = () => {
    return (
      <BouncyCheckbox
        disableBuiltInState
        isChecked={isChecked}
        size={SIZES.iconSize}
        fillColor={COLOR.trackColorEnable}
        iconStyle={{ borderRadius: 6 }}
        onPress={toggleCheckBox}
      />
    );
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderUnlockLabel = () => {
    if (biometryType === biometryTypeValue.null) {
      setUnlockLabel(t(STRINGS.rememberMe));
    } else {
      setUnlockLabel(stringFormat(t(STRINGS.UnlockWith), [biometricsLabel]));
    }
  };

  const onFocusPassword = () => {
    if (password.length < 8) {
      setSupTextPasswordLabel(t(STRINGS.must8Character));
    }
    setIsError(false);
  };

  const notFocusPassword = () => {
    if (password.length > 0 && password.length < 8) {
      setSupTextPasswordLabel(t(STRINGS.passwordCharacterLong));
      setIsError(true);
    } else {
      setIsError(false);
      notFocusConfirmPassword();
    }
  };

  const notFocusConfirmPassword = () => {
    if (confirmPassword !== password && confirmPassword.length > 0) {
      setIsErrorConfirm(true);
      setSupTextPasswordConfirm(t(STRINGS.errorPasswordConfirm));
    } else {
      setIsErrorConfirm(false);
      setSupTextPasswordConfirm('');
    }
  };

  const onFocusConfirmPassword = () => {
    setIsErrorConfirm(false);
    setSupTextPasswordConfirm('');
  };

  const handleChangePassword = passwordTest => {
    const strongPassWordRegex = new RegExp(CONSTANTS.strongPassWordRegex);
    const lowerCaseRegex = new RegExp(CONSTANTS.lowercaseRegex);
    const upperCaseRegex = new RegExp(CONSTANTS.uppercaseRegex);
    const numberRegex = new RegExp(CONSTANTS.numberRegex);
    const specialCharacterRegex = new RegExp(CONSTANTS.specialCharacterRegex);
    if (
      !CONSTANTS.letterAndNumberAndSpecialCharacterRegex.test(passwordTest) &&
      passwordTest
    ) {
      setIsPasswordValid(false);
      setPassword('');
      setSupTextPasswordLabel(RegexData.invalid.text);
      setSupTextPasswordStrength(RegexData.invalid.supText);
      setColorStrength(RegexData.invalid.color);
    } else if (passwordTest.length < 8) {
      setSupTextPasswordLabel(RegexData.invalid.text);
      setSupTextPasswordStrength(RegexData.invalid.supText);
      setColorStrength(RegexData.invalid.color);
      setPassword(passwordTest);
    } else if (
      lowerCaseRegex.test(passwordTest) ||
      upperCaseRegex.test(passwordTest) ||
      numberRegex.test(passwordTest) ||
      specialCharacterRegex.test(passwordTest)
    ) {
      setSupTextPasswordLabel(RegexData.text);
      setSupTextPasswordStrength(RegexData.weak.supText);
      setColorStrength(RegexData.weak.color);
      setIsError(false);
      setPassword(passwordTest);
      setIsPasswordValid(confirmPassword === passwordTest);
    } else if (strongPassWordRegex.test(passwordTest)) {
      setSupTextPasswordLabel(RegexData.text);
      setSupTextPasswordStrength(RegexData.strong.supText);
      setColorStrength(RegexData.strong.color);
      setIsError(false);
      setPassword(passwordTest);
      setIsPasswordValid(confirmPassword === passwordTest);
    } else {
      setSupTextPasswordLabel(RegexData.text);
      setSupTextPasswordStrength(RegexData.medium.supText);
      setColorStrength(RegexData.medium.color);
      setIsError(false);
      setPassword(passwordTest);
      setIsPasswordValid(confirmPassword === passwordTest);
    }
  };

  const handleChangeConfirmPassword = newConfirmPassword => {
    setConfirmPassword(newConfirmPassword);
    setIsPasswordValid(
      newConfirmPassword === password && newConfirmPassword.length >= 8,
    );
  };

  useEffect(() => {
    initSupTextPassword();
    saveIsEnableSwitchState();
    setStatusPassword();
  });

  useEffect(() => {
    setIsChecked(showChangePasswordSC);
  }, [showChangePasswordSC]);

  useEffect(() => {
    if (isFocused) {
      isSupported();
    }
  }, [isFocused, biometryType]);

  //render
  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <View style={styles.container}>
        <ImageBackground
          source={IMAGES.backgroundConfirmPassword}
          style={{
            flex: 1,
          }}
          resizeMode="cover">
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t(STRINGS.CreatePassWordTitle)}
            </Text>
            <Text style={styles.headerSupTitle}>
              {t(STRINGS.CreatePassWordSupTitle)}
            </Text>
          </View>

          <View style={styles.body}>
            <CustomPasswordInput
              label={t(STRINGS.your_password)}
              onChangeText={handleChangePassword}
              onFocus={onFocusPassword}
              onBlur={notFocusPassword}
              value={password}
              error={isError}
            />

            <View style={styles.passwordSupTextContainer}>
              <Text
                style={
                  ([styles.passwordSupText],
                  {
                    color: !isError
                      ? COLOR.textSecondary
                      : COLOR.systemRedLight,
                  })
                }>
                {supTextPasswordLabel}
              </Text>
              <Text style={([styles.strength], { color: colorStrength })}>
                {supTextPasswordStrength}
              </Text>
            </View>

            <View style={{ top: SIZES.height * 0.05 }}>
              <CustomPasswordInput
                label={t(STRINGS.ConfirmPassword)}
                onChangeText={handleChangeConfirmPassword}
                onFocus={onFocusConfirmPassword}
                onBlur={notFocusConfirmPassword}
                error={isErrorConfirm}
                value={confirmPassword}
              />

              <Text style={styles.confirmPasswordSupText}>
                {supTextPasswordConfirm}
              </Text>
            </View>

            {isShowLabelUnLockWithBiometric ? (
              <View style={styles.switchButton}>
                <Text style={{ ...FONTS.t16r, color: COLOR.white }}>
                  {unlockLabel}
                </Text>

                {createSwitch()}
              </View>
            ) : null}

            <View style={styles.checkbox}>
              {createCheckBox()}

              <Text
                style={{
                  ...FONTS.t14r,
                  marginHorizontal: 10,
                  color: COLOR.white,
                  lineHeight: 20,
                }}>
                {t(STRINGS.CheckBoxLabel)}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          <View style={styles.footer}>
            <CustomButton
              label={
                showChangePasswordSC
                  ? t(STRINGS.reset_password)
                  : t(STRINGS.CreatePassWordTitle)
              }
              isDisable={!(isPasswordValid && isChecked)}
              height={SIZES.buttonHeight}
              onPress={
                showChangePasswordSC
                  ? () => {
                      navigation.navigate(SCREEN_NAME.resetPasswordSuccess);
                      KeychainRepository.savePassword(confirmPassword);
                    }
                  : () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: SCREEN_NAME.setupWalletScreen }],
                      });
                      KeychainRepository.savePassword(confirmPassword);
                    }
              }
            />
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};
//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: '20%',
    marginHorizontal: 16,
  },
  headerTitle: {
    ...FONTS.t30b,
    color: COLOR.white,
  },
  headerSupTitle: {
    ...FONTS.t14r,
    top: 12,
    lineHeight: 17,
    color: COLOR.textSecondary,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: '15%',
  },
  passwordSupTextContainer: {
    top: 5,
    flexDirection: 'row',
  },
  passwordSupText: {
    ...FONTS.t12r,
  },
  confirmPasswordSupText: {
    top: 5,
    ...FONTS.t12r,
    color: COLOR.systemRedLight,
  },
  strength: {
    left: 5,
    ...FONTS.t12r,
  },
  switchButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
  },
  checkbox: {
    flexDirection: 'row',
    marginTop: SIZES.height * 0.05,
    marginHorizontal: 16,
  },
  footer: {
    marginHorizontal: 16,
    marginVertical: SIZES.height * 0.03,
  },
});

export default CreatePassWordScreen;
