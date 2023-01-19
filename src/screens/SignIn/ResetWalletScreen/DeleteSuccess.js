import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setVisibleModal } from 'stores/reducer/isVisibleModalSlice';
import {
  FONTS,
  SIZES,
  COLOR,
  STRINGS,
  IMAGES,
  SCREEN_NAME,
} from '../../../constants';
import { DAORepository } from '../../../databases';
import PropTypes from 'prop-types';
import { setDeleteThisWalletModal } from 'stores/reducer/deleteThisWalletModalSlice';

const DeleteSuccess = ({ navigation }) => {
  const { t } = useTranslation();
  const disPatch = useDispatch();

  const turnOffModalConfirmDeleteWallet = () => {
    disPatch(setVisibleModal(false));
    disPatch(setDeleteThisWalletModal(false));
  };

  useEffect(() => {
    turnOffModalConfirmDeleteWallet();
    setTimeout(() => {
      DAORepository.getAllWallet().then(obj => {
        if (obj.length === 0) {
          navigation.navigate(SCREEN_NAME.onBoardingScreen);
        } else {
          navigation.reset({
            index: 0,
            routes: [
              { name: SCREEN_NAME.navigationBottomTab },
              { name: SCREEN_NAME.walletList },
            ],
          });
        }
      });
    }, 1000);
  }, []);

  return (
    <View style={styles.deleteSuccessContainer}>
      <Image source={IMAGES.deleteSuccess} resizeMode="cover" />

      <Text style={{ ...FONTS.t20b, color: COLOR.textPrimary, marginTop: 16 }}>
        {t(STRINGS.delete_Success)}
      </Text>
    </View>
  );
};

DeleteSuccess.propTypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  deleteSuccessContainer: {
    height: SIZES.heightScreen,
    width: SIZES.widthScreen,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLOR.simpleBackground,
  },
});

export default DeleteSuccess;
