import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Keyboard,
  Platform,
  NativeModules,
} from 'react-native';
import {
  APP_THEMES,
  IMAGES,
  STRINGS,
  SCREEN_NAME,
  TIME_OUT,
  NATIVE_ASYNC_STORAGE,
} from '../../../constants';
import CustomButton from '../../../components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';
import { useSelector, useDispatch } from 'react-redux';
import { setVisibleModal } from 'stores/reducer/isVisibleModalSlice';
import LinearGradient from 'react-native-linear-gradient';
import Loading from '../../../components/Loading/Loading';
import { DAORepository, storage, NativeAsyncStorage } from '../../../databases';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';
import en from '../../../constants/translations/en';
import vi from '../../../constants/translations/vi';
import ja from '../../../constants/translations/ja';
import ko from '../../../constants/translations/ko';
import * as RNLocalize from 'react-native-localize';

const LANGUAGES = { en, vi, ja, ko };
const LANG_CODES = Object.keys(LANGUAGES);
const ShowEraseQuestion = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const disPatch = useDispatch();

  const { isVisibleModal } = useSelector(state => state.isVisibleModal);

  const [showView, setShowView] = useState(screenName.question);
  const [textInput, setTextInput] = useState();
  const [disableButton, setDisableButton] = useState(true);

  const didTapEraseButton = () => {
    if (textInput === t(STRINGS.erase)) {
      setShowView(screenName.deleting);
      setTimeout(() => {
        deletingWallet();
        navigation.navigate(SCREEN_NAME.deleteSuccessScreen);
      }, 3000);
    }
  };

  const deletingWallet = () => {
    DAORepository.deleteAllObject();
    NativeAsyncStorage.saveData(TIME_OUT.timeOutState, 'false');
    NativeAsyncStorage.saveData(TIME_OUT.timeOut, TIME_OUT.never);
    NativeAsyncStorage.saveData(TIME_OUT.currentScreen, '');
    NativeAsyncStorage.saveData(NATIVE_ASYNC_STORAGE.firstSetTimeOut, 'false');
    storage.clearAll();

    const findBestAvailableLanguage =
      RNLocalize.findBestAvailableLanguage(LANG_CODES);
    const languageCode =
      findBestAvailableLanguage !== undefined
        ? findBestAvailableLanguage.languageTag
        : 'en';
    i18n.changeLanguage(languageCode).done();
    Platform.OS === 'android'
      ? NativeModules.MultilingualModule.updateLanguage(languageCode)
      : NativeModules.MultilanguageModule.updateLanguage(languageCode);
  };

  const renderQuestionView = () => {
    return (
      <Modal
        isVisible={isVisibleModal}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropColor={COLOR.black}
        deviceHeight={SIZES.heightScreen}
        transparent={true}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image source={IMAGES.eraseImage} resizeMode="cover" />
          </View>

          <View style={styles.body}>
            <Text style={{ ...FONTS.t16b, color: COLOR.textPrimary }}>
              {t(STRINGS.eraseQuestionTitle)}
            </Text>

            <Text
              style={{ ...FONTS.t14r, color: COLOR.textSecondary, top: 12 }}>
              {t(STRINGS.eraseQuestionSupTitle)}
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={{
                width: SIZES.width * 0.35,
                height: SIZES.buttonHeight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => disPatch(setVisibleModal(false))}>
              <Text style={{ ...FONTS.t14b, color: COLOR.textPrimary }}>
                {t(STRINGS.cancelText)}
              </Text>
            </TouchableOpacity>

            <CustomButton
              label={t(STRINGS.continue)}
              width={SIZES.width * 0.4}
              height={SIZES.buttonHeight}
              isDisable={false}
              onPress={() => setShowView(screenName.confirm)}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const renderConfirmEraseView = () => {
    return (
      <Modal
        onBackdropPress={() => Keyboard.dismiss()}
        isVisible={isVisibleModal}
        backdropOpacity={0.5}
        avoidKeyboard={true}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropColor={COLOR.black}
        deviceHeight={SIZES.heightScreen}
        transparent={true}>
        <HideKeyboard>
          <View style={[styles.conFirmContainer]}>
            <View style={styles.header}>
              <Text
                style={{
                  ...FONTS.t16b,
                  color: COLOR.textPrimary,
                }}>
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
                    paddingHorizontal: 10,
                    color: COLOR.textPrimary,
                    borderRadius: SIZES.radius,
                    backgroundColor: COLOR.simpleBackground,
                    height: SIZES.buttonHeight,
                  }}
                  onChangeText={text => {
                    setTextInput(text);
                    if (text === t(STRINGS.erase)) {
                      setDisableButton(false);
                    } else {
                      setDisableButton(true);
                    }
                  }}
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
                  setDisableButton(true);
                  disPatch(setVisibleModal(false));
                  setShowView(screenName.question);
                }}>
                <Text style={{ ...FONTS.t14b, color: COLOR.textPrimary }}>
                  {t(STRINGS.cancelText)}
                </Text>
              </TouchableOpacity>

              <CustomButton
                label={t(STRINGS.delete)}
                width={SIZES.width * 0.4}
                height={SIZES.buttonHeight}
                isDisable={disableButton}
                onPress={() => didTapEraseButton()}
              />
            </View>
          </View>
        </HideKeyboard>
      </Modal>
    );
  };

  const renderDeleting = () => {
    return (
      <Modal
        isVisible={isVisibleModal}
        backdropOpacity={0.9}
        animationIn="zoomIn"
        animationOut="zoomOut">
        <StatusBar translucent={true} />
        <Loading
          imageSource={IMAGES.deleteImage}
          title={STRINGS.deleting_your_wallet}
          supTitle={STRINGS.create_password_hint}
        />
      </Modal>
    );
  };

  const renderDeleteSuccess = () => {
    return (
      <Modal
        isVisible={isVisibleModal}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropColor={COLOR.black}
        deviceHeight={SIZES.heightScreen}
        transparent={true}>
        <View style={styles.deleteSuccessContainer}>
          <Image source={IMAGES.deleteSuccess} resizeMode="cover" />
          <Text
            style={{ ...FONTS.t20b, color: COLOR.textPrimary, marginTop: 16 }}>
            {t(STRINGS.delete_Success)}
          </Text>
        </View>
      </Modal>
    );
  };

  const renderContent = () => {
    switch (showView) {
      case screenName.question:
        return renderQuestionView();
      case screenName.confirm:
        return renderConfirmEraseView();
      case screenName.deleting:
        return renderDeleting();
      case screenName.deleteSuccess:
        return renderDeleteSuccess();
    }
  };

  return renderContent();
};

const screenName = {
  question: 'Erase Question Screen',
  confirm: 'Erase Screen',
  deleting: 'Deleting Screen',
  deleteSuccess: 'Delete Success Screen',
};

const { COLOR, SIZES, FONTS } = APP_THEMES;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLOR.simpleBackground,
    borderRadius: 16,
    paddingStart: SIZES.simpleMargin,
    paddingEnd: SIZES.simpleMargin,
  },

  conFirmContainer: {
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

  deleteSuccessContainer: {
    height: SIZES.height,
    width: SIZES.width,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLOR.simpleBackground,
  },
});

export default ShowEraseQuestion;
