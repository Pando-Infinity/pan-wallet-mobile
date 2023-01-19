import React, { useEffect, useState, createRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  NativeModules,
  Platform,
  NativeEventEmitter,
  DeviceEventEmitter,
  StatusBar,
  Keyboard,
  Alert,
  Linking,
} from 'react-native';
import {
  FONTS,
  SIZES,
  STRINGS,
  SCREEN_NAME,
  COLOR,
  IMAGES,
  ICONS,
  TOKEN_NAME,
  CONSTANTS,
  CONSTANT_EVENT_EMITTER,
} from 'constants';
import { useTranslation } from 'react-i18next';
import CustomTextInput from 'components/CustomTextInput/CustomTextInput';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from 'components/CustomButton/CustomButton';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';
import { netWorkListCustomToken } from 'models/TokenData';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import stringFormat from 'components/StringFormat/StringFormat';
//validate address for network
import { Ethereum } from 'walletCore/index';
import { storage } from 'databases';
import { getTokenBalance } from 'walletCore/balance';
import Modal from 'react-native-modal';
import Loading from 'components/Loading/Loading';
import PropTypes from 'prop-types';
import firestore from '@react-native-firebase/firestore';
import ErrorModalView from 'components/modals/errorModal';
import { isValidateMintAddress } from 'service/SolanaService';
import { getCoinInfoOnMarket } from 'utils/infoToken';
import { useSelector } from 'react-redux';
import { URLConst } from '../../constants';

// qrCode module
const qrModule = NativeModules.QRCodeModule;
const { ScannerModule } = NativeModules;

let ETHAssetToken = [];
let BSCAssetToken = [];
let SOLAssetToken = [];

