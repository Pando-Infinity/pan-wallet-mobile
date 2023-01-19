import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLOR, FONTS, SIZES, STRINGS } from '../../../constants';
import stringFormat from '../../../components/StringFormat/StringFormat';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { Fragment } from 'react';

const ButtonImportBySeedPhrasePrivateKey = ({
  multiChain,
  stringLengthSeedPhrase,
  privateKeyLength,
  getDisplaySecretPhrase = displaySecretPhrase => {},
  getDisplayPrivateKey = displayPrivateKey => {},
  onPress = () => {},
  style,
  ...otherProps
}) => {
  const { t } = useTranslation();

  const [
    buttonImportRecoveryPhraseChoose,
    setButtonImportRecoveryPhraseChoose,
  ] = useState(true);
  const [displaySecretPhrase, setDisplaySecretPhrase] = useState(true);

  const [buttonImportPrivateKeyChoose, setButtonImportPrivateKeyChoose] =
    useState(false);
  const [displayPrivateKey, setDisplayPrivateKey] = useState(false);

  useEffect(() => {
    getDisplaySecretPhrase(displaySecretPhrase);
    getDisplayPrivateKey(displayPrivateKey);
  }, [displaySecretPhrase, displayPrivateKey]);

  const privateKeyValue = useMemo(
    () =>
      typeof privateKeyLength === 'object'
        ? stringFormat(
            `${t(STRINGS.private_key_contains_alphanumeric_character_solana)}`,
            [`${privateKeyLength[0]}`, `${privateKeyLength[1]}`],
          )
        : stringFormat(
            `${t(STRINGS.private_key_contains_alphanumeric_character)}`,
            [`${privateKeyLength}`],
          ),
    [privateKeyLength, t],
  );

  const handleImportFromSeedPhrase = useCallback(() => {
    setButtonImportRecoveryPhraseChoose(true);
    setButtonImportPrivateKeyChoose(false);
    setDisplaySecretPhrase(true);
    setDisplayPrivateKey(false);
    onPress();
  }, [onPress]);

  const handleImportFromPrivateKey = useCallback(() => {
    setButtonImportRecoveryPhraseChoose(false);
    setButtonImportPrivateKeyChoose(true);
    setDisplaySecretPhrase(false);
    setDisplayPrivateKey(true);
    onPress();
  }, [onPress]);

  const importButtonData = useMemo(
    () => [
      {
        isSelected: buttonImportRecoveryPhraseChoose,
        value: stringLengthSeedPhrase,
        title: t(STRINGS.import_using_recovery_phrase),
        onPress: handleImportFromSeedPhrase,
      },
      {
        isSelected: buttonImportPrivateKeyChoose,
        value: privateKeyValue,
        title: t(STRINGS.import_using_private_key),
        onPress: handleImportFromPrivateKey,
      },
    ],
    [
      buttonImportPrivateKeyChoose,
      buttonImportRecoveryPhraseChoose,
      handleImportFromPrivateKey,
      handleImportFromSeedPhrase,
      privateKeyValue,
      stringLengthSeedPhrase,
      t,
    ],
  );

  return multiChain ? (
    <Fragment />
  ) : (
    <FlatList
      style={style}
      scrollEnabled={false}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      numColumns={2}
      data={importButtonData}
      renderItem={({ item }) => (
        <ImportButton
          isSelected={item.isSelected}
          title={item.title}
          value={item.value}
          onPress={item.onPress}
          style={{ flex: 0.5, marginHorizontal: 8 }}
        />
      )}
      keyExtractor={(_, i) => i}
      {...otherProps}
    />
  );
};

const ImportButton = ({ isSelected, onPress, title, value, style }) => {
  return (
    <TouchableOpacity
      style={[styles.contain_button_import_recovery_phrase, style]}
      onPress={onPress}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={
          isSelected
            ? COLOR.textInputBorderGradient
            : COLOR.borderGradientOneColor
        }
        style={styles.contain_button_import_gradient}>
        <View
          style={[
            styles.button_import,
            {
              backgroundColor: isSelected
                ? COLOR.gray3
                : COLOR.buttonImportWalletDisableColor,
            },
          ]}>
          <Text
            style={[
              FONTS.t14b,
              styles.title,
              {
                color: isSelected ? COLOR.white : COLOR.gray7,
              },
            ]}>
            {title}
          </Text>
          <Text
            style={[
              FONTS.t12r,
              {
                color: isSelected ? COLOR.textTermsCondition : COLOR.gray6,
              },
            ]}>
            {value}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

ImportButton.propTypes = {
  isSelected: PropTypes.bool,
  onPress: PropTypes.func,
  title: PropTypes.string,
  value: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

ButtonImportBySeedPhrasePrivateKey.propTypes = {
  multiChain: PropTypes.bool,
  stringLengthSeedPhrase: PropTypes.string,
  privateKeyLength: PropTypes.number || PropTypes.array,
  getDisplaySecretPhrase: PropTypes.func,
  getDisplayPrivateKey: PropTypes.func,
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  contain_button_import_recovery_phrase: {
    borderRadius: SIZES.radius,
  },

  contain_button_import_gradient: {
    padding: 1,
    borderRadius: SIZES.radius,
  },

  button_import: {
    borderRadius: SIZES.radius,
    padding: 8,
    height: '100%',
  },

  title: {
    marginBottom: 4,
  },
});

export default ButtonImportBySeedPhrasePrivateKey;
