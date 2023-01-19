import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { COLOR, FONTS, SIZES, STRINGS } from '../../../constants';
import CustomTextInput from '../../../components/CustomTextInput/CustomTextInput';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const TextInputSeedPhrase = ({
  isMultiChain,
  stringLengthSeedPhrase,
  isInvalid,
  isError,
  isPadding,
  getSeedPhrase = seedPhrase => {},
  onFocus = () => {},
  onBlur = () => {},
  isScanner,
  dataScanner,
  onChangeStatusScanner = () => {},
  autoFocus,
}) => {
  const { t } = useTranslation();

  const paddingDimen = 1.2;

  const [seedPhrase, setSeedPhrase] = useState('');

  useEffect(() => {
    getSeedPhrase(seedPhrase);
  }, [seedPhrase]);

  return (
    <View>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={COLOR.textInputBorderGradient}
        style={[
          styles.secret_recovery_phrase_text_input,
          { padding: isPadding ? paddingDimen : 0 },
        ]}>
        <CustomTextInput
          label={t(STRINGS.secret_recovery_phrase)}
          isPassword={true}
          multiline={Platform.OS === 'android'}
          width={
            isPadding
              ? SIZES.width - (SIZES.simpleMargin + paddingDimen) * 2
              : SIZES.width - SIZES.simpleMargin * 2
          }
          error={isError}
          onFocus={() => {
            onFocus();
          }}
          onBlur={() => {
            onBlur();
          }}
          getData={text => {
            setSeedPhrase(text.trim());
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
          styles.notification_secret_recovery_phrase_text_input,
          {
            color: !isError ? COLOR.textTermsCondition : COLOR.systemRedLight,
            display: isMultiChain || isError ? 'flex' : 'none',
          },
        ]}>
        {!isInvalid
          ? stringLengthSeedPhrase
          : t(STRINGS.invalid_secret_recovery_phrase)}
      </Text>
    </View>
  );
};

TextInputSeedPhrase.propTypes = {
  isMultiChain: PropTypes.bool,
  stringLengthSeedPhrase: PropTypes.string,
  isInvalid: PropTypes.bool,
  isError: PropTypes.bool,
  isPadding: PropTypes.bool,
  getSeedPhrase: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  isScanner: PropTypes.bool,
  dataScanner: PropTypes.string,
  onChangeStatusScanner: PropTypes.func,
  autoFocus: PropTypes.bool,
};

const styles = StyleSheet.create({
  secret_recovery_phrase_text_input: {
    marginTop: 10,
    borderRadius: SIZES.radius,
  },

  notification_secret_recovery_phrase_text_input: {
    marginTop: 8,
  },
});

export default TextInputSeedPhrase;
