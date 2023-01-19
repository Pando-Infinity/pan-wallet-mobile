import React, {
  useEffect,
  createRef,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  Keyboard,
  StatusBar,
  ScrollView,
  Platform,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
  KeyboardAvoidingView,
} from 'react-native';
import {
  FONTS,
  SIZES,
  STRINGS,
  COLOR,
  IMAGES,
  ICONS,
  TOKEN_NAME,
  CONSTANTS,
  CONSTANT_EVENT_EMITTER,
} from '../../constants';
import { useTranslation } from 'react-i18next';
import { storage } from '../../databases';
import Constants from '../../constants/constants';
import LinearGradient from 'react-native-linear-gradient';
import { netWorkListCustomToken } from 'models/TokenData';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import Modal from 'react-native-modal';
import Loading from 'components/Loading/Loading';
import CustomTextInput from 'components/CustomTextInput/CustomTextInput';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';
import CustomButton from 'components/CustomButton/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ethereum } from 'walletCore/index';
import { getAllNFTsFromOwner } from '../../api/GetNFTsFromImport';
import {
  isValidateMintAddress,
  isValidateMintAddressNFT,
} from 'service/SolanaService';
import { getNftByOwner } from 'walletCore/NftHelper/getNftMetadata';
import ErrorModalView from 'components/modals/errorModal';
import { setNftErrorLabel } from 'stores/reducer/nftErrorSlice';

const { ScannerModule } = NativeModules;
const qrModule = NativeModules.QRCodeModule;

