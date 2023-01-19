import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  COLOR,
  FONTS,
  SIZES,
  IMAGES,
  STRINGS,
  SCREEN_NAME,
} from '../../constants';
import CustomBackButton from '../../components/CustomBackButton/CustomBackButton';
import CustomButton from '../../components/CustomButton/CustomButton';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';
import { KeychainRepository } from '../../databases';
import { useDispatch } from 'react-redux';
import { setStatusResetPassword } from 'stores/reducer/passwordSlice';
import { useNavigation } from '@react-navigation/native';
import CustomPasswordInput from 'components/inputs/CustomPasswordInput';

const ConfirmYourPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [isInvalidPassword, setIsInvalidPassword] = useState(true);
  const [isErrorInput, setIsErrorInput] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  const handleResetPassword = () => {
    navigation.navigate(SCREEN_NAME.createPassWordScreen);
    dispatch(setStatusResetPassword(true));
  };

  const handleConfirm = () => {
    KeychainRepository.getPassword()
      .then(result => {
        if (password === result) {
          navigation.navigate(SCREEN_NAME.viewSecretRecoveryPhrase);
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
    <HideKeyboard>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={IMAGES.backgroundConfirmPassword}
          style={styles.container}
          resizeMode="cover">
          <View style={styles.button_back}>
            <CustomBackButton onPress={() => navigation.goBack()} />
          </View>
          <KeyboardAvoidingView
            style={styles.container_main}
            keyboardVerticalOffset={10}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={[styles.title, FONTS.t30b]}>
                {t(STRINGS.confirm_your_password)}
              </Text>

              <Text style={styles.description}>
                {t(STRINGS.confirm_password_description)}
              </Text>

              <CustomPasswordInput
                label={t(STRINGS.your_password)}
                value={password}
                onChangeText={setPassword}
                error={isErrorInput}
                onFocus={() => {
                  setIsErrorInput(false);
                  setIsFocus(true);
                }}
                onBlur={() => setIsFocus(false)}
              />

              {isErrorInput && (
                <Text style={[styles.textError, FONTS.t12r]}>
                  {t(STRINGS.invalid_password)}
                </Text>
              )}

              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                }}
                onPress={handleResetPassword}>
                <Text style={styles.button_reset_password}>
                  {t(STRINGS.reset_password)}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={{ flex: 1 }} />

            <View
              style={[
                styles.container_button,
                { marginBottom: isFocus ? 0 : SIZES.heightScreen * 0.065 },
              ]}>
              <CustomButton
                label={t(STRINGS.confirm)}
                isDisable={isInvalidPassword}
                width={SIZES.width - SIZES.simpleMargin * 2}
                height={SIZES.buttonHeight}
                onPress={handleConfirm}
              />
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    </HideKeyboard>
  );
};

export default ConfirmYourPasswordScreen;

const styles = StyleSheet.create({
  container: {
    paddingStart: 16,
    paddingEnd: 16,
    flex: 1,
  },

  button_back: {
    alignItems: 'flex-start',
    marginTop: 56,
  },

  container_main: {
    flex: 1,
  },

  title: {
    color: COLOR.white,
    letterSpacing: -0.03,
    marginTop: 26,
  },

  description: {
    marginTop: 12,
    textAlign: 'left',
    color: COLOR.textSecondary,
    ...FONTS.t14r,
    marginBottom: 48,
  },

  textError: {
    color: COLOR.systemRedLight,
    marginTop: 8,
  },

  container_button: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  button_reset_password: {
    color: COLOR.primaryActionLink1,
    marginTop: 22,
    ...FONTS.t12b,
  },
});