const ImportCustomToken = ({ route, navigation }) => {
  const { t } = useTranslation();
  const bs = createRef();
  const fall = new Animated.Value(1);

  const [isFocusContractAddress, setFocusContractAddress] = useState(false);
  const [isFocusName, setFocusName] = useState(false);
  const [isFocusSymbol, setFocusSymbol] = useState(false);
  const [isFocusDecimal, setFocusDecimal] = useState(false);
  const [isErrorContractAddress, setErrorContractAddress] = useState(false);
  const [isErrorName, setErrorName] = useState(false);
  const [isErrorSymbol, setErrorSymbol] = useState(false);
  const [isErrorDecimal, setErrorDecimal] = useState(false);
  const [contractAddressText, setContractAddressText] = useState('');
  const [nameText, setNameText] = useState('');
  const [symbolText, setSymbolText] = useState('');
  const [decimalText, setDecimalText] = useState('');
  const [decimalSupText, setDecimalSupText] = useState('');
  const [networkName, setNetworkName] = useState(
    route.params.chain === TOKEN_NAME.multiChain
      ? TOKEN_NAME.ethereum
      : route.params.chain,
  );
  const [editable, setEditable] = useState(true);
  const [selectTextOnFocus, setSelectTextOnFocus] = useState(true);
  const [statusScanner, setStatusScanner] = useState(false);
  const [statusScannerAddress, setStatusScannerAddress] = useState(false);
  const [dataScannerAddress, setDataScannerAddress] = useState('');
  const [resetTextData, setResetTextData] = useState(false);
  const [resetTextDataContractAddress, setResetTextDataContractAddress] =
    useState(false);
  const [type, setType] = useState('');
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [displayBlockContainer, setDisplayBlockContainer] = useState(false);
  const [isVisibleError, setIsVisibleError] = useState(false);
  const [isVisibleDuplicate, setVisibleDuplicate] = useState(false);

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const checkEnableButtonImport = () => {
    if (
      contractAddressText !== '' &&
      nameText !== '' &&
      symbolText !== '' &&
      decimalText !== '' &&
      isErrorContractAddress === false &&
      isErrorDecimal === false
    ) {
      return true;
    } else {
      return false;
    }
  };

  const checkValidContractAddress = () => {
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
  };

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
        route.params.chain === TOKEN_NAME.multiChain
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

      {route.params.chain === TOKEN_NAME.multiChain ? (
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
          onChangeStatusResetData={() => setResetTextDataContractAddress(false)}
          resetTextData={resetTextDataContractAddress}
          getData={text => setContractAddressText(text)}
          onFocus={() => {
            setFocusContractAddress(true);
            setStatusScannerAddress(false);
          }}
          onBlur={() => {
            setFocusContractAddress(false);
            contractAddressOnBlur(contractAddressText);
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

  const renderNameView = () => (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={COLOR.textInputBorderGradient}
      style={{
        width: '100%',
        borderRadius: SIZES.radius,
        marginTop: 16,
        padding: isFocusName ? 1 : 0,
      }}>
      <CustomTextInput
        editable={editable}
        selectTextOnFocus={selectTextOnFocus}
        statusScanner={statusScanner}
        dataScanner={nameText}
        onChangeStatusScanner={() => setStatusScanner(false)}
        resetTextData={resetTextData}
        width="100%"
        label={t(STRINGS.name)}
        error={isErrorName}
        getData={text => setNameText(text)}
        onFocus={() => setFocusName(true)}
        onBlur={() => setFocusName(false)}
      />
    </LinearGradient>
  );

  const renderSymbolView = () => (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={COLOR.textInputBorderGradient}
      style={{
        width: '100%',
        borderRadius: SIZES.radius,
        marginTop: 16,
        padding: isFocusSymbol ? 1 : 0,
      }}>
      <CustomTextInput
        editable={editable}
        selectTextOnFocus={selectTextOnFocus}
        statusScanner={statusScanner}
        dataScanner={symbolText}
        onChangeStatusScanner={() => setStatusScanner(false)}
        resetTextData={resetTextData}
        width="100%"
        label={t(STRINGS.symbol)}
        error={isErrorSymbol}
        getData={text => setSymbolText(text)}
        onFocus={() => setFocusSymbol(true)}
        onBlur={() => setFocusSymbol(false)}
      />
    </LinearGradient>
  );

  const renderDecimalView = () => (
    <View style={{ marginTop: 16 }}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={COLOR.textInputBorderGradient}
        style={{
          width: '100%',
          borderRadius: SIZES.radius,
          padding: isFocusDecimal ? 1 : 0,
        }}>
        <CustomTextInput
          editable={editable}
          selectTextOnFocus={selectTextOnFocus}
          statusScanner={statusScanner}
          dataScanner={decimalText}
          onChangeStatusScanner={() => setStatusScanner(false)}
          resetTextData={resetTextData}
          width="100%"
          label={t(STRINGS.decimals)}
          numberType={true}
          error={isErrorDecimal}
          getData={text => setDecimalText(text)}
          onFocus={() => setFocusDecimal(true)}
          onBlur={() => {
            setFocusDecimal(false);
          }}
        />
      </LinearGradient>
      <Text
        style={{
          marginTop: 8,
          ...FONTS.t12r,
          color: !isErrorDecimal ? COLOR.textSecondary : COLOR.systemRedLight,
        }}>
        {decimalSupText}
      </Text>
    </View>
  );

  const checkInputDecimalText = () => {
    if (decimalText === '') {
      setDecimalSupText(
        stringFormat(t(STRINGS.decimals_between), [
          CONSTANTS.tokenDecimalMin,
          CONSTANTS.tokenDecimalMax,
        ]),
      );
      setErrorDecimal(false);
    } else {
      if (
        parseInt(decimalText) >= CONSTANTS.tokenDecimalMin &&
        parseInt(decimalText) < CONSTANTS.tokenDecimalMax &&
        isNumeric(decimalText) === true
      ) {
        setDecimalSupText('');
        setErrorDecimal(false);
      } else {
        setDecimalSupText(
          stringFormat(t(STRINGS.decimals_enter), [
            CONSTANTS.tokenDecimalMin,
            CONSTANTS.tokenDecimalMax,
          ]),
        );
        setErrorDecimal(true);
      }
    }
  };

  const renderWarningView = () => (
    <View style={styles.waring}>
      <View style={styles.waringContent}>
        <Image source={ICONS.waring} resizeMode="cover" />
        <Text
          style={{
            ...FONTS.t12r,
            color: COLOR.systemYellowLight,
            marginLeft: 15,
            marginRight: 28,
          }}>
          {t(STRINGS.anyone_can_create_a_token)}
          <Text> </Text>
          <Text
            style={{
              ...FONTS.t12b,
              color: COLOR.systemYellowLight,
            }}
            onPress={() =>
              Linking.openURL(URLConst.scams_and_security_risk).catch()
            }>
            {t(STRINGS.scams_and_security_risk)}
          </Text>
        </Text>
      </View>
    </View>
  );

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
          setResetTextDataContractAddress(true);
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

  const checkValidETHAddress = address => {
    if (
      contractAddressText !== '' &&
      Ethereum.isValidETHAddress(address) === false
    ) {
      setErrorContractAddress(true);
    } else {
      setErrorContractAddress(false);
    }
  };

  const checkValidSOLAddress = address => {
    if (
      isValidateMintAddress(address) === false &&
      contractAddressText !== ''
    ) {
      setErrorContractAddress(true);
    } else {
      setErrorContractAddress(false);
    }
  };

  const renderType = () => {
    switch (networkName) {
      case TOKEN_NAME.ethereum:
        setType('ERC20');
        break;
      case TOKEN_NAME.smartChain:
        setType('BEP20');
        break;
      case TOKEN_NAME.solana:
        setType('SPL');
        break;
    }
  };

  const contractAddressFilter = address => {
    switch (networkName) {
      case TOKEN_NAME.ethereum: {
        const data = ETHAssetToken.filter(value => {
          return value.id === address;
        });
        return data;
      }
      case TOKEN_NAME.smartChain: {
        const data = BSCAssetToken.filter(value => {
          return value.id === address;
        });
        return data;
      }
      case TOKEN_NAME.solana: {
        const data = SOLAssetToken.filter(value => {
          return value.id === address;
        });
        return data;
      }
    }
  };

  const contractAddressOnBlur = contractAddress => {
    if (isErrorContractAddress === false && networkName !== '') {
      renderType();
      const result = contractAddressFilter(contractAddress);
      if (result.length !== 0) {
        setStatusScanner(true);
        setNameText(result[0].name);
        setSymbolText(result[0].symbol);
        setDecimalText(`${result[0].decimals}`);
        setEditable(false);
        setSelectTextOnFocus(false);
      } else {
        setResetTextData(true);
        setEditable(true);
        setSelectTextOnFocus(true);
      }
    }
  };

  const renderImage = () => {
    switch (networkName) {
      case TOKEN_NAME.ethereum: {
        return ICONS.erc20;
      }
      case TOKEN_NAME.smartChain: {
        return ICONS.bep20;
      }
      case TOKEN_NAME.solana: {
        return ICONS.slp;
      }
    }
  };

  const getBalanceCusToken = async (contractAddress, type) => {
    let addressETH = '';
    let addressBSC = '';
    let addressSOL = '';
    switch (route.params.chain) {
      case TOKEN_NAME.multiChain: {
        const json = storage.getString(
          `${CONSTANTS.multiChainDataKey}${route.params.id}`,
        );
        const object = JSON.parse(json);
        const objectETH = object.filter(value => {
          return value.name === TOKEN_NAME.ethereum;
        });
        addressETH = objectETH[0].address;
        const objectBSC = object.filter(value => {
          return value.name === TOKEN_NAME.smartChain;
        });
        addressBSC = objectBSC[0].address;
        const objectSOL = object.filter(value => {
          return value.name === TOKEN_NAME.solana;
        });
        addressSOL = objectSOL[0].address;
        break;
      }
      case TOKEN_NAME.ethereum: {
        const json = storage.getString(
          `${CONSTANTS.ETHChainDataKey}${route.params.id}`,
        );
        const object = JSON.parse(json);
        addressETH = object[0].address;
        break;
      }
      case TOKEN_NAME.smartChain: {
        const json = storage.getString(
          `${CONSTANTS.BSCChainDataKey}${route.params.id}`,
        );
        const object = JSON.parse(json);
        addressBSC = object[0].address;
        break;
      }
      case TOKEN_NAME.solana: {
        const json = storage.getString(
          `${CONSTANTS.SOLChainDataKey}${route.params.id}`,
        );
        const object = JSON.parse(json);
        addressSOL = object[0].address;
        break;
      }
    }

    switch (type) {
      case 'ERC20': {
        return await getTokenBalance(addressETH, contractAddress, type);
      }
      case 'BEP20': {
        return await getTokenBalance(addressBSC, contractAddress, type);
      }
      case 'SPL': {
        return await getTokenBalance(addressSOL, contractAddress, type);
      }
    }
  };

  const renderAlertDuplicateToken = () =>
    Alert.alert(
      t(STRINGS.unable_to_add_token),
      t(STRINGS.this_token_has_been_added),
      [
        {
          text: t(STRINGS.ok_got_it),
          style: 'cancel',
        },
      ],
    );

  const checkDuplicateTokenMethod = (contractAddress, key) => {
    const jsonListToken = storage.getString(`${key}${route.params.id}`);
    const objectListToken = JSON.parse(jsonListToken);
    const result = objectListToken.filter(value => {
      return value.contractAddress === contractAddress;
    });
    return result;
  };

  const checkDuplicateToken = contractAddress => {
    switch (route.params.chain) {
      case TOKEN_NAME.multiChain: {
        return checkDuplicateTokenMethod(
          contractAddress,
          CONSTANTS.newTokenListMultiData,
        );
      }
      case TOKEN_NAME.ethereum: {
        return checkDuplicateTokenMethod(
          contractAddress,
          CONSTANTS.newTokenListETHData,
        );
      }
      case TOKEN_NAME.smartChain: {
        return checkDuplicateTokenMethod(
          contractAddress,
          CONSTANTS.newTokenListBSCData,
        );
      }
      case TOKEN_NAME.solana: {
        return checkDuplicateTokenMethod(
          contractAddress,
          CONSTANTS.newTokenListSOLData,
        );
      }
    }
  };

  const saveDataToShowAtHomeScreen = object => {
    switch (route.params.chain) {
      case TOKEN_NAME.multiChain: {
        const jsonHomeData = storage.getString(
          `${CONSTANTS.newDataMultiChain}${route.params.id}`,
        );
        const objectHome = JSON.parse(jsonHomeData);
        objectHome.push(object);
        storage.set(
          `${CONSTANTS.newDataMultiChain}${route.params.id}`,
          JSON.stringify(objectHome),
        );
        break;
      }
      case TOKEN_NAME.ethereum: {
        const jsonHomeData = storage.getString(
          `${CONSTANTS.newDataETHChain}${route.params.id}`,
        );
        const objectHome = JSON.parse(jsonHomeData);
        objectHome.push(object);
        storage.set(
          `${CONSTANTS.newDataETHChain}${route.params.id}`,
          JSON.stringify(objectHome),
        );
        storage.set(
          `${CONSTANTS.masterHomeDataETHChain}${route.params.id}`,
          JSON.stringify(objectHome),
        );
        break;
      }
      case TOKEN_NAME.smartChain: {
        const jsonHomeData = storage.getString(
          `${CONSTANTS.newDataBSCChain}${route.params.id}`,
        );
        const objectHome = JSON.parse(jsonHomeData);
        objectHome.push(object);
        storage.set(
          `${CONSTANTS.newDataBSCChain}${route.params.id}`,
          JSON.stringify(objectHome),
        );
        storage.set(
          `${CONSTANTS.masterHomeDataBSCChain}${route.params.id}`,
          JSON.stringify(objectHome),
        );
        break;
      }
      case TOKEN_NAME.solana: {
        const jsonHomeData = storage.getString(
          `${CONSTANTS.newDataSOLChain}${route.params.id}`,
        );
        const objectHome = JSON.parse(jsonHomeData);
        objectHome.push(object);
        storage.set(
          `${CONSTANTS.newDataSOLChain}${route.params.id}`,
          JSON.stringify(objectHome),
        );
        storage.set(
          `${CONSTANTS.masterHomeDataSOLChain}${route.params.id}`,
          JSON.stringify(objectHome),
        );
        break;
      }
    }
  };

  const saveDataToShowAtSelectToken = object => {
    switch (route.params.chain) {
      case TOKEN_NAME.multiChain: {
        const jsonListToken = storage.getString(
          `${CONSTANTS.newTokenListMultiData}${route.params.id}`,
        );
        const objectListToken = JSON.parse(jsonListToken);
        objectListToken.push(object);
        storage.set(
          `${CONSTANTS.newTokenListMultiData}${route.params.id}`,
          JSON.stringify(objectListToken),
        );
        break;
      }
      case TOKEN_NAME.ethereum: {
        const jsonListToken = storage.getString(
          `${CONSTANTS.newTokenListETHData}${route.params.id}`,
        );
        const objectListToken = JSON.parse(jsonListToken);
        objectListToken.push(object);
        storage.set(
          `${CONSTANTS.newTokenListETHData}${route.params.id}`,
          JSON.stringify(objectListToken),
        );
        break;
      }
      case TOKEN_NAME.smartChain: {
        const jsonListToken = storage.getString(
          `${CONSTANTS.newTokenListBSCData}${route.params.id}`,
        );
        const objectListToken = JSON.parse(jsonListToken);
        objectListToken.push(object);
        storage.set(
          `${CONSTANTS.newTokenListBSCData}${route.params.id}`,
          JSON.stringify(objectListToken),
        );
        break;
      }
      case TOKEN_NAME.solana: {
        const jsonListToken = storage.getString(
          `${CONSTANTS.newTokenListSOLData}${route.params.id}`,
        );
        const objectListToken = JSON.parse(jsonListToken);
        objectListToken.push(object);
        storage.set(
          `${CONSTANTS.newTokenListSOLData}${route.params.id}`,
          JSON.stringify(objectListToken),
        );
        break;
      }
    }
  };

  const getOwnerAddressOfContract = () => {
    switch (networkName) {
      case TOKEN_NAME.ethereum: {
        return storage.getString(CONSTANTS.addressOfETHKey);
      }
      case TOKEN_NAME.smartChain: {
        return storage.getString(CONSTANTS.addressOfBSCKey);
      }
      case TOKEN_NAME.solana: {
        return storage.getString(CONSTANTS.addressOfSOLKey);
      }
      default:
        return '';
    }
  };

  const didTapButtonImport = async () => {
    //step1: create object custom token
    //step2: create new table: custom token in database
    //step3: insert object to database -> have an id
    //step4: call object from database
    //step5: add to storage at home screen (newDataMultiChainData/newDataETHChainData/...)
    //step6: add to newListToken at SelectToken

    //check for duplicate tokens:
    const list = checkDuplicateToken(contractAddressText);
    if (list.length !== 0) {
      setVisibleDuplicate(true);
    } else {
      setIsVisibleModal(true);

      const tokenInfo = await getCoinInfoOnMarket(
        symbolText,
        fiatCurrency,
        nameText,
      );

      const UnitCoinToCoin = Math.pow(10, parseInt(decimalText));

      getBalanceCusToken(contractAddressText, type).then(value => {
        const newObjectHomeData = {
          asset_id: symbolText,
          name: nameText,
          type: type,
          image: tokenInfo?.[0]?.image ?? renderImage(),
          address: getOwnerAddressOfContract(),
          contract: contractAddressText,
          balance: parseFloat((value / UnitCoinToCoin).toFixed(5)),
          price: tokenInfo?.[0]?.current_price || 0,
          change_percent_price:
            tokenInfo?.[0]?.price_change_percentage_24h || 0,
          decimal: decimalText,
          coinSymbol: symbolText,
          isShow: true,
          id_token: route.params.id,
        };
        const newObjectTokenList = {
          asset_id: symbolText,
          name: nameText,
          image: tokenInfo?.[0]?.image ?? renderImage(),
          type: type,
          contractAddress: contractAddressText,
          isShow: true,
          id_token: route.params.id,
          decimal: decimalText,
        };
        saveDataToShowAtHomeScreen(newObjectHomeData);
        saveDataToShowAtSelectToken(newObjectTokenList);
        setIsVisibleModal(false);
        navigation.navigate(SCREEN_NAME.tokenDetailScreen, {
          asset_id: symbolText,
          name: nameText,
          type: type,
          image: tokenInfo?.[0]?.image ?? renderImage(),
          address: getOwnerAddressOfContract(),
          contract: contractAddressText,
          balance: parseFloat((value / UnitCoinToCoin).toFixed(5)),
          price: tokenInfo?.[0]?.current_price || 0,
          change_percent_price:
            tokenInfo?.[0]?.price_change_percentage_24h || 0,
          coinSymbol: symbolText,
          id_token: route.params.id,
        });
      });
    }
  };

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
    contractAddressOnBlur(dataScannerAddress);
  };

  const androidListener = () => {
    DeviceEventEmitter.addListener(CONSTANT_EVENT_EMITTER.seedPhrase, data => {
      setDataScannerAddress(data.message);
      setStatusScannerAddress(data.statusScan);
    });
    contractAddressOnBlur(dataScannerAddress);
  };

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

  // getData from firebase stores
  const getAssetToken = async () => {
    try {
      const ETHData = await firestore().collection('tokens').doc('ETH').get();
      const BSCData = await firestore().collection('tokens').doc('BSC').get();
      const SOLData = await firestore().collection('tokens').doc('SOL').get();
      ETHAssetToken = ETHData.data().data;
      BSCAssetToken = BSCData.data().data;
      SOLAssetToken = SOLData.data().data;
    } catch {
      setIsVisibleError(true);
    }
  };
  useEffect(() => {
    getAssetToken().done();
  }, []);

  useEffect(() => {
    //scan QR
    Platform.OS === 'ios' ? iosListener() : androidListener();
    return () => {
      DeviceEventEmitter.removeAllListeners(CONSTANT_EVENT_EMITTER.seedPhrase);
      setStatusScannerAddress(false);
    };
  }, [contractAddressText !== '']);

  useEffect(() => {
    if (!isFocusContractAddress) {
      setResetTextData(false);
    }
    checkValidContractAddress();
    checkInputDecimalText();
  });

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
                {t(STRINGS.import_custom_token)}
              </Text>
              <Text />
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
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

                {renderNameView()}

                {renderSymbolView()}

                {renderDecimalView()}

                {renderWarningView()}

                <View style={styles.footer}>
                  <CustomButton
                    label={t(STRINGS.import)}
                    height={SIZES.buttonHeight}
                    width="100%"
                    isDisable={!checkEnableButtonImport()}
                    onPress={() => didTapButtonImport().done()}
                  />
                </View>
              </View>
            </ScrollView>
          </Animated.View>

          <View
            style={[
              styles.block_container,
              { display: displayBlockContainer ? 'flex' : 'none' },
            ]}
          />

          <BottomSheet
            ref={bs}
            snapPoints={[SIZES.heightScreen * 0.45, 0]}
            initialSnap={1}
            callbackNode={fall}
            enabledGestureInteraction={true}
            renderHeader={renderHeader}
            renderContent={renderInner}
          />

          {loadingView()}
          <ErrorModalView
            isVisible={isVisibleError}
            title={t(STRINGS.error)}
            message={t(STRINGS.something_wrong)}
            buttonLabel={t(STRINGS.ok_got_it)}
            onClose={() => {
              setIsVisibleError(false);
              navigation.goBack();
            }}
          />
          <ErrorModalView
            isVisible={isVisibleDuplicate}
            title={t(STRINGS.unable_to_add_token)}
            message={t(STRINGS.this_token_has_been_added)}
            buttonLabel={t(STRINGS.ok_got_it)}
            onClose={() => setVisibleDuplicate(false)}
          />
        </ImageBackground>
      </View>
    </HideKeyboard>
  );
};

const isNumeric = value => {
  return /^-?\d+$/.test(value);
};

ImportCustomToken.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
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

  waring: {
    marginTop: 24,
    width: '100%',
    backgroundColor: COLOR.systemYellowLight,
    paddingLeft: 4,
    borderRadius: 4,
  },

  waringContent: {
    flexDirection: 'row',
    backgroundColor: COLOR.systemYellow,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 11,
    alignItems: 'center',
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
    marginTop: 100,
    marginBottom: 30,
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

export default ImportCustomToken;