const ImportNFTs = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const bs = createRef();
  const fall = new Animated.Value(1);
  const disPatch = useDispatch();
  const ETHAddress = storage.getString(Constants.addressOfETHKey);
  const BSCAddress = storage.getString(Constants.addressOfBSCKey);
  const SOLAddress = storage.getString(Constants.addressOfSOLKey);

  const [isFocusContractAddress, setFocusContractAddress] = useState(false);
  const [isFocusID, setFocusID] = useState(false);
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [contractAddressText, setContractAddressText] = useState('');
  const [statusScannerAddress, setStatusScannerAddress] = useState(false);
  const [dataScannerAddress, setDataScannerAddress] = useState('');
  const [resetTextData, setResetTextData] = useState(false);
  const [isErrorContractAddress, setErrorContractAddress] = useState(false);
  const [isErrorID, setErrorID] = useState(false);
  const [idText, setIDText] = useState('');
  const [displayBlockContainer, setDisplayBlockContainer] = useState(false);

  const [isVisibleErrorModal, setVisibleErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [isShowKeyboardStatus, setIsShowKeyboardStatus] = useState(false);

  const walletFirstChain = storage.getString(Constants.firstChainTypeKey);
  const walletID = useRef(
    storage.getNumber(Constants.rememberWalletIDKey) !== undefined
      ? storage.getNumber(Constants.rememberWalletIDKey)
      : 1,
  );
  const walletChain = useRef(
    storage.getString(Constants.rememberWalletChainKey) !== undefined
      ? storage.getString(Constants.rememberWalletChainKey)
      : walletFirstChain,
  );
  const [networkName, setNetworkName] = useState(
    walletChain.current === TOKEN_NAME.multiChain
      ? TOKEN_NAME.ethereum
      : walletChain.current,
  );

  const { nftErrorLabel } = useSelector(state => state.nftErrorLabel);

  const checkValidETHAddress = useCallback(
    address => {
      if (
        contractAddressText !== '' &&
        Ethereum.isValidETHAddress(address) === false
      ) {
        setErrorContractAddress(true);
        setFocusContractAddress(false);
      } else {
        setErrorContractAddress(false);
      }
    },
    [contractAddressText],
  );

  const checkValidSOLAddress = useCallback(
    async address => {
      if (
        (await isValidateMintAddress(address)) === false &&
        contractAddressText !== ''
      ) {
        setErrorContractAddress(true);
        setFocusContractAddress(false);
      } else {
        setErrorContractAddress(false);
      }
    },
    [contractAddressText],
  );

  const checkValidContractAddress = useCallback(() => {
    switch (networkName) {
      case TOKEN_NAME.solana: {
        checkValidSOLAddress(contractAddressText);
        break;
      }
      case TOKEN_NAME.ethereum: {
        checkValidETHAddress(contractAddressText);
        break;
      }
      case TOKEN_NAME.smartChain: {
        checkValidETHAddress(contractAddressText);
        break;
      }
      default: {
        break;
      }
    }
  }, [
    checkValidETHAddress,
    checkValidSOLAddress,
    contractAddressText,
    networkName,
  ]);

  const checkValidID = useCallback(() => {
    const numericRegex = new RegExp(/^[0-9]+$/, 'g');
    const isValidNumber = numericRegex.test(idText);

    if (!idText || isValidNumber) {
      setErrorID(false);
    } else {
      setErrorID(true);
      setFocusID(false);
    }
  }, [idText]);

  const checkEnableButtonImport = () => {
    if (networkName === TOKEN_NAME.solana) {
      return contractAddressText !== '' && isErrorContractAddress === false;
    }
    return (
      contractAddressText !== '' &&
      isErrorContractAddress === false &&
      isErrorID === false &&
      idText !== ''
    );
  };

  const renderOwnerAddress = networkName => {
    switch (networkName) {
      case TOKEN_NAME.ethereum:
        return ETHAddress;
      case TOKEN_NAME.smartChain:
        return BSCAddress;
      case TOKEN_NAME.solana:
        return SOLAddress;
    }
  };

  const didTapButtonImport = async () => {
    setIsVisibleModal(true);
    if (await isValidateMintAddressNFT(contractAddressText, networkName)) {
      const owner = renderOwnerAddress(networkName);
      await getNftByOwner(
        walletChain.current,
        walletID.current,
        contractAddressText,
        owner,
        idText,
        networkName,
        t,
        disPatch,
      );
    } else {
      setIsVisibleModal(false);
      setErrorTitle(t(STRINGS.unableToAddNFT));
      setErrorMessage(t(STRINGS.server_counted));
      setTimeout(() => {
        setVisibleErrorModal(true);
      }, 500);
    }

    setIsVisibleModal(false);
  };

  // Create bottom Sheet
  const renderHeader = () => (
    <View style={styles.bottom_sheet_header}>
      <Text style={[FONTS.t16b, styles.text_header]}>
        {t(STRINGS.choose_network)}
      </Text>

      <TouchableOpacity
        style={styles.button_close_bottom_sheet}
        onPress={() => {
          bs.current.snapTo(1);
          setDisplayBlockContainer(false);
        }}>
        <Image source={ICONS.clear2} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = item => (
    <View>
      <View style={{ height: 1, backgroundColor: COLOR.gray5 }} />

      <TouchableOpacity
        style={styles.token}
        onPress={() => {
          bs.current.snapTo(1);
          setNetworkName(item.name);
          setResetTextData(true);
          setDataScannerAddress('');
          setStatusScannerAddress(false);
          setDisplayBlockContainer(false);
        }}>
        <Image source={item.image} resizeMode={'contain'} />
        <Text style={[FONTS.t16r, styles.token_name]}>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInner = () => (
    <View
      style={{
        height: '100%',
        backgroundColor: COLOR.simpleBackground,
      }}>
      <FlatList
        style={{ marginBottom: SIZES.navigationBarAndroidHeight }}
        showsVerticalScrollIndicator={false}
        data={netWorkListCustomToken}
        renderItem={({ item }) => renderItem(item)}
      />
    </View>
  );

  const renderLogoNetwork = () => {
    switch (networkName) {
      case TOKEN_NAME.ethereum: {
        return IMAGES.eth_icon;
      }
      case TOKEN_NAME.smartChain: {
        return IMAGES.bsc_icon;
      }
      case TOKEN_NAME.solana: {
        return IMAGES.sol_icon;
      }
    }
  };

  const chooseNetWorkView = () => (
    <TouchableOpacity
      style={styles.chooseNetwork}
      onPress={
        walletChain.current === TOKEN_NAME.multiChain
          ? () => {
              bs.current.snapTo(0);
              Keyboard.dismiss();
              setDisplayBlockContainer(true);
            }
          : null
      }>
      <View>
        <Text style={{ ...FONTS.t12b, color: COLOR.textSecondary }}>
          {t(STRINGS.network)}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          <Image
            source={renderLogoNetwork()}
            style={{ width: SIZES.iconSize, height: SIZES.iconSize }}
            resizeMode="cover"
          />
          <Text
            style={{ ...FONTS.t14r, color: COLOR.textPrimary, marginLeft: 8 }}>
            {networkName}
          </Text>
        </View>
      </View>
      {walletChain.current === TOKEN_NAME.multiChain ? (
        <Image
          source={ICONS.arrowDown}
          style={{ width: SIZES.iconSize, height: SIZES.iconSize }}
          resizeMode="cover"
        />
      ) : (
        <View />
      )}
    </TouchableOpacity>
  );

  const loadingView = () => (
    <Modal
      isVisible={isVisibleModal}
      backdropOpacity={0.9}
      animationIn="zoomIn"
      animationOut="zoomOut">
      <StatusBar translucent={true} />
      <Loading
        imageSource={ICONS.walletCoin}
        title={t(STRINGS.importing_token)}
        supTitle={t(STRINGS.this_shouldn_take_long)}
      />
    </Modal>
  );

  const showQRScan = () => {
    setDataScannerAddress('');
    setStatusScannerAddress(false);
    qrModule.scanQRCode(CONSTANT_EVENT_EMITTER.scanEvent.mnemonic);
  };

  const iosListener = () => {
    qrModule.addListener(CONSTANTS.RNEvent_ReceiveCode);
    const event = new NativeEventEmitter(qrModule);
    event.addListener(CONSTANTS.RNEvent_ReceiveCode, body => {
      setDataScannerAddress(body.code);
      setStatusScannerAddress(true);
    });
  };

  const androidListener = () => {
    DeviceEventEmitter.addListener(CONSTANT_EVENT_EMITTER.seedPhrase, data => {
      setDataScannerAddress(data.message);
      setStatusScannerAddress(data.statusScan);
    });
  };

  const renderContractAddressView = () => (
    <View>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={COLOR.textInputBorderGradient}
        style={{
          width: '100%',
          borderRadius: SIZES.radius,
          marginTop: 10,
          padding: isFocusContractAddress ? 1 : 0,
        }}>
        <CustomTextInput
          width="100%"
          label={t(STRINGS.contract_address)}
          error={isErrorContractAddress}
          dataScanner={dataScannerAddress}
          statusScanner={statusScannerAddress}
          onChangeStatusResetData={() => setResetTextData(false)}
          resetTextData={resetTextData}
          getData={text => setContractAddressText(text)}
          onFocus={() => {
            setFocusContractAddress(true);
            setStatusScannerAddress(false);
            setErrorContractAddress(false);
          }}
          onBlur={() => {
            setFocusContractAddress(false);
          }}
          multiline={false}
        />
      </LinearGradient>
      {isErrorContractAddress ? (
        <Text
          style={{ ...FONTS.t12r, color: COLOR.systemRedLight, marginTop: 8 }}>
          {t(STRINGS.invalid_contract_address)}
        </Text>
      ) : null}
    </View>
  );

  const renderIDView = () => {
    if (networkName !== TOKEN_NAME.solana) {
      return (
        <View>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={COLOR.textInputBorderGradient}
            style={{
              width: '100%',
              borderRadius: SIZES.radius,
              marginTop: 16,
              padding: isFocusID ? 1 : 0,
            }}>
            <CustomTextInput
              resetTextData={resetTextData}
              width="100%"
              label="ID"
              error={isErrorID}
              getData={text => setIDText(text)}
              onFocus={() => {
                setFocusID(true);
                setErrorID(false);
              }}
              onBlur={() => setFocusID(false)}
            />
          </LinearGradient>
          {isErrorID ? (
            <Text
              style={{
                ...FONTS.t12r,
                color: COLOR.systemRedLight,
                marginTop: 8,
              }}>
              {t(STRINGS.invalidID)}
            </Text>
          ) : null}
        </View>
      );
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (nftErrorLabel === t(STRINGS.unableToAddNFT)) {
      setErrorTitle(t(STRINGS.unableToAddNFT));
      setErrorMessage(t(STRINGS.server_counted));
      setTimeout(() => {
        setVisibleErrorModal(true);
      }, 500);
    } else if (nftErrorLabel === t(STRINGS.duplicate_NFT_title)) {
      setErrorTitle(t(STRINGS.duplicate_NFT_title));
      setErrorMessage(t(STRINGS.duplicate_NFT_massage));
      setTimeout(() => {
        setVisibleErrorModal(true);
      }, 500);
    } else if (nftErrorLabel === t(STRINGS.unable_to_verify_ownership)) {
      setErrorTitle(t(STRINGS.unable_to_verify_ownership));
      setErrorMessage(t(STRINGS.weCouldNotVerifyOwnerShip));
      setTimeout(() => {
        setVisibleErrorModal(true);
      }, 500);
    } else if (nftErrorLabel === t(STRINGS.ok)) {
      setTimeout(() => {
        disPatch(setNftErrorLabel(''));
        navigation.goBack();
      }, 500);
    }
  }, [nftErrorLabel, t]);

  useEffect(() => {
    //scan QR
    Platform.OS === 'ios' ? iosListener() : androidListener();
    return () => {
      DeviceEventEmitter.removeAllListeners(CONSTANT_EVENT_EMITTER.seedPhrase);
      setStatusScannerAddress(false);
    };
  }, [contractAddressText]);

  useEffect(() => {
    checkValidContractAddress();
    checkValidID();
  }, [
    checkValidContractAddress,
    checkValidID,
    contractAddressText,
    idText,
    isFocusContractAddress,
  ]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsShowKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsShowKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <HideKeyboard>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={IMAGES.homeBackGround}
          style={{ flex: 1 }}
          resizeMode="cover">
          <Animated.View
            style={{
              flex: 1,
              paddingHorizontal: 16,
            }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={ICONS.backButton} resizeMode="cover" />
              </TouchableOpacity>
              <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
                {t(STRINGS.importNFT)}
              </Text>
              <Text />
            </View>
            <KeyboardAvoidingView
              keyboardVerticalOffset={10}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View style={styles.body}>
                  {chooseNetWorkView()}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 18,
                      marginRight: 10,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === 'ios') {
                          showQRScan();
                        } else {
                          ScannerModule.navigateToNative(
                            CONSTANTS.importExistingWallet,
                          );
                        }
                      }}>
                      <Image
                        source={ICONS.qrCode}
                        style={{
                          height: SIZES.iconSize,
                          width: SIZES.iconSize,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  </View>
                  {renderContractAddressView()}
                  {renderIDView()}
                </View>
              </ScrollView>

              <View
                style={[
                  styles.footer,
                  {
                    marginBottom: isShowKeyboardStatus ? 0 : 30,
                    marginTop: isShowKeyboardStatus ? 10 : 0,
                  },
                ]}>
                <CustomButton
                  label={t(STRINGS.import)}
                  height={SIZES.buttonHeight}
                  width={SIZES.width - 32}
                  isDisable={!checkEnableButtonImport()}
                  onPress={() => didTapButtonImport().done()}
                />
              </View>
            </KeyboardAvoidingView>
          </Animated.View>

          <View
            style={[
              styles.block_container,
              { display: displayBlockContainer ? 'flex' : 'none' },
            ]}
          />

          <BottomSheet
            ref={bs}
            snapPoints={[SIZES.heightScreen * 0.4, 0]}
            initialSnap={1}
            callbackNode={fall}
            enabledGestureInteraction={true}
            renderHeader={renderHeader}
            renderContent={renderInner}
          />
          {loadingView()}

          <ErrorModalView
            title={errorTitle}
            message={errorMessage}
            buttonLabel={t(STRINGS.ok_got_it)}
            isVisible={isVisibleErrorModal}
            onClose={() => {
              setVisibleErrorModal(false);
              disPatch(setNftErrorLabel(''));
            }}
          />
        </ImageBackground>
      </View>
    </HideKeyboard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    height: SIZES.height * 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  body: {
    justifyContent: 'flex-start',
  },
  chooseNetwork: {
    marginTop: 32,
    height: 56,
    flexDirection: 'row',
    backgroundColor: COLOR.simpleBackground,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
  },
  bottom_sheet_header: {
    backgroundColor: COLOR.simpleBackground,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    position: 'relative',
  },
  text_header: {
    textAlign: 'center',
    color: COLOR.white,
    marginTop: SIZES.simpleMargin,
    marginBottom: 15,
  },
  button_close_bottom_sheet: {
    position: 'absolute',
    end: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginEnd: 20,
  },
  token: {
    marginTop: SIZES.simpleMargin,
    marginBottom: SIZES.simpleMargin,
    marginStart: SIZES.simpleMargin,
    flexDirection: 'row',
    alignItems: 'center',
  },
  token_name: {
    color: COLOR.white,
    marginStart: 12,
  },
  footer: {
    alignItems: 'flex-end',
    height: SIZES.buttonHeight,
  },
  block_container: {
    height: SIZES.heightScreen * 0.6,
    width: SIZES.widthScreen,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLOR.blackOpacity05,
  },
});
export default ImportNFTs;
