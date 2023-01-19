import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  IMAGES,
  COLOR,
  FONTS,
  SIZES,
  SCREEN_NAME,
  STRINGS,
  TOKEN_NAME,
  CONSTANTS,
} from 'constants';
import CustomButton from 'components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import { CommonModal } from 'components/common';
import { storage } from 'databases';
import { useNavigation } from '@react-navigation/native';

const EmptyNft = ({ style, ...otherProps }) => {
  const { t: getLabel } = useTranslation();
  const navigation = useNavigation();

  const [isVisible, toggleVisible] = useReducer(status => !status, false);

  const handleButtonImport = () => {
    const walletChain = storage.getString(CONSTANTS.rememberWalletChainKey);
    if (walletChain === TOKEN_NAME.bitcoin) {
      toggleVisible();
    } else {
      navigation.navigate(SCREEN_NAME.importNFTs);
    }
  };

  return (
    <View style={[styles.wrapper, style]} {...otherProps}>
      <Image source={IMAGES.EmptyNft} style={styles.image} />
      <Text style={styles.title}>{getLabel(STRINGS.noNftYet)}</Text>
      <CustomButton
        label={getLabel(STRINGS.importNFTs)}
        height={40}
        width={167}
        labelProps={{ style: { ...FONTS.t14b } }}
        onPress={handleButtonImport}
      />
      <CommonModal
        isVisible={isVisible}
        onClose={toggleVisible}
        title={getLabel(STRINGS.error)}
        message={getLabel(STRINGS.BTC_dose_not_support)}
        buttonLabel={getLabel(STRINGS.ok)}
      />
    </View>
  );
};

EmptyNft.propTypes = {
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 333,
  },
  image: {
    height: 120,
    width: 120,
  },
  title: {
    color: COLOR.textSecondary,
    ...FONTS.t14r,
    marginTop: SIZES.simpleSpace * 3,
    marginBottom: SIZES.simpleSpace * 2,
  },
});

export default EmptyNft;
