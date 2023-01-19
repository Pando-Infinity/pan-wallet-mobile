import React, { useEffect, useState, createRef, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  IMAGES,
  APP_THEMES,
  STRINGS,
  ICONS,
  TRANSACTION,
  TOKEN_SYMBOL,
  TOKEN_NAME,
  SCREEN_NAME,
  TABLE_NAME,
  CONSTANTS,
} from '../../../constants';
import { useTranslation } from 'react-i18next';
import { DAORepository, storage } from 'databases';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import {
  copyTextToClipboard,
  formatPriceChangePercentage24h,
  isUndefinedOrNull,
} from 'utils/util';
import { formatCurrency, formatDateString } from 'utils/format.util';
import { useSelector } from 'react-redux';
import {
  useRoute,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import { AvatarView } from 'components/CustionView/AvatarView';
import { getCoinInfoOnMarket } from 'utils/infoToken';
import { useCallback } from 'react';
import { getTokenBalance } from 'walletCore/balance';
import { GetBalance } from 'walletCore/';
import stringFormat from 'components/StringFormat/StringFormat';

const { SIZES, FONTS, COLOR } = APP_THEMES;

const TokenDetail = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [transactionData, setTransactionData] = useState([]);
  const [action, setAction] = useState('');
  const [tokenUnit, setTokenUnit] = useState('');
  const [date, setDate] = useState(new Date());
  const [addressFrom, setAddressFrom] = useState('');
  const [addressTo, setAddressTo] = useState('');
  const [amount, setAmount] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);
  const [displayBlockContainer, setDisplayBlockContainer] = useState(false);
  const [price, setPrice] = useState(0);
  const [changePercentPrice, setChangePercentPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [coinUnit, setCoinUnit] = useState('');

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const bs = createRef();
  const fall = new Animated.Value(1);
  const address = route.params.address;
  const firstAddress = address.slice(0, 4);
  const lastAddress = address.slice(address.length - 4, address.length);

  const walletID = useRef(
    storage.getNumber(CONSTANTS.rememberWalletIDKey) !== undefined
      ? storage.getNumber(CONSTANTS.rememberWalletIDKey)
      : 1,
  );

  const handleGetTransactionList = useCallback(() => {
    DAORepository.getTransactionHistoriesByAddress(
      route.params.id_token,
      route.params.coinSymbol.toUpperCase(),
    ).then(transaction => {
      setTransactionData(transaction);
    });
  }, [route.params.id_token, route.params.coinSymbol]);

  const renderItemTransaction = item => (
    <TouchableOpacity
      onPress={() => {
        setDisplayBlockContainer(true);
        bs.current.snapTo(0);
        setAction(item.item.actionTransaction);
        setTokenUnit(item.item.token);
        setDate(item.item.time);
        setAddressFrom(item.item.address_from);
        setAddressTo(item.item.address_to);
        setAmount(item.item.amount);
        setTransactionFee(item.item.transactionFee);
        setCoinUnit(item.item.coinByChain);
      }}>
      <View style={styles.renderItem}>
        <Image
          source={
            getStatusActionSend(item.item.actionTransaction)
              ? IMAGES.sendImage
              : IMAGES.receiveImage
          }
          resizeMode="contain"
          style={{ height: '200%', marginTop: 8 }}
        />

        <View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={[FONTS.t14r, { color: COLOR.white, marginEnd: 8 }]}>
              {t(getTextLanguageKey(item.item.actionTransaction))}
            </Text>

            {statusTransaction(item.item.statusTransaction)}
          </View>

          <Text
            style={[
              FONTS.t12r,
              { color: COLOR.textTermsCondition, marginTop: 6 },
            ]}>
            {item.item.time.toLocaleTimeString('en', { hour12: false })}
            {' - '}
            {formatDateString(item.item.time)}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {Boolean(item.item.amount) && (
          <Text style={[FONTS.t16r, styles.text_amount]}>
            {`${getTotalAmountToken(
              item.item.amount,
              item.item.actionTransaction,
            )} ${item.item.token}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatusActionSend = action => {
    switch (action) {
      case TRANSACTION.send:
      case TRANSACTION.approve:
      case TRANSACTION.transferToken:
      case TRANSACTION.depositToken:
      case TRANSACTION.buyBox:
      case TRANSACTION.unlockBox:
      case TRANSACTION.openBox:
      case TRANSACTION.sendBox:
      case TRANSACTION.sellNFT:
      case TRANSACTION.sendNFT:
      case TRANSACTION.stakeNFT: {
        return true;
      }

      case TRANSACTION.withdrawToken:
      case TRANSACTION.buyNFT:
      case TRANSACTION.unStakeNFT:
      case TRANSACTION.receive: {
        return false;
      }
    }
  };

  const statusTransaction = status => {
    switch (status) {
      case TRANSACTION.confirm: {
        return (
          <Text style={[FONTS.t12r, styles.text_confirm]}>
            {t(STRINGS.confirmed)}
          </Text>
        );
      }

      case TRANSACTION.pending: {
        return (
          <Text style={[FONTS.t12r, styles.text_pending]}>
            {t(STRINGS.pending)}
          </Text>
        );
      }

      case TRANSACTION.failed: {
        return (
          <Text style={[FONTS.t12r, styles.text_failed]}>
            {t(STRINGS.failed)}
          </Text>
        );
      }
    }
  };

  const getTotalAmountToken = (amount, action) => {
    switch (action) {
      case TRANSACTION.send:
      case TRANSACTION.transferToken:
      case TRANSACTION.depositToken: {
        return '-' + parseFloat(amount.toFixed(7));
      }

      case TRANSACTION.withdrawToken:
      case TRANSACTION.receive: {
        return '+' + parseFloat(amount.toFixed(7));
      }
    }
  };

  const getOperator = () => {
    switch (action) {
      case TRANSACTION.send:
      case TRANSACTION.transferToken:
      case TRANSACTION.depositToken: {
        return '-';
      }

      case TRANSACTION.withdrawToken:
      case TRANSACTION.receive: {
        return '+';
      }
    }
  };

  const getTextLanguageKey = action => {
    switch (action) {
      case TRANSACTION.send: {
        return STRINGS.send;
      }

      case TRANSACTION.receive: {
        return STRINGS.receive;
      }

      case TRANSACTION.approve: {
        return STRINGS.approve;
      }

      case TRANSACTION.transferToken:
      case TRANSACTION.depositToken:
      case TRANSACTION.withdrawToken: {
        return STRINGS.transferToken;
      }

      case TRANSACTION.buyBox: {
        return STRINGS.buyBox;
      }

      case TRANSACTION.unlockBox: {
        return STRINGS.unlockBox;
      }

      case TRANSACTION.openBox: {
        return STRINGS.openBox;
      }

      case TRANSACTION.sendBox: {
        return STRINGS.sendBox;
      }

      case TRANSACTION.buyNFT:
      case TRANSACTION.sellNFT:
      case TRANSACTION.sendNFT:
      case TRANSACTION.stakeNFT:
      case TRANSACTION.unStakeNFT: {
        return STRINGS.transferNFT;
      }
    }
  };

  const getTextLanguageKeyBottomSheet = action => {
    switch (action) {
      case TRANSACTION.send: {
        return STRINGS.sent_symbol;
      }

      case TRANSACTION.receive: {
        return STRINGS.receive_symbol;
      }

      case TRANSACTION.approve: {
        return STRINGS.approve;
      }

      case TRANSACTION.transferToken:
      case TRANSACTION.depositToken:
      case TRANSACTION.withdrawToken: {
        return STRINGS.transferToken;
      }

      case TRANSACTION.buyBox: {
        return STRINGS.buyBox;
      }

      case TRANSACTION.unlockBox: {
        return STRINGS.unlockBox;
      }

      case TRANSACTION.openBox: {
        return STRINGS.openBox;
      }

      case TRANSACTION.sendBox: {
        return STRINGS.sendBox;
      }

      case TRANSACTION.buyNFT:
      case TRANSACTION.sellNFT:
      case TRANSACTION.sendNFT:
      case TRANSACTION.stakeNFT:
      case TRANSACTION.unStakeNFT: {
        return STRINGS.transferNFT;
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.bottom_sheet_header}>
      <Text style={[FONTS.t16b, styles.text_header]}>
        {stringFormat(t(getTextLanguageKeyBottomSheet(action)), [
          `${tokenUnit?.toUpperCase() ?? ''}`,
        ])}
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

  const renderInner = () => (
    <View style={{ backgroundColor: COLOR.simpleBackground, height: '100%' }}>
      <View style={{ height: 1, backgroundColor: COLOR.gray5 }} />
      <View style={styles.container_text_date}>
        <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
          {t(STRINGS.date)}
        </Text>

        <View style={{ flex: 1 }} />

        <Text style={[FONTS.t16r, { color: COLOR.textTermsCondition }]}>
          {date.toLocaleTimeString('en', { hour12: false })}
          {' - '}
          {formatDateString(date)}
        </Text>
      </View>

      <View style={styles.container_text_from}>
        <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
          {t(STRINGS.from)}
        </Text>

        <View style={{ flex: 1 }} />

        <Text style={[FONTS.t16r, { color: COLOR.textTermsCondition }]}>
          {addressFrom.slice(0, 4)}
          {'...'}
          {addressFrom.slice(addressFrom.length - 4, addressFrom.length)}
        </Text>
      </View>

      <View style={styles.container_text_from}>
        <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
          {t(STRINGS.to)}
        </Text>

        <View style={{ flex: 1 }} />

        <Text style={[FONTS.t16r, { color: COLOR.textTermsCondition }]}>
          {addressTo.slice(0, 4)}
          {'...'}
          {addressTo.slice(addressTo.length - 4, addressTo.length)}
        </Text>
      </View>

      <View style={[styles.container_text_from, { marginTop: 40 }]}>
        <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
          {t(STRINGS.amount)}
        </Text>

        <View style={{ flex: 1 }} />

        <Text style={[FONTS.t16r, { color: COLOR.textTermsCondition }]}>
          {getOperator(action)}
          {parseFloat(amount.toFixed(10))} {tokenUnit}
        </Text>
      </View>

      <View
        style={[
          styles.container_text_from,
          { display: action === TRANSACTION.receive ? 'none' : 'flex' },
        ]}>
        <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
          {t(STRINGS.transactionFee)}
        </Text>

        <View style={{ flex: 1 }} />

        <Text style={[FONTS.t16r, { color: COLOR.textTermsCondition }]}>
          -{parseFloat(transactionFee.toFixed(10))} {coinUnit}
        </Text>
      </View>
    </View>
  );

  const handleWallet = wallet => {
    navigation.navigate(SCREEN_NAME.sendToken, {
      walletID: walletID.current,
      list: [route.params],
      screen: route.screen,
      wallet: wallet,
    });
  };

  const handleGetTokenData = useCallback(async () => {
    const symbol = route.params.coinSymbol;
    const name = route.params.name;
    getCoinInfoOnMarket(symbol, fiatCurrency, name).then(info => {
      setPrice(info?.[0]?.current_price || 0);
      setChangePercentPrice(info?.[0]?.price_change_percentage_24h || 0);
    });
    let newBalance = 0;
    if (route.params.type === 'coin') {
      newBalance = await GetBalance.getCoinBalance(
        address,
        route.params.coinSymbol,
      );
    } else {
      newBalance = await getTokenBalance(
        route.params.address,
        route.params.contract,
        route.params.type,
      );
    }
    const formatBalance = parseFloat(
      (newBalance / Math.pow(10, route.params.decimal)).toFixed(7),
    );
    setBalance(formatBalance);
  }, [
    route.params.address,
    route.params.contract,
    route.params.coinSymbol,
    route.params.type,
    route.params.name,
    route.params.decimal,
    address,
    fiatCurrency,
  ]);

  useEffect(() => {
    if (isFocused) {
      handleGetTransactionList();
      const interval = setInterval(() => {
        handleGetTransactionList();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isFocused, handleGetTransactionList]);

  useEffect(() => {
    if (!isFocused) return;

    handleGetTokenData();

    const interval = setInterval(() => {
      handleGetTokenData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isFocused, handleGetTokenData]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={styles.container}
        resizeMode="cover">
        <Animated.View
          style={{
            flex: 1,
          }}>
          <View style={styles.above}>
            <View style={styles.headerTop}>
              <View style={styles.headerUp}>
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    left: 0,
                  }}
                  onPress={() =>
                    navigation.navigate(SCREEN_NAME.navigationBottomTab)
                  }>
                  <Image
                    source={ICONS.backButton}
                    style={{
                      height: SIZES.iconSize,
                      width: SIZES.iconSize,
                      marginTop: 12.5,
                      marginBottom: 12.5,
                      marginStart: 15.5,
                      marginEnd: 15.5,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
                  {route.params.name}
                </Text>
              </View>

              <View style={styles.headerDown}>
                <Text
                  style={{
                    ...FONTS.t12r,
                    color: COLOR.textSecondary,
                    marginStart: SIZES.simpleMargin,
                  }}>
                  {t(STRINGS.coin)}
                </Text>

                {(!isUndefinedOrNull(price) ||
                  !isUndefinedOrNull(changePercentPrice)) && (
                  <Text
                    style={{
                      ...FONTS.t12r,
                      color: COLOR.white,
                      justifyContent: 'space-between',
                      marginEnd: SIZES.simpleMargin,
                    }}>
                    {formatCurrency(price, fiatCurrency, 5)}
                    <View style={{ width: 10 }} />

                    <Text
                      style={{
                        ...FONTS.t12r,
                        color:
                          changePercentPrice > 0
                            ? COLOR.systemGreenLight1
                            : COLOR.systemRedLight,
                      }}>
                      {formatPriceChangePercentage24h(changePercentPrice)}
                    </Text>
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.headerContent}>
              <AvatarView
                size={SIZES.detailIconSize}
                image={route.params.image}
              />

              <Text
                style={{
                  ...FONTS.t30b,
                  color: COLOR.white,
                  marginTop: SIZES.simpleSpace,
                }}>
                {`${balance ? balance : route.params.balance}${
                  route.params.coinSymbol
                    ? ` ${route.params.coinSymbol.toUpperCase()}`
                    : ''
                }`}
              </Text>

              <Text
                style={{
                  ...FONTS.t16b,
                  color: COLOR.textSecondary,
                  marginTop: 4,
                }}>
                {formatCurrency(
                  Number(price) * Number(route.params.balance),
                  fiatCurrency,
                  5,
                )}
              </Text>

              <TouchableOpacity
                onPress={() => copyTextToClipboard(t, route.params.address)}
                style={styles.buttonCopy}>
                <Text
                  style={{
                    ...FONTS.t12r,
                    color: COLOR.textSecondary,
                    marginRight: 10,
                  }}>
                  {firstAddress}...{lastAddress}
                </Text>

                <Image source={ICONS.copy} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerBottom}>
              <View style={styles.receiveButtonContainer}>
                <TouchableOpacity
                  style={{
                    marginTop: SIZES.height * 0.05,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    let type = route.params.type;
                    if (type === 'coin') {
                      type = getChainName(
                        route.params.type,
                        route.params.asset_id,
                      );
                    }
                    DAORepository.getAllData(TABLE_NAME.address_schema).then(
                      val => {
                        const walletData = val.filter(item => {
                          return item.idAccountWallet === walletID.current;
                        })[0].addressList;
                        switch (type) {
                          case 'ERC20':
                          case 'BEP20':
                            for (const element of walletData) {
                              const [coin, id] = element.split('-');
                              if (
                                coin === TOKEN_NAME.ethereum ||
                                coin === TOKEN_NAME.smartChain
                              ) {
                                DAORepository.getEthereumById(
                                  parseInt(id),
                                ).then(handleWallet);
                                return;
                              }
                            }
                            break;
                          case 'BTC':
                            for (const element of walletData) {
                              const [coin, id] = element.split('-');
                              if (coin === TOKEN_NAME.bitcoin) {
                                DAORepository.getBitcoinById(parseInt(id)).then(
                                  handleWallet,
                                );
                                return;
                              }
                            }
                            break;
                          case 'SPL':
                            for (const element of walletData) {
                              const [coin, id] = element.split('-');
                              if (coin === TOKEN_NAME.solana) {
                                DAORepository.getSolanaById(parseInt(id)).then(
                                  handleWallet,
                                );
                                return;
                              }
                            }
                            break;
                        }
                      },
                    );
                  }}>
                  <Image source={ICONS.sendButton} resizeMode="cover" />
                </TouchableOpacity>

                <Text
                  style={{
                    ...FONTS.t14r,
                    color: COLOR.white,
                  }}>
                  {t(STRINGS.send)}
                </Text>
              </View>

              <View style={styles.receiveButtonContainer}>
                <TouchableOpacity
                  style={{
                    marginTop: SIZES.height * 0.05,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() =>
                    navigation.navigate(SCREEN_NAME.receiveTokenDetail, {
                      name: route.params.name,
                      symbol: route.params.asset_id,
                      image: route.params.image,
                      address: route.params.address,
                    })
                  }>
                  <Image source={ICONS.receiveButton} resizeMode="cover" />
                </TouchableOpacity>

                <Text
                  style={{
                    ...FONTS.t14r,
                    color: COLOR.white,
                  }}>
                  {t(STRINGS.receive)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.below}>
            <Text style={[FONTS.t16b, styles.text_asset]}>
              {t(STRINGS.asset_record)}
            </Text>

            <View
              style={[
                styles.container_transaction,
                { display: transactionData.length === 0 ? 'flex' : 'none' },
              ]}>
              <Image
                source={IMAGES.assetRecordImage}
                resizeMode={'cover'}
                style={styles.img_asset_record}
              />

              <Text style={[FONTS.t14r, { color: COLOR.textTermsCondition }]}>
                {t(STRINGS.no_transactions_yet)}
              </Text>

              <Text style={[FONTS.t12r, styles.text_no_transaction]}>
                {t(STRINGS.transaction_description)}
              </Text>
            </View>

            <View
              style={[
                styles.container_transaction,
                { display: transactionData.length > 0 ? 'flex' : 'none' },
              ]}>
              <FlatList
                style={{
                  width: '100%',
                  marginBottom: SIZES.heightScreen * 0.055,
                }}
                data={transactionData}
                extraData={transactionData}
                renderItem={item => renderItemTransaction(item)}
                showsVerticalScrollIndicator={true}
              />
            </View>
          </View>
        </Animated.View>

        <View
          style={[
            styles.block_container,
            { display: displayBlockContainer ? 'flex' : 'none' },
          ]}
        />

        <BottomSheet
          ref={bs}
          snapPoints={[SIZES.heightScreen * 0.5, 0]}
          initialSnap={1}
          callbackNode={fall}
          enabledGestureInteraction={true}
          renderHeader={renderHeader}
          renderContent={renderInner}
          overdragResistanceFactor={0}
        />
      </ImageBackground>
    </View>
  );
};

const getChainName = (type, asset_id) => {
  // detect chain type
  if (type === 'coin') {
    switch (asset_id) {
      case TOKEN_SYMBOL.btc.toUpperCase():
        return 'BTC';
      case TOKEN_SYMBOL.bsc.toUpperCase():
      case TOKEN_SYMBOL.bnb.toUpperCase():
        return 'BEP20';
      case TOKEN_SYMBOL.eth.toUpperCase():
        return 'ERC20';
      default:
        return 'SPL';
    }
  }
  return '';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  above: {
    marginBottom: 40,
    alignItems: 'center',
    paddingTop: SIZES.marginStatusbar,
  },

  headerTop: {
    width: SIZES.width,
    justifyContent: 'flex-start',
  },

  headerUp: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerDown: {
    top: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  headerContent: {
    marginTop: 18,
    alignItems: 'center',
  },

  buttonCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.stateDefault,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 17,
  },

  headerBottom: {
    height: 80,
    flexDirection: 'row',
    paddingHorizontal: SIZES.width * 0.25,
    width: SIZES.width,
    justifyContent: 'space-between',
    marginTop: SIZES.simpleMargin,
  },

  sendButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '60%',
    width: '40%',
  },

  receiveButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '60%',
    width: '40%',
  },

  below: {
    flex: 1,
    justifyContent: 'center',
  },

  text_asset: {
    color: COLOR.white,
    marginStart: 16,
    marginBottom: 8,
  },

  container_transaction: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },

  img_asset_record: {
    marginTop: 32,
    width: SIZES.heightScreen * 0.148,
    height: SIZES.heightScreen * 0.148,
  },

  text_no_transaction: {
    color: COLOR.textTermsCondition,
    textAlign: 'center',
    marginTop: 8,
  },

  renderItem: {
    flexDirection: 'row',
    backgroundColor: COLOR.neutralSurface2,
    marginTop: 12,
    marginStart: 16,
    marginEnd: 16,
    borderRadius: 8,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },

  text_amount: { color: COLOR.white, justifyContent: 'flex-end', marginEnd: 8 },

  text_confirm: {
    color: COLOR.systemGreenLight1,
    backgroundColor: COLOR.systemGreenLight2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingStart: 4,
    paddingEnd: 4,
    borderRadius: 4,
  },

  text_pending: {
    color: COLOR.systemYellowLight,
    backgroundColor: COLOR.systemYellowLight2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingStart: 4,
    paddingEnd: 4,
    borderRadius: 4,
  },

  text_failed: {
    color: COLOR.systemRedLight,
    backgroundColor: COLOR.systemRedLight2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingStart: 4,
    paddingEnd: 4,
    borderRadius: 4,
  },

  bottom_sheet_header: {
    backgroundColor: COLOR.simpleBackground,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    position: 'relative',
  },

  button_close_bottom_sheet: {
    position: 'absolute',
    end: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginEnd: 20,
  },

  text_header: {
    textAlign: 'center',
    color: COLOR.white,
    marginTop: SIZES.simpleMargin,
    marginBottom: 15,
  },

  container_text_date: {
    flexDirection: 'row',
    marginStart: 16,
    marginEnd: 16,
    marginTop: 24,
    alignItems: 'center',
  },

  container_text_from: {
    flexDirection: 'row',
    marginStart: 16,
    marginEnd: 16,
    marginTop: 16,
    alignItems: 'center',
  },

  block_container: {
    height: SIZES.heightScreen * 0.5,
    width: SIZES.widthScreen,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLOR.blackOpacity04,
  },
});
export default TokenDetail;
