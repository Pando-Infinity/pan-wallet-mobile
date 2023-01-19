import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import Modal from 'react-native-modal';
import { useTranslation } from 'react-i18next';
import {
  STRINGS,
  FONTS,
  COLOR,
  SIZES,
  IMAGES,
  SCREEN_NAME,
} from '../../../constants';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../../components/CustomButton/CustomButton';
import Loading from '../../../components/Loading/Loading';
import { useSelector, useDispatch } from 'react-redux';
import { DAORepository } from '../../../databases';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';
import { setDeleteThisWalletModal } from 'stores/reducer/deleteThisWalletModalSlice';
import PropTypes from 'prop-types';
import {
  setListAddress,
  setListWallet,
} from 'stores/reducer/dataListWalletSlice';

const ShowConfirmDeletingWallet = ({ navigation, walletID }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { deleteThisWalletModal } = useSelector(
    state => state.deleteThisWalletModal,
  );
  const listWallet = useSelector(state => state.dataListWallet.listWallet);
  const listAddress = useSelector(state => state.dataListWallet.listAddress);

  const [textInput, setTextInput] = useState('');
  const [isDisable, setDisable] = useState(true);
  const [showView, setShowView] = useState(screenInput.confirmDelete);

  let walletListCurrent = [];
  const addressListCurrent = [];

  const deletingWallet = () => {
    const currentWallet = listWallet.filter(item => item._id === walletID);

    const indexOfCurrentWallet = listWallet.indexOf(currentWallet[0]);

    walletListCurrent = listWallet.filter(item => item._id !== walletID);
    for (let i = 0; i < listAddress.length; i++) {
      if (i !== indexOfCurrentWallet) {
        addressListCurrent.push(listAddress[i]);
      }
    }

    dispatch(setListWallet(walletListCurrent));
    dispatch(setListAddress(addressListCurrent));

    DAORepository.deleteWalletByID(walletID).done();
  };

  const didTapEraseButton = () => {
    if (textInput === t(STRINGS.erase)) {
      setShowView(screenInput.deleting);
      deletingWallet();
      setTimeout(() => {
        navigation.navigate(SCREEN_NAME.deleteSuccessScreen);
      }, 3000);
    }
  };

  const renderConfirmDeleteWallet = () => (
    <Modal
      onBackdropPress={() => Keyboard.dismiss()}
      isVisible={deleteThisWalletModal}
      backdropOpacity={0.5}
      avoidKeyboard={true}
      backdropColor={COLOR.black}
      deviceHeight={SIZES.heightScreen}
      animationIn="zoomIn"
      animationOut="zoomOut"
      transparent={true}>
      <HideKeyboard>
        <View style={[styles.conFirmContainer]}>
          <View style={styles.header}>
            <Text style={{ ...FONTS.t16b, color: COLOR.textPrimary }}>
              {t(STRINGS.resetCurrentWallet)}
            </Text>
          </View>

          <View style={styles.body}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={COLOR.textInputBorderGradient}
              style={{ borderRadius: SIZES.radius }}>
              <TextInput
                autoFocus={true}
                style={{
                  margin: 2,
                  color: COLOR.textPrimary,
                  paddingHorizontal: 10,
                  borderRadius: SIZES.radius,
                  backgroundColor: COLOR.simpleBackground,
                  height: SIZES.buttonHeight,
                }}
                onChangeText={text => setTextInput(text)}
              />
            </LinearGradient>

            <Text
              style={{
                ...FONTS.t14r,
                color: COLOR.textSecondary,
                marginTop: 32,
              }}>
              {t(STRINGS.eraseSupTitle)}
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={{
                width: '45%',
                height: SIZES.buttonHeight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setDisable(true);
                dispatch(setDeleteThisWalletModal(false));
              }}>
              <Text style={{ ...FONTS.t14b, color: COLOR.textPrimary }}>
                {t(STRINGS.cancelText)}
              </Text>
            </TouchableOpacity>

            <CustomButton
              label={t(STRINGS.delete)}
              width={SIZES.width * 0.4}
              height={SIZES.buttonHeight}
              isDisable={isDisable}
              onPress={() => didTapEraseButton()}
            />
          </View>
        </View>
      </HideKeyboard>
    </Modal>
  );

  const renderDeleting = () => {
    return (
      <Modal
        isVisible={deleteThisWalletModal}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropColor={COLOR.black}
        deviceHeight={SIZES.heightScreen}
        transparent={true}>
        <Loading
          imageSource={IMAGES.deleteImage}
          title={STRINGS.deleting_your_wallet}
          supTitle={STRINGS.create_password_hint}
        />
      </Modal>
    );
  };

  const renderContent = () => {
    switch (showView) {
      case screenInput.confirmDelete:
        return renderConfirmDeleteWallet();
      case screenInput.deleting:
        return renderDeleting();
    }
  };

  useEffect(() => {
    if (textInput === t(STRINGS.erase)) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [textInput]);

  return renderContent();
};

const screenInput = {
  confirmDelete: 'Confirm Delete Wallet',
  deleting: 'Deleting Screen',
  deleteSuccess: 'Delete Success',
};

ShowConfirmDeletingWallet.propTypes = {
  navigation: PropTypes.object,
  walletID: PropTypes.number,
};

const styles = StyleSheet.create({
  conFirmContainer: {
    width: '100%',
    backgroundColor: COLOR.simpleBackground,
    paddingStart: SIZES.simpleMargin,
    paddingEnd: SIZES.simpleMargin,
    borderRadius: 16,
  },

  header: {
    marginTop: 32,
  },

  body: {
    justifyContent: 'center',
    marginTop: 24,
  },

  footer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 40,
    marginBottom: 24,
  },

  borderGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
  },
});

export default ShowConfirmDeletingWallet;
