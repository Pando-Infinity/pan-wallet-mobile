import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomButton from '../../../components/CustomButton/CustomButton';
import { COLOR, FONTS, SIZES, STRINGS, URLConst } from '../../../constants';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const ButtonImportWallet = ({
  seedPhraseEnoughWord,
  privateKeyEnoughWord,
  walletNameEnoughCharacter,
  onPress = () => {},
}) => {
  const { t } = useTranslation();

  return (
    <View style={{ alignItems: 'center' }}>
      <View>
        <CustomButton
          label={t(STRINGS.import)}
          width={SIZES.width - SIZES.simpleMargin * 2}
          height={SIZES.buttonHeight}
          isDisable={
            (!seedPhraseEnoughWord && !privateKeyEnoughWord) ||
            !walletNameEnoughCharacter
          }
          onPress={() => onPress()}
        />
      </View>

      <Text style={[style.text_button_terms_condition, FONTS.t12r]}>
        {t(STRINGS.by_proceeding_you_agree_to_these)}
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(URLConst.terms_and_conditions).catch()
          }>
          <Text
            style={[
              FONTS.t12b,
              { color: COLOR.shade3, transform: [{ translateY: 3 }] },
            ]}>
            {t(STRINGS.terms_and_conditions)}
          </Text>
        </TouchableOpacity>
      </Text>
    </View>
  );
};

ButtonImportWallet.propTypes = {
  seedPhraseEnoughWord: PropTypes.bool,
  privateKeyEnoughWord: PropTypes.bool,
  walletNameEnoughCharacter: PropTypes.bool,
  onPress: PropTypes.func,
};

const style = StyleSheet.create({
  text_button_terms_condition: {
    color: COLOR.textTermsCondition,
    marginTop: 30,
    marginBottom: SIZES.heightScreen * 0.069,
  },
});

export default ButtonImportWallet;
