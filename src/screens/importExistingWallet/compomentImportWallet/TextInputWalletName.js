import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { COLOR, CONSTANTS, FONTS, SIZES, STRINGS } from '../../../constants';
import CustomTextInput from '../../../components/CustomTextInput/CustomTextInput';
import { StyleSheet, Text, View } from 'react-native';
import stringFormat from '../../../components/StringFormat/StringFormat';
import { useTranslation } from 'react-i18next';
import RegexValue from '../../../constants/constants';

const TextInputWalletName = ({
  getWalletName = walletName => {},
  getWalletNameEnoughCharacter = walletNameEnoughCharacter => {},
}) => {
  const { t } = useTranslation();
  const paddingDimen = 1.2;

  const [errorWalletName, setErrorWalletName] = useState(false);
  const [focusWalletName, setFocusWalletName] = useState(false);
  const [walletNameLength, setWalletNameLength] = useState(false);
  const [walletTextPadding, setWalletTextPadding] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletNameEnoughCharacter, setWalletNameEnoughCharacter] =
    useState(false);

  useEffect(() => {
    getWalletName(walletName);
    getWalletNameEnoughCharacter(walletNameEnoughCharacter);
  });

  const checkTestRex = text => {
    const lowerCaseRegex = new RegExp(RegexValue.lowercaseText);
    const upperCaseRegex = new RegExp(RegexValue.uppercaseText);
    const numberRegex = new RegExp(RegexValue.numberText);
    const specialCharacterRegex = new RegExp(RegexValue.specialCharacterText);

    return (
      lowerCaseRegex.test(Text) ||
      upperCaseRegex.test(text) ||
      numberRegex.test(text) ||
      specialCharacterRegex.test(text)
    );
  };

  const style = StyleSheet.create({
    wallet_name_text_input: {
      marginTop: 16,
      borderRadius: SIZES.radius,
      padding: walletTextPadding ? paddingDimen : 0,
    },

    notification_of_wallet_name_text_input: {
      color:
        walletName.length <= CONSTANTS.maxWalletNameLength
          ? COLOR.textTermsCondition
          : COLOR.systemRedLight,
      marginTop: 8,
      marginBottom: 10,
    },
  });

  return (
    <View>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={COLOR.textInputBorderGradient}
        style={[style.wallet_name_text_input]}>
        <CustomTextInput
          label={t(STRINGS.wallet_name)}
          isPassword={false}
          width={
            walletTextPadding
              ? SIZES.width - (SIZES.simpleMargin + paddingDimen) * 2
              : SIZES.width - SIZES.simpleMargin * 2
          }
          onFocus={() => {
            setWalletTextPadding(true);
            setFocusWalletName(true);
            setWalletNameLength(true);
          }}
          onBlur={() => {
            setFocusWalletName(false);
            setWalletTextPadding(false);
            if (walletName === '') {
              setWalletNameLength(false);
              setWalletNameEnoughCharacter(false);
            } else if (walletName.length <= CONSTANTS.maxWalletNameLength) {
              setWalletNameEnoughCharacter(true);
            } else {
              setWalletNameEnoughCharacter(false);
            }
          }}
          getData={text => {
            setWalletName(text.trim());
            if (text.length > CONSTANTS.maxWalletNameLength) {
              setErrorWalletName(true);
              setWalletTextPadding(false);
            } else if (checkTestRex(walletName)) {
            } else {
              setErrorWalletName(false);
              if (focusWalletName) {
                setWalletTextPadding(true);
              } else {
                setWalletTextPadding(false);
              }
            }
          }}
          error={errorWalletName}
        />
      </LinearGradient>

      <Text style={[FONTS.t12r, style.notification_of_wallet_name_text_input]}>
        {!walletNameLength
          ? stringFormat(`${t(STRINGS.wallet_name_must_length)}`, [
              `${CONSTANTS.maxWalletNameLength}`,
            ])
          : `${t(STRINGS.input_length)}${walletName.length}/${
              CONSTANTS.maxWalletNameLength
            }`}
      </Text>
    </View>
  );
};

export default TextInputWalletName;
