import React, { useEffect, useState } from 'react';
import { Container, HeaderLabel } from 'components/common';
import { useTranslation } from 'react-i18next';
import { COLOR, FONTS, SIZES, STRINGS, SCREEN_NAME } from 'constants';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CustomPasswordInput from 'components/inputs/CustomPasswordInput';
import CustomButton from 'components/CustomButton/CustomButton';
import KeychainRepository from 'databases/KeychainRepository';
import { useNavigation, useRoute } from '@react-navigation/native';
import { setShowLabelUnLockWithBiometric } from 'stores/reducer/isShowLabelUnLockWithBiometricSlice';
import { setShowChangePasswordSC } from 'stores/reducer/showChangePasswordSCSlice';
import { useDispatch } from 'react-redux';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';

const ConfirmPasswordScreen = () => {
  const { t: getLabel } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { screenName, type, seedPhrase, privateKey } = route.params;

  const [password, setPassword] = useState('');
  const [isInvalidPassword, setIsInvalidPassword] = useState(true);
  const [isErrorInput, setIsErrorInput] = useState(false);

  const handleConfirm = () => {
    KeychainRepository.getPassword()
      .then(result => {
        if (password === result) {
          if (screenName === SCREEN_NAME.walletDetail) {
            navigation.navigate(SCREEN_NAME.viewSecretRecoveryScreen, {
              type,
              seedPhrase,
              privateKey,
            });
          } else if (screenName === SCREEN_NAME.securityAndPrivacyScreen) {
            dispatch(setShowLabelUnLockWithBiometric(false));
            dispatch(setShowChangePasswordSC(true));
            setPassword('');
            navigation.push(SCREEN_NAME.resetPasswordScreen);
          }
        } else {
          setIsInvalidPassword(true);
        }
      })
      .catch(() => {
        setIsInvalidPassword(true);
      });
  };

  useEffect(() => {
    if (password) {
      setIsInvalidPassword(false);
    } else {
      setIsInvalidPassword(true);
    }
  }, [password]);

  useEffect(() => {
    setIsErrorInput(Boolean(password && isInvalidPassword));
  }, [isInvalidPassword]);

  return (
    <Container>
      <HideKeyboard>
        <View
          style={{
            height: '100%',
            width: '100%',
            justifyContent: 'space-between',
          }}>
          <View style={{ flex: 1 }}>
            <HeaderLabel label={getLabel(STRINGS.confirm_password)} />

            <KeyboardAvoidingView
              style={{ flex: 1 }}
              keyboardVerticalOffset={70}
              behavior={'padding'}>
              <Text style={styles.description}>
                {getLabel(STRINGS.confirm_password_description)}
              </Text>

              <CustomPasswordInput
                label={getLabel(STRINGS.your_password)}
                value={password}
                onChangeText={setPassword}
                error={isErrorInput}
                onFocus={() => setIsErrorInput(false)}
                style={{ width: '100%' }}
              />

              {isErrorInput && (
                <Text style={styles.textError}>
                  {getLabel(STRINGS.invalid_password)}
                </Text>
              )}

              <View style={{ flex: 1 }} />

              <CustomButton
                label={getLabel(STRINGS.confirm)}
                isDisable={isInvalidPassword}
                width={SIZES.width - SIZES.simpleMargin * 2}
                height={SIZES.buttonHeight}
                onPress={handleConfirm}
              />
            </KeyboardAvoidingView>
          </View>
        </View>
      </HideKeyboard>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 45,
  },
  description: {
    marginTop: 24,
    color: COLOR.textSecondary,
    ...FONTS.t14r,
    marginBottom: 32,
    width: '100%',
  },
  textError: {
    color: COLOR.systemRedLight,
    marginTop: 8,
    ...FONTS.t12r,
    alignSelf: 'flex-start',
  },
});

export default ConfirmPasswordScreen;
