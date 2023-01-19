import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { STRINGS, SIZES, FONTS, COLOR, CONSTANTS } from '../../../constants';
import Modal from 'react-native-modal';
import CustomButton from '../../../components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import CustomTextInput from '../../../components/inputs/CustomTextInput';
import { useSelector, useDispatch } from 'react-redux';
import { setVisibleChangeWalletName } from 'stores/reducer/isVisiableChangeWalletName';
import { DAORepository } from '../../../databases';
import { setChangeWalletName } from 'stores/reducer/isChangeWalletNameSlice';
import stringFormat from '../../../components/StringFormat/StringFormat';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';
import PropTypes from 'prop-types';
import { setListWallet } from 'stores/reducer/dataListWalletSlice';

const ChangeWalletName = ({ idWallet }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { isVisibleChangeWalletName } = useSelector(
    state => state.isVisibleChangeWalletName,
  );
  const listWallet = useSelector(state => state.dataListWallet.listWallet);

  const [textData, setTextData] = useState('');
  const [error, setError] = useState(false);
  const [supText, setSupText] = useState(
    stringFormat(t(STRINGS.wallet_name_20_characters), [
      `${CONSTANTS.walletNameCharacterLimit}`,
    ]),
  );

  const onResetState = () => {
    setTextData('');
    setError(false);
  };

  const renderLabelCheckTextInput = useCallback(
    text => {
      if (text.length > 0) {
        setSupText(
          `${t(STRINGS.input_length)}${text.length}/${
            CONSTANTS.walletNameCharacterLimit
          }`,
        );
        if (text.length > CONSTANTS.walletNameCharacterLimit) {
          setError(true);
        } else {
          setError(false);
        }
      } else {
        setError(false);
        setSupText(
          stringFormat(t(STRINGS.wallet_name_20_characters), [
            `${CONSTANTS.walletNameCharacterLimit}`,
          ]),
        );
      }
    },
    [t],
  );

  const updateName = newName => {
    const wallet = listWallet.filter(item => item._id === idWallet)[0];
    wallet.name = newName;

    return listWallet.map(item => (item._id !== idWallet ? item : wallet));
  };

  const didTapChangeWalletName = async name => {
    await DAORepository.updateWalletName(name, idWallet).then(() => {
      dispatch(setListWallet(updateName(name)));
      dispatch(setChangeWalletName(true));
      dispatch(setVisibleChangeWalletName(false));
    });
    onResetState();
  };

  useEffect(() => {
    renderLabelCheckTextInput(textData);
  }, [textData, renderLabelCheckTextInput]);

  return (
    <Modal
      onBackdropPress={() => Keyboard.dismiss()}
      isVisible={isVisibleChangeWalletName}
      backdropOpacity={0.5}
      avoidKeyboard={true}
      backdropColor={COLOR.black}
      deviceHeight={SIZES.heightScreen}
      animationIn="zoomIn"
      animationOut="zoomOut"
      transparent={true}>
      <HideKeyboard>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
              {t(STRINGS.change_wallet_name)}
            </Text>
          </View>

          <View style={styles.body}>
            <CustomTextInput
              label={t(STRINGS.wallet_name)}
              error={error}
              value={textData}
              onChangeText={setTextData}
              autoFocus
              linearProps={{
                colors: COLOR.gradient3,
                style: { padding: 1, borderRadius: 6 },
              }}
            />

            <Text
              style={{
                ...FONTS.t12r,
                color: !error ? COLOR.textSecondary : COLOR.systemRedLight,
                marginTop: 12,
              }}>
              {supText}
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
                dispatch(setVisibleChangeWalletName(false));
                onResetState();
              }}>
              <Text style={{ ...FONTS.t14b, color: COLOR.textPrimary }}>
                {t(STRINGS.cancelText)}
              </Text>
            </TouchableOpacity>

            <CustomButton
              label={t(STRINGS.change)}
              width={SIZES.width * 0.4}
              height={SIZES.buttonHeight}
              isDisable={textData.length === 0 || error}
              onPress={() => didTapChangeWalletName(textData)}
            />
          </View>
        </View>
      </HideKeyboard>
    </Modal>
  );
};

ChangeWalletName.propTypes = {
  idWallet: PropTypes.number,
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    marginTop: SIZES.height / 2 - SIZES.height * 0.6,
    borderRadius: 16,
    backgroundColor: COLOR.simpleBackground,
    paddingHorizontal: 16,
  },

  header: {
    width: '100%',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
  },

  body: {
    width: '100%',
  },

  textInput: {
    borderRadius: SIZES.radius,
    padding: 1,
    marginBottom: 20,
  },

  footer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
});

export default ChangeWalletName;
