import React, {
  createRef,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  COLOR,
  FONTS,
  ICONS,
  IMAGES,
  SIZES,
  STRINGS,
  TOKEN_NAME,
  CONSTANTS,
} from 'constants';
import { useTranslation } from 'react-i18next';
import { DAORepository, storage } from 'databases';
import { bindingDataForFlatList, getDataForItem } from 'api/TokenList';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import { compactAddress } from 'utils/util';
import Modal from 'react-native-modal';
import Loading from 'components/Loading/Loading';
import HomeTabs, { HOME_TAB_VALUES } from './HomeTabs';
import SendAndReceiveActions from './SendAndReceiveActions';
import HomeBanner from './HomeBanner';
import HomeHeader from './HomeHeader';
import TokenCollection from './TokenCollection';
import NftCollection from './NftCollection';
import PropTypes from 'prop-types';
import { GetBalance, WalletConnector } from 'walletCore';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { getCoinInfoOnMarket } from 'utils/infoToken';
import { getTokenBalance } from 'walletCore/balance';
import { format } from 'react-string-format';
import { getFeeData, getGasPrice } from 'utils/gas.util';
import Config from 'react-native-config';

export let ETHAssetToken = [];
export let BSCAssetToken = [];
export let SOLAssetToken = [];

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const bs = createRef();
  const isFocused = useIsFocused();
  const fall = new Animated.Value(1);
  const walletFirstChain = storage.getString(CONSTANTS.firstChainTypeKey);
  const walletFirstName = storage.getString(CONSTANTS.firstWalletNameKey);
  const walletID = useRef(
    storage.getNumber(CONSTANTS.rememberWalletIDKey) !== undefined
      ? storage.getNumber(CONSTANTS.rememberWalletIDKey)
      : 1,
  );
  const walletChain = useRef(
    storage.getString(CONSTANTS.rememberWalletChainKey) !== undefined
      ? storage.getString(CONSTANTS.rememberWalletChainKey)
      : walletFirstChain,
  );
  const listAddress = useRef([]);
  const [data, setData] = useState([]);
  const [walletData, setWalletData] = useState([]);
  const [walletNameUI, setWalletName] = useState(walletFirstName);
  const [isVisibleModal, setVisibleModal] = useState(false);
  const [isLoadingFirst, setIsLoadingFirst] = useState(false);
  const [refreshFlatList, setRefreshFlatList] = useState(false);
  const [selectedTab, setSelectedTab] = useState(HOME_TAB_VALUES.tokens);
  const [previousFiatCurrency, setPreviousFiatCurrency] = useState();

  const walletWithID = useRef([]);

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const handleChangeSelectedTab = newValue => {
    setSelectedTab(newValue);
  };

  const showTabBar = () => {
    navigation.setOptions({
      tabBarStyle: {
        position: 'absolute',
        borderTopWidth: 0,
        backgroundColor: COLOR.simpleBackground,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: SIZES.height * 0.1,
        elevation: 0,
        width: SIZES.width,
        display: 'flex',
      },
    });
  };

  const renderAddressListWalletData = async () => {
    const wallet = await DAORepository.getAllWallet();
    for (let i = 0; i < wallet.length; i++) {
      const item = wallet[i];
      await renderAddressOfChain(item._id, item.chain);
    }
  };

  const updateListWalletData = async () => {
    listAddress.current = [];
    await renderAddressListWalletData();
    await setDataChangeWallet();
    if (refreshFlatList === false) {
      setRefreshFlatList(true);
    }
  };

  const setDataChangeWallet = async () => {
    const wallet = await DAORepository.getAllWallet();
    const newData = wallet.map((walletList, i) => {
      walletList.address = listAddress.current[i];
      return walletList;
    });
    setWalletData(newData);
  };

  const renderData = useCallback(async () => {
    await getDataForItem(walletID.current, walletChain.current, fiatCurrency);
    await bindingDataForFlatList(walletID.current, walletChain.current);
  }, [fiatCurrency]);

  //Create Bottom Sheet ChangeWallet
  const renderHeader = () => (
    <View style={styles.bottom_sheet_header}>
      <Text style={[FONTS.t16b, styles.text_header]}>
        {t(STRINGS.change_wallet)}
      </Text>

      <TouchableOpacity
        style={styles.button_close_bottom_sheet}
        onPress={() => {
          bs.current.snapTo(1);
          showTabBar();
        }}>
        <Image source={ICONS.clear2} />
      </TouchableOpacity>
    </View>
  );

  const loadingView = () => (
    <Modal
      isVisible={isVisibleModal}
      backdropOpacity={0.9}
      animationIn="zoomIn"
      animationOut="zoomOut">
      <StatusBar translucent={true} />
      <Loading
        imageSource={IMAGES.clockLoading}
        title={t(STRINGS.changing_wallet)}
        supTitle={t(STRINGS.this_shouldn_take_long)}
      />
    </Modal>
  );

  const loadingInitData = () => (
    <Modal
      isVisible={isLoadingFirst}
      backdropOpacity={0.9}
      animationIn="zoomIn"
      animationOut="zoomOut">
      <StatusBar translucent={true} />

      <Loading
        imageSource={IMAGES.clockLoading}
        title={t(STRINGS.accessing_to_wallet)}
        supTitle={null}
      />
    </Modal>
  );

  const didTapItem = async item => {
    if (walletID.current === item._id && walletChain.current === item.chain)
      return;
    setWalletName(item.name);
    setSelectedTab(HOME_TAB_VALUES.tokens);
    walletID.current = item._id;
    walletChain.current = item.chain;
    storage.set(CONSTANTS.rememberWalletIDKey, item._id);
    storage.set(CONSTANTS.rememberWalletChainKey, item.chain);
    setVisibleModal(true);
    await handleUpdateData();
    setVisibleModal(false);
  };

  const renderAddressOfChain = async (id, chain) => {
    if (chain === TOKEN_NAME.multiChain) {
      listAddress.current.push('');
    } else {
      const address = await DAORepository.getListAddressTokenByWalletId(id);
      for (let i = 0; i < address.length; i++) {
        const item = address[i];
        const token = item.split('-');
        switch (chain) {
          case TOKEN_NAME.bitcoin: {
            const bitcoin = await DAORepository.getBitcoinById(
              parseInt(token[1]),
            );
            listAddress.current.push(bitcoin.address);
            break;
          }
          case TOKEN_NAME.ethereum: {
            const ethereum = await DAORepository.getEthereumById(
              parseInt(token[1]),
            );
            listAddress.current.push(ethereum.address);
            break;
          }
          case TOKEN_NAME.smartChain: {
            const smartChain = await DAORepository.getEthereumById(
              parseInt(token[1]),
            );
            listAddress.current.push(smartChain.address);
            break;
          }
          case TOKEN_NAME.solana: {
            const solana = await DAORepository.getSolanaById(
              parseInt(token[1]),
            );
            listAddress.current.push(solana.address);
            break;
          }
          default:
            break;
        }
      }
    }
  };

  const renderItemBottomSheet = item => {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 1, backgroundColor: COLOR.gray5 }} />

        <TouchableOpacity
          style={styles.token}
          onPress={() => {
            didTapItem(item);
            bs.current.snapTo(1);
            showTabBar();
          }}>
          <Image source={showLogoChain(item.chain)} />

          <View style={{ justifyContent: 'space-evenly' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={[FONTS.t14b, styles.token_name]}>
                {item.name}
                <Text
                  style={{
                    ...FONTS.t12r,
                    color: COLOR.textSecondary,
                    left: 10,
                  }}
                />
              </Text>

              <Text style={[FONTS.t12r, styles.token_name]}>
                {item.chain === TOKEN_NAME.multiChain
                  ? ''
                  : compactAddress(item.address)}
              </Text>
            </View>

            <Text
              style={{
                ...FONTS.t12r,
                color: COLOR.textSecondary,
                marginStart: 12,
              }}>
              {item.chain === TOKEN_NAME.multiChain
                ? t(STRINGS.multi_chain_wallet)
                : format(`${t(STRINGS.type_wallet)}`, item.chain)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderInner = () => (
    <View
      style={{
        backgroundColor: COLOR.simpleBackground,
        height: '100%',
      }}>
      <FlatList
        data={walletData}
        renderItem={({ item }) => renderItemBottomSheet(item)}
        extraData={refreshFlatList}
      />
    </View>
  );

  const getWalletWithID = async () => {
    const wallet = await DAORepository.getAllWallet();
    walletWithID.current = wallet.filter(value => {
      return value._id === walletID.current;
    });
  };

  const changeNameForWallet = () => {
    getWalletWithID().then(() => setWalletName(walletWithID.current[0].name));
  };

  //get asset token from firebase
  const getAssetToken = async () => {
    try {
      const ETHData = await firestore().collection('tokens').doc('ETH').get();
      const BSCData = await firestore().collection('tokens').doc('BSC').get();
      const SOLData = await firestore().collection('tokens').doc('SOL').get();
      ETHAssetToken = ETHData.data().data;
      BSCAssetToken = BSCData.data().data;
      SOLAssetToken = SOLData.data().data;
    } catch {
      return;
    }
  };

  const handleUpdateData = useCallback(async () => {
    let jsonData = getChainToBindingData(walletID.current, walletChain.current);
    if (!jsonData) {
      setIsLoadingFirst(true);
    }
    // Update token list in home screen while renderData
    let newList = await filterData(
      walletID.current,
      walletChain.current,
      jsonData,
      fiatCurrency,
    );
    setData(newList);

    await renderData();
    jsonData = getChainToBindingData(walletID.current, walletChain.current);
    newList = await filterData(
      walletID.current,
      walletChain.current,
      jsonData,
      fiatCurrency,
    );
    setIsLoadingFirst(false);
    setData(newList);
  }, [renderData, fiatCurrency]);

  const saveGasPriceDefault = async () => {
    const lastBaseFeePerGas = await getFeeData();
    const bscGasPrice = await getGasPrice('BNB');
    storage.set(CONSTANTS.ethGasPrice, parseInt(lastBaseFeePerGas, 10) / 1e9);
    storage.set(CONSTANTS.bscGasPrice, parseInt(bscGasPrice, 10) / 1e9);
  };

  useEffect(() => {
    if (!isFocused) {
      setData([]);
      return;
    }
    if (!previousFiatCurrency) {
      setPreviousFiatCurrency(fiatCurrency);
    }
  }, [fiatCurrency]);

  useEffect(() => {
    if (!isFocused) {
      setPreviousFiatCurrency(fiatCurrency);
    }
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;

    if (
      fiatCurrency &&
      previousFiatCurrency &&
      previousFiatCurrency !== fiatCurrency &&
      isFocused
    ) {
      setIsLoadingFirst(true);
    }

    handleUpdateData();

    const interval = setInterval(() => {
      handleUpdateData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isFocused, handleUpdateData]);

  useEffect(() => {
    getAssetToken().done();
  }, []);

  useEffect(() => {
    if (isFocused) {
      saveGasPriceDefault().then();
    }
  }, [isFocused]);

  useEffect(() => {
    changeNameForWallet();
    return navigation.addListener('focus', () => {
      //add logic show UI when changed and update data
      changeNameForWallet();
      updateListWalletData().done();
    });
  }, [navigation]);

  useEffect(() => {
    WalletConnector.updateSession(data, walletNameUI);
  }, [walletNameUI]);

  return (
    <ImageBackground
      source={IMAGES.homeBackGround}
      style={{ flex: 1 }}
      resizeMode="cover">
      <ScrollView
        style={{ flex: 1, flexDirection: 'column' }}
        contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.above}>
          <HomeHeader walletData={walletData} listAddressRef={listAddress} />

          <HomeBanner
            bottomSheetRef={bs}
            walletID={walletID.current}
            walletNameUI={walletNameUI}
            tokenList={data}
          />

          <SendAndReceiveActions
            data={data}
            walletID={walletID}
            style={{ marginTop: 16 }}
          />
        </View>

        <HomeTabs
          style={{ marginTop: 16 }}
          selectedTab={selectedTab}
          onChangeTab={handleChangeSelectedTab}
        />

        {selectedTab === HOME_TAB_VALUES.tokens && (
          <TokenCollection
            data={data}
            walletID={walletID}
            walletChain={walletChain}
          />
        )}

        {selectedTab === HOME_TAB_VALUES.nfts && <NftCollection />}
      </ScrollView>

      <BottomSheet
        ref={bs}
        snapPoints={[SIZES.height * 0.5, 0]}
        initialSnap={1}
        callbackNode={fall}
        enabledHeaderGestureInteraction={false}
        enabledGestureInteraction={false}
        enabledContentGestureInteraction={false}
        renderHeader={renderHeader}
        renderContent={renderInner}
      />

      {loadingInitData()}

      {loadingView()}
    </ImageBackground>
  );
};

HomeScreen.propTypes = {
  navigation: PropTypes.object,
};

const getChainToBindingData = (id, chain) => {
  switch (chain) {
    case TOKEN_NAME.multiChain: {
      return storage.getString(`${CONSTANTS.multiChainDataKey}${id}`);
    }
    case TOKEN_NAME.bitcoin: {
      return storage.getString(`${CONSTANTS.BTCChainDataKey}${id}`);
    }
    case TOKEN_NAME.ethereum: {
      return storage.getString(`${CONSTANTS.ETHChainDataKey}${id}`);
    }
    case TOKEN_NAME.smartChain: {
      return storage.getString(`${CONSTANTS.BSCChainDataKey}${id}`);
    }
    case TOKEN_NAME.solana: {
      return storage.getString(`${CONSTANTS.SOLChainDataKey}${id}`);
    }
    default:
      break;
  }
};

const checkChainToUpdateNewData = (id, chain) => {
  switch (chain) {
    case TOKEN_NAME.multiChain: {
      return storage.getString(`${CONSTANTS.newDataMultiChain}${id}`);
    }
    case TOKEN_NAME.bitcoin: {
      return storage.getString(`${CONSTANTS.newDataBTCChain}${id}`);
    }
    case TOKEN_NAME.ethereum: {
      return storage.getString(`${CONSTANTS.newDataETHChain}${id}`);
    }
    case TOKEN_NAME.smartChain: {
      return storage.getString(`${CONSTANTS.newDataBSCChain}${id}`);
    }
    case TOKEN_NAME.solana: {
      return storage.getString(`${CONSTANTS.newDataSOLChain}${id}`);
    }
    default:
      break;
  }
};

const filterData = async (
  walletID,
  walletChain,
  newData,
  fiatCurrency = 'usd',
) => {
  let tokenListSelected = checkChainToUpdateNewData(walletID, walletChain);

  if (newData) {
    newData = JSON.parse(newData);
  } else {
    newData = [];
  }

  if (tokenListSelected) {
    tokenListSelected = JSON.parse(tokenListSelected);
    tokenListSelected = tokenListSelected.filter(
      ({ isShow }) => Boolean(isShow) !== false,
    );
  } else {
    return newData;
  }

  const newList = await Promise.all(
    tokenListSelected.map(async token => {
      const info = newData.find(item =>
        Boolean(token?.asset_id === item?.asset_id && token?.asset_id),
      );
      if (info) {
        return info;
      } else {
        // Get new info token
        const tokenInfo = await getCoinInfoOnMarket(
          token.coinSymbol,
          fiatCurrency,
          token.name,
        );
        let tokenBalanceValue = 0;
        if (token.type === 'coin') {
          tokenBalanceValue = await GetBalance.getCoinBalance(
            token.address,
            token.coinSymbol,
          );
        } else {
          tokenBalanceValue = await getTokenBalance(
            token.address,
            token.contract,
            token.type,
          );
        }

        return {
          ...token,
          balance: Number((tokenBalanceValue / 10 ** token.decimal).toFixed(7)),
          price: tokenInfo?.[0]?.current_price || 0,
          change_percent_price:
            tokenInfo?.[0]?.price_change_percentage_24h || 0,
        };
      }
    }),
  );

  return newList;
};

const showLogoChain = chain => {
  switch (chain) {
    case TOKEN_NAME.multiChain: {
      return IMAGES.multi_chain;
    }
    case TOKEN_NAME.bitcoin: {
      return IMAGES.btc_icon;
    }
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

const styles = StyleSheet.create({
  above: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  viewHeaderContentDown: {
    flexDirection: 'row',
    height: 114,
    backgroundColor: COLOR.shade6,
    width: SIZES.width * 0.9,
    borderBottomLeftRadius: SIZES.homeViewRadius,
    borderBottomRightRadius: SIZES.homeViewRadius,
  },
  sendButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '60%',
    width: '40%',
  },
  receiveButtonContainer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: '60%',
    width: '40%',
  },
  below: {
    paddingHorizontal: 16,
    marginBottom: SIZES.height * 0.1,
  },
  balanceView: {
    width: '30%',
    justifyContent: 'flex-end',
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
});

export default HomeScreen;
