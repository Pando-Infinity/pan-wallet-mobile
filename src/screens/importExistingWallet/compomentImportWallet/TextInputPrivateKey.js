import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLOR, FONTS, SIZES, STRINGS } from '../../../constants';
import CustomTextInput from '../../../components/CustomTextInput/CustomTextInput';
import { useTranslation } from 'react-i18next';
import stringFormat from '../../../components/StringFormat/StringFormat';
import PropTypes from 'prop-types';

const TextInputPrivateKey = ({
  privateKeyLength,
  isPadding,
  isError,
  isInvalid,
  getPrivateKey = privateKey => {},
  onFocus = () => {},
  onBlur = () => {},
  isScanner,
  dataScanner,
  onChangeStatusScanner = () => {},
  autoFocus,
}) => {
  const { t } = useTranslation();

  const paddingDimen = 1.2;

  const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    getPrivateKey(privateKey);
  }, [privateKey]);

  return (
    <View>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={COLOR.textInputBorderGradient}
        style={[
          styles.private_key_text_input,
          { padding: isPadding ? paddingDimen : 0 },
        ]}>
        <CustomTextInput
          label={t(STRINGS.private_key)}
          isPassword={true}
          multiline={Platform.OS === 'android'}
          width={
            isPadding
              ? SIZES.width - (SIZES.simpleMargin + paddingDimen) * 2
              : SIZES.width - SIZES.simpleMargin * 2
          }
          error={isError}
          onFocus={() => onFocus()}
          onBlur={() => onBlur()}
          getData={text => {
            setPrivateKey(text.trim());
          }}
          dataScanner={dataScanner}
          statusScanner={isScanner}
          onChangeStatusScanner={() => {
            onChangeStatusScanner();
          }}
          autoFocus={autoFocus}
        />
      </LinearGradient>

      <Text
        style={[
          FONTS.t12r,
          styles.notification_private_key_text_input,
          {
            color: !isError ? COLOR.textTermsCondition : COLOR.systemRedLight,
            display: isError ? 'flex' : 'none',
          },
        ]}>
        {!isInvalid
          ? typeof privateKeyLength === 'object'
            ? stringFormat(
                `${t(
                  STRINGS.private_key_contains_alphanumeric_character_solana,
                )}`,
                [`${privateKeyLength[0]}`, `${privateKeyLength[1]}`],
              )
            : stringFormat(
                `${t(STRINGS.private_key_contains_alphanumeric_character)}`,
                [`${privateKeyLength}`],
              )
          : t(STRINGS.invalid_private_key)}
      </Text>
    </View>
  );
};

TextInputPrivateKey.propTypes = {
  privateKeyLength: PropTypes.number,
  isPadding: PropTypes.bool,
  isError: PropTypes.bool,
  isInvalid: PropTypes.bool,
  getPrivateKey: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  isScanner: PropTypes.bool,
  dataScanner: PropTypes.string,
  onChangeStatusScanner: PropTypes.func,
  autoFocus: PropTypes.bool,
};

const styles = StyleSheet.create({
  private_key_text_input: {
    marginTop: 10,
    borderRadius: SIZES.radius,
  },

  notification_private_key_text_input: {
    marginTop: 8,
  },
});

export default TextInputPrivateKey;
