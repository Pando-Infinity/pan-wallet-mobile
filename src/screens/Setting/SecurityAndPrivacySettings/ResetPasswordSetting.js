import React, { useState, useReducer } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  FONTS,
  SIZES,
  COLOR,
  SCREEN_NAME,
  STRINGS,
  CONSTANTS,
} from 'constants';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useTranslation } from 'react-i18next';
import CustomButton from 'components/CustomButton/CustomButton';
import { KeychainRepository } from 'databases';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Container, HeaderLabel } from 'components/common';
import CustomPasswordInput from 'components/inputs/CustomPasswordInput';
import { RegexDataFunction } from 'models/LocalizedData';
import { setShowChangePasswordSC } from 'stores/reducer/showChangePasswordSCSlice';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';

const ResetPasswordSetting = () => {
  const navigation = useNavigation();
  const { t: getLabel } = useTranslation();
  const RegexData = RegexDataFunction(getLabel);
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [supTextPasswordLabel, setSupTextPasswordLabel] = useState(
    getLabel(STRINGS.must8Character),
  );
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isErrorConfirm, setIsErrorConfirm] = useState(false);
  const [supTextPasswordConfirm, setSupTextPasswordConfirm] = useState('');
  const [colorStrength, setColorStrength] = useState('');
  const [supTextPasswordStrength, setSupTextPasswordStrength] = useState('');

  const [isChecked, toggleCheckBox] = useReducer(
    (currentStatus, nextStatus) => nextStatus ?? !currentStatus,
    false,
  );

  const onFocusPassword = () => {
    if (password.length < 8) {
      setSupTextPasswordLabel(getLabel(STRINGS.must8Character));
    }
    setIsError(false);
  };

  const notFocusPassword = () => {
    if (password.length > 0 && password.length < 8) {
      setSupTextPasswordLabel(getLabel(STRINGS.passwordCharacterLong));
      setIsError(true);
    } else {
      setIsError(false);
      notFocusConfirmPassword();
    }
  };

  const notFocusConfirmPassword = () => {
    if (confirmPassword !== password && confirmPassword.length > 0) {
      setIsErrorConfirm(true);
      setSupTextPasswordConfirm(getLabel(STRINGS.errorPasswordConfirm));
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

  const handleResetPassword = () => {
    dispatch(setShowChangePasswordSC(false));
    navigation.navigate(SCREEN_NAME.resetPasswordSuccess);
    KeychainRepository.savePassword(confirmPassword);
  };

  return (
    <Container>
      <HideKeyboard>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <HeaderLabel label={getLabel(STRINGS.change_password)} />

            <Text style={styles.headerSupTitle}>
              {getLabel(STRINGS.CreatePassWordSupTitle)}
            </Text>

            <CustomPasswordInput
              label={getLabel(STRINGS.new_password)}
              onChangeText={handleChangePassword}
              onFocus={onFocusPassword}
              onBlur={notFocusPassword}
              value={password}
              error={isError}
            />

            <View style={styles.passwordSupTextContainer}>
              <Text style={styles.passwordSupText(isError)}>
                {supTextPasswordLabel}
              </Text>
              <Text style={styles.strength(colorStrength)}>
                {supTextPasswordStrength}
              </Text>
            </View>

            <View style={{ position: 'relative' }}>
              <CustomPasswordInput
                label={getLabel(STRINGS.ConfirmPassword)}
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

            <View style={styles.checkbox}>
              <BouncyCheckbox
                disableBuiltInState
                isChecked={isChecked}
                size={SIZES.iconSize}
                fillColor={COLOR.trackColorEnable}
                iconStyle={{ borderRadius: 6 }}
                onPress={() => toggleCheckBox()}
              />

              <Text
                style={{
                  ...FONTS.t14r,
                  color: COLOR.white,
                  flex: 1,
                }}>
                {getLabel(STRINGS.CheckBoxLabel)}
              </Text>
            </View>
          </View>

          <View>
            <CustomButton
              label={getLabel(STRINGS.reset_password)}
              styles={{ width: '100%' }}
              isDisable={!(isPasswordValid && isChecked)}
              height={SIZES.buttonHeight}
              onPress={handleResetPassword}
            />
          </View>
        </View>
      </HideKeyboard>
    </Container>
  );
};

ResetPasswordSetting.propTypes = {};

export default ResetPasswordSetting;

const styles = StyleSheet.create({
  header: {
    marginLeft: 16,
  },
  headerSupTitle: {
    ...FONTS.t14r,
    lineHeight: 17,
    marginTop: 24,
    marginBottom: 32,
    color: COLOR.textSecondary,
  },
  passwordSupText: isError => ({
    ...FONTS.t12r,
    color: isError ? COLOR.systemRedLight : COLOR.textSecondary,
  }),
  confirmPasswordSupText: {
    ...FONTS.t12r,
    color: COLOR.systemRedLight,
    position: 'absolute',
    bottom: -24,
  },
  checkbox: {
    flexDirection: 'row',
    marginTop: 32,
  },
  strength: colorStrength => ({
    left: 5,
    color: colorStrength.toString(),
    ...FONTS.t12r,
  }),
  passwordSupTextContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
  },
});
