import React, { useState, useEffect, useRef } from 'react';
import {
  ImageBackground,
  View,
  TouchableOpacity,
  Text,
  Image,
  Keyboard,
  Modal,
  TextInput,
  FlatList,
  NativeModules,
  NativeEventEmitter,
  ScrollView,
  DeviceEventEmitter,
  Platform,
} from 'react-native';

import { ethGasLimit } from 'constants/walletConst';

import CustomButton from 'components/CustomButton/CustomButton';
import {
  IMAGES,
  ICONS,
  FONTS,
  COLOR,
  SIZES,
  CONSTANT_EVENT_EMITTER,
  STRINGS,
  TABLE_NAME,
  TOKEN_NAME,
  SCREEN_NAME,
  CONSTANTS,
} from 'constants';
import LinearGradient from 'react-native-linear-gradient';
import { toUpper } from 'lodash';
import { useTranslation } from 'react-i18next';
import stringFormat from 'components/StringFormat/StringFormat';
import { isBtcAddress, isSolAddress, isEthAddress } from 'walletCore/validate';
import { chain } from 'models/Coins';
import { DAORepository, storage } from 'databases';
import { getCoinBalance, getTokenBalance } from 'walletCore/balance';
import { GasOptions } from 'models/GasOptions';
import { HideKeyboard } from 'components/Keyboard/HideKeyboard';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomNumericInput from 'components/inputs/CustomNumericInput';
import CustomTextInput from 'components/inputs/CustomTextInput';
import { useSelector } from 'react-redux';
import { AvatarView } from 'components/CustionView/AvatarView';
import { getCoinInfoOnMarket } from 'utils/infoToken';
import { getFeeData, getGasPrice, getGasStatusLabel } from 'utils/gas.util';
import TransactionFeeIcon from 'components/common/TransactionFeeIcon';
import { Slider } from 'components/common';
import { toFixed } from 'utils/transactionFeeShow';
import Web3 from 'web3';
import { BigNumber } from 'ethers';

const qrCode = NativeModules.QRCodeModule;
const { ScannerModule } = NativeModules;

const SendToken = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const walletID = route.params.walletID || 1;

  const formatNumber = new Intl.NumberFormat('en-En', {
    style: 'currency',
    currency: fiatCurrency,
  });

  const listToken = route.params.list
    .map(item => {
      if (item.type === 'coin') {
        return chain.find(val => {
          return val.symbol.toLowerCase() === item.coinSymbol.toLowerCase();
        });
      }
      return {
        symbol: item.coinSymbol === 'BSC' ? 'BNB' : item.coinSymbol,
        name: item.name,
        type: item.type,
        logo: item.image,
        id: item.address,
        contract: item.contract,
        decimals: item.decimals ? item.decimals : 18,
      };
    })
    .map((item, index) => {
      return {
        ...item,
        index: index,
      };
    });
  const [txt, setTxt] = useState('');
  const [selected, setSelected] = useState(listToken.length === 1 ? 0 : -1);
  const [valid, setValid] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [searchData, setSearchData] = useState(listToken);
  const [addressTxt, setAddressTxt] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [wallet, setWallet] = useState(route.params.wallet);
  const [asset, setAsset] = useState('0');
  const [labelAsset, setLabelAsset] = useState('0');
  const [isValidAsset, setValidAsset] = useState(false);

  const [coinBalance, setCoinBalance] = useState(0);
  const [fiasPerToken, setFiasPerToken] = useState(0);
  const [fiasPerCoin, setFiasPerCoin] = useState(0);
  const [walletData, setWalletData] = useState([]);
  const [totalTx, setTotalTx] = useState(0);
  const [txInvalid, setTxInvalid] = useState(false);
  const ethGasBaseFee = storage.getNumber(CONSTANTS.ethGasPrice);
  const bscGasPrice = storage.getNumber(CONSTANTS.bscGasPrice);
  const [ethGasBase, setEthGasBase] = useState(ethGasBaseFee);
  const [bscGasBase, setBscGasBase] = useState(bscGasPrice);
  const calTransactionFee = (
    indexToken = 0,
    indexOption,
    listOption = options.current,
  ) => {
    const token = listToken[indexToken];

    let option = indexOption
      ? listOption[indexOption]
      : listOption.find(item => {
          return item.stt === 'Medium';
        });

    if (indexOption === 0) {
      option = listOption[0];
    }

    const coin =
      token.type === 'Coin'
        ? token
        : chain.find(element => {
            return element.chainType === token.type;
          });

    switch (coin.chainType) {
      case 'BTC':
        return {
          coin: coin,
          gas: option.tip,
        };
      case 'ERC20':
        return {
          coin: coin,
          gas: (option.tip + ethGasBase) * 1e9 * ethGasLimit,
        };
      case 'BEP20': {
        const newGas = (option.tip + bscGasBase) * 1e9 * ethGasLimit;
        return {
          coin: coin,
          gas: newGas,
        };
      }
      case 'SPL':
        return {
          coin: coin,
          gas: option.tip,
        };
    }
  };

  const bindGasOption = item => {
    const type = item.chainType ? item.chainType : item.type;

    switch (type) {
      case 'BTC':
        return GasOptions.btc;
      case 'ERC20':
        return GasOptions.eth;
      case 'BEP20':
        return GasOptions.bsc;
      case 'SPL':
        return GasOptions.sol;
      default:
        return [];
    }
  };

  const bindIndexFirstOption = item => {
    const list = bindGasOption(item);
    for (let i = 0; i < list.length; i++) {
      if (list[i].stt === 'Medium') {
        return i;
      }
    }
    return 0;
  };

  const [gasInfo, setGasInfo] = useState(
    listToken.length === 1
      ? calTransactionFee(0, null, bindGasOption(listToken[0]))
      : {},
  );

  const options = useRef(
    listToken.length === 1 ? bindGasOption(listToken[0]) : [],
  );
  const [selectedOptions, setSelectedOption] = useState(
    listToken.length === 1 ? bindIndexFirstOption(listToken[0]) : 0,
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (
      !gasInfo.coin?.symbol ||
      !gasInfo.coin?.name ||
      !fiatCurrency ||
      !listToken[selected].symbol ||
      !listToken[selected].name
    )
      return;
    getCoinInfoOnMarket(
      listToken[selected].symbol,
      fiatCurrency,
      listToken[selected].name,
    ).then(info => {
      setFiasPerToken(info?.[0]?.current_price || 0);
    });
    getCoinInfoOnMarket(
      gasInfo.coin?.symbol,
      fiatCurrency,
      gasInfo.coin?.name,
    ).then(info => {
      setFiasPerCoin(info?.[0]?.current_price || 0);
    });
  }, [
    fiatCurrency,
    listToken,
    gasInfo.coin?.name,
    gasInfo.coin?.symbol,
    selected,
  ]);

  useEffect(() => {
    if (wallet?.address && listToken.length === 1) {
      bindInfoBalanceWallet(listToken[0], wallet);
    }
    bindDataWallet();
    bindDataToken();
    const event = new NativeEventEmitter(qrCode);
    event.addListener(CONSTANT_EVENT_EMITTER.receiptCode, val => {
      setAddressTxt(val.code);
    });
    DeviceEventEmitter.addListener(CONSTANT_EVENT_EMITTER.seedPhrase, data => {
      setAddressTxt(data.message);
    });
    return () => {
      event.removeAllListeners(CONSTANT_EVENT_EMITTER.receiptCode);
      DeviceEventEmitter.removeAllListeners(CONSTANT_EVENT_EMITTER.seedPhrase);
    };
  }, [wallet?.address]);

  useEffect(() => {
    if (selected < 0) {
      return;
    }
    const verifiedAsset = labelAsset || 0;
    const newTotalFee =
      Number(verifiedAsset) * fiasPerToken +
      (gasInfo.gas * fiasPerCoin) / 10 ** gasInfo.coin?.decimals;
    setTotalTx(newTotalFee);
  }, [asset, fiasPerCoin, gasInfo, selected, listToken, labelAsset]);

  useEffect(() => {
    if (selected < 0) {
      return;
    }
    const newAssetLabel = labelAsset.split('.');
    const decimalPart = newAssetLabel[1];
    if (decimalPart?.length > listToken[selected].decimals) {
      setValidAsset(true);
    } else {
      setValidAsset(false);
    }
    if (labelAsset && asset !== '0') {
      if (parseFloat(labelAsset) < 0) {
        setLabelAsset('0');
        setAsset('0');
      }

      if (listToken[selected]?.decimals === 18) {
        if (
          labelAsset > Web3.utils.fromWei(asset, 'ether') &&
          labelAsset.slice(-1) !== '0'
        ) {
          setTxInvalid(true);
          return;
        } else {
          setTxInvalid(false);
        }
      } else {
        if (
          Number(labelAsset * Math.pow(10, listToken[selected].decimals)) >
          Number(asset)
        ) {
          setTxInvalid(true);
          return;
        } else {
          setTxInvalid(false);
        }
      }

      if (listToken[selected].type === 'Coin') {
        setTxInvalid(
          asset !== '0'
            ? BigInt(asset) + BigInt(`${parseInt(gasInfo.gas, 10)}`) >
                BigInt(`${coinBalance}`)
            : labelAsset * Math.pow(10, listToken[selected].decimals) +
                gasInfo.gas >
                coinBalance,
        );
      } else {
        setTxInvalid(
          labelAsset * Math.pow(10, listToken[selected].decimals) >
            tokenBalance || gasInfo.gas > coinBalance,
        );
      }
    }
  }, [
    asset,
    selected,
    listToken[selected]?.decimals,
    listToken[selected]?.type,
    gasInfo,
    coinBalance,
    tokenBalance,
    labelAsset,
  ]);

  const bindDataWallet = () => {
    DAORepository.getAllData(TABLE_NAME.address_schema).then(val => {
      const list = val.filter(item => {
        return item.idAccountWallet === walletID;
      });
      setWalletData(list[0].addressList);
    });
  };

  const header = () => {
    return (
      <View
        style={{
          marginTop: 60,
        }}>
        <TouchableOpacity
          onPress={navigation.goBack}
          style={{
            width: 15,
            height: 15,
            marginLeft: SIZES.simpleSpace + 3,
          }}>
          <Image
            source={ICONS.backButton}
            style={{ marginTop: SIZES.simpleSpace + 5 }}
          />
        </TouchableOpacity>
        <Text
          style={{
            alignSelf: 'center',
            ...FONTS.t16b,
            color: COLOR.white,
          }}>
          {t(STRINGS.send_token)}
        </Text>
      </View>
    );
  };

  const bindDataToken = () => {
    setSearchData(listToken);
  };

  const bindInfoBalanceWallet = async (token, mainWallet) => {
    // token is coin
    if (token.chainType) {
      const balance = await getCoinBalance(mainWallet.address, token.chainType);
      setCoinBalance(balance);
      setTokenBalance(balance);
    } else {
      const tokenBalanceValue = await getTokenBalance(
        mainWallet.address,
        token.contract,
        token.type,
      );

      const coinBalanceValue = await getCoinBalance(
        mainWallet.address,
        token.type,
      );
      setCoinBalance(coinBalanceValue);
      setTokenBalance(tokenBalanceValue);
    }
  };

  const tokenInfo = () => {
    const tokenNotSelected = () => {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: SIZES.simpleMargin,
            flexDirection: 'row',
          }}>
          <Text style={{ color: COLOR.white, ...FONTS.t14b }}>
            {t(STRINGS.token)}
          </Text>
          <View style={{ flex: 1 }} />
          <Image source={ICONS.caretDown} style={{ width: 15, height: 7.5 }} />
        </View>
      );
    };

    const showToken = token => {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: SIZES.simpleMargin,
            flexDirection: 'row',
          }}>
          <View>
            <Text style={{ color: COLOR.textSecondary, ...FONTS.t12b }}>
              {t(STRINGS.token)}
            </Text>
            <View
              style={{
                marginTop: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <AvatarView size={SIZES.iconSize} image={token.logo} />
              <Text
                style={{ color: COLOR.white, marginLeft: 4, ...FONTS.t14r }}>
                {token.name}
              </Text>
              <Text
                style={{
                  color: COLOR.textSecondary,
                  marginLeft: 4,
                  ...FONTS.t12r,
                }}>
                {token.symbol}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }} />
          {listToken.length !== 1 && (
            <Image
              source={ICONS.caretDown}
              style={{ width: 15, height: 7.5 }}
            />
          )}
        </View>
      );
    };
    return (
      <TouchableOpacity
        activeOpacity={listToken.length !== 1 ? 0 : 1}
        onPress={() => {
          if (listToken.length !== 1) {
            setVisible(true);
          }
        }}
        style={{
          marginHorizontal: SIZES.simpleMargin,
          backgroundColor: COLOR.gray3,
          marginTop: 34,
          height: 56,
          flexDirection: 'row',
          borderRadius: SIZES.simpleSpace,
        }}>
        {selected === -1 ? tokenNotSelected() : showToken(listToken[selected])}
      </TouchableOpacity>
    );
  };

  const scanBtn = () => {
    return (
      <View style={{ flexDirection: 'row-reverse' }}>
        <TouchableOpacity
          style={{
            width: SIZES.iconWidth,
            height: SIZES.iconHeight,
            marginRight: SIZES.simpleSpace,
          }}
          onPress={() => {
            if (Platform.OS === 'ios') {
              qrCode.scanQRCode(CONSTANT_EVENT_EMITTER.scanEvent.mnemonic);
            } else {
              ScannerModule.navigateToNative(CONSTANTS.importExistingWallet);
            }
          }}>
          <Image
            source={ICONS.qrCode}
            style={{ marginTop: SIZES.simpleSpace }}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>
    );
  };

  const validateAddress = text => {
    if (text === '' || selected < 0) {
      return false;
    }
    switch (listToken[selected].chainType) {
      case 'ERC20':
      case 'BEP20':
        return !isEthAddress(text);
      case 'SPL':
        return !isSolAddress(text);
      case 'BTC':
        return !isBtcAddress(text);
      default:
        break;
    }
    switch (listToken[selected].type) {
      case 'ERC20':
      case 'BEP20':
        return !isEthAddress(text);
      case 'SPL':
        return !isSolAddress(text);
      case 'BTC':
        return !isBtcAddress(text);
      default:
        return true;
    }
  };

  const checkIsSentMaxBalance = () => {
    const maxTotal =
      BigInt(`${tokenBalance}`) - BigInt(`${parseInt(gasInfo.gas, 10)}`);
    return asset === maxTotal.toString();
  };

  useEffect(() => {
    setValid(validateAddress(addressTxt));
  }, [addressTxt, selected]);

  const addressTextField = () => {
    return (
      <View style={{ paddingHorizontal: SIZES.simpleMargin }}>
        <CustomTextInput
          label={t(STRINGS.recipient_address)}
          multiline
          error={valid}
          value={addressTxt}
          onChangeText={setAddressTxt}
        />
        {valid && (
          <Text
            style={{
              marginTop: SIZES.simpleSpace,
              color: COLOR.systemRedLight,
              ...FONTS.t12r,
            }}>
            {t(STRINGS.invalid_address)}
          </Text>
        )}
      </View>
    );
  };

  const balanceInfo = () => {
    return (
      <View style={{ flexDirection: 'row-reverse', marginTop: 22 }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: SIZES.simpleMargin,
            paddingVertical: SIZES.simpleSpace,
            marginRight: SIZES.simpleMargin,
          }}
          onPress={() => {
            // const symbol = listToken[selected].symbol;
            let maxAsset = BigInt(`${tokenBalance}`);
            if (listToken[selected].type === 'Coin') {
              maxAsset -= BigInt(`${parseInt(gasInfo.gas, 10)}`);
            }
            setAsset(maxAsset.toString());
            if (listToken[selected]?.decimals === 18) {
              setLabelAsset(Web3.utils.fromWei(maxAsset.toString(), 'ether'));
            } else {
              setLabelAsset(
                (
                  parseFloat(maxAsset) /
                  Math.pow(10, listToken[selected].decimals)
                ).toString(),
              );
            }
          }}>
          <Text style={{ color: COLOR.white, ...FONTS.t12b }}>
            {t(STRINGS.max)}
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            paddingTop: SIZES.simpleSpace,
            color: COLOR.textSecondary,
            ...FONTS.t12r,
          }}>
          {stringFormat(t(STRINGS.balance), [
            Number(
              (tokenBalance / 10 ** listToken[selected].decimals).toFixed(7),
            ),
            listToken[selected].symbol,
          ])}
        </Text>
        <View style={{ flex: 1 }} />
      </View>
    );
  };

  const assetTextInput = () => {
    return (
      <View
        style={{
          paddingStart: SIZES.simpleMargin,
          paddingEnd: SIZES.simpleMargin,
          marginTop: selected >= 0 ? 0 : SIZES.simpleMargin,
        }}>
        <CustomNumericInput
          label={t(STRINGS.asset)}
          value={labelAsset}
          onChangeText={setLabelAsset}
        />
      </View>
    );
  };

  const sendButton = () => {
    return (
      <View
        style={{
          marginBottom: 58,
          width: SIZES.width,
          height: SIZES.buttonHeight,
          alignItems: 'center',
        }}>
        <CustomButton
          onPress={() => {
            navigation.navigate(SCREEN_NAME.confirm_Send, {
              wallet: wallet,
              to: addressTxt,
              asset: labelAsset,
              gas: gasInfo,
              screen: route.params.screen,
              coin: listToken[selected],
              fiasCoin: fiasPerCoin,
              fiasToken: fiasPerToken,
              total: totalTx,
              walletID: walletID,
              isSendMax: checkIsSentMaxBalance(),
            });
          }}
          isDisable={
            selected < 0 ||
            txInvalid ||
            !labelAsset ||
            labelAsset <= 0 ||
            valid ||
            addressTxt.length === 0 ||
            isValidAsset
          }
          width={SIZES.width - SIZES.simpleMargin * 2}
          height={SIZES.buttonHeight}
          label={t(STRINGS.send)}
        />
      </View>
    );
  };

  const BottomSheet = () => {
    const searchView = () => {
      const Background = ({ children }) => {
        if (!isFocus) {
          return (
            <View
              style={{
                marginHorizontal: SIZES.simpleMargin,
                marginTop: 10,
                paddingLeft: SIZES.simpleMargin,
                backgroundColor: COLOR.gray3,
                height: 48,
                borderRadius: SIZES.simpleSpace,
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {children}
            </View>
          );
        } else {
          return (
            <View
              style={{
                marginHorizontal: SIZES.simpleMargin,
                flexDirection: 'row',
                paddingHorizontal: SIZES.simpleMargin,
                marginTop: 10,
              }}>
              <LinearGradient
                colors={COLOR.gradient3}
                style={{
                  flex: 1,
                  padding: 1,
                  height: 48,
                  borderRadius: SIZES.simpleSpace,
                }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: COLOR.gray3,
                    alignItems: 'center',
                    paddingLeft: SIZES.simpleMargin,
                    borderRadius: SIZES.simpleSpace,
                    flexDirection: 'row',
                  }}>
                  {children}
                </View>
              </LinearGradient>

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setTxt('');
                  setSearchData(listToken);
                  setIsFocus(false);
                }}
                style={{
                  marginLeft: SIZES.simpleSpace,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: COLOR.white,
                    ...FONTS.t14r,
                    alignSelf: 'center',
                  }}>
                  {t(STRINGS.cancle_btn)}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
      };

      return (
        <Background>
          <Image
            source={ICONS.search}
            style={{ width: SIZES.iconSize, height: SIZES.iconSize }}
          />
          <TextInput
            style={{
              color: COLOR.white,
              flex: 1,
              marginLeft: SIZES.simpleSpace,
            }}
            placeholder={t(STRINGS.search_token)}
            placeholderTextColor={COLOR.white}
            onFocus={() => {
              setIsFocus(true);
            }}
            onBlur={() => {
              setIsFocus(false);
            }}
            autoFocus={isFocus}
            value={txt}
            onChangeText={newTxt => {
              setTxt(newTxt);
              setSearchData(
                listToken.filter(item => {
                  return (
                    toUpper(item.symbol).indexOf(toUpper(newTxt)) > -1 ||
                    toUpper(item.name).indexOf(toUpper(newTxt)) > -1
                  );
                }),
              );
            }}
          />
          <TouchableOpacity
            style={{
              width: SIZES.iconWidth,
              height: SIZES.iconHeight,
            }}
            onPress={() => {
              setTxt('');
              setSearchData(listToken);
            }}>
            {isFocus && <Image source={ICONS.clear} />}
          </TouchableOpacity>
        </Background>
      );
    };

    const main = () => {
      const renderItem = data => {
        const handleWallet = wallet => {
          setWallet(wallet);
          bindInfoBalanceWallet(data.item, wallet);
        };

        const setWalletWhyChangeCoin = () => {
          const type = data.item.chainType
            ? data.item.chainType
            : data.item.type;
          switch (type) {
            case 'ERC20':
            case 'BEP20':
              for (const element of walletData) {
                const [coin, id] = element.split('-');
                if (
                  coin === TOKEN_NAME.ethereum ||
                  coin === TOKEN_NAME.smartChain
                ) {
                  DAORepository.getEthereumById(parseInt(id)).then(
                    handleWallet,
                  );
                  return;
                }
              }
              break;
            case 'BTC':
              for (const element of walletData) {
                const [coin, id] = element.split('-');
                if (coin === TOKEN_NAME.bitcoin) {
                  DAORepository.getBitcoinById(parseInt(id)).then(handleWallet);
                  return;
                }
              }
              break;
            case 'SPL':
              for (const element of walletData) {
                const [coin, id] = element.split('-');
                if (coin === TOKEN_NAME.solana) {
                  DAORepository.getSolanaById(parseInt(id)).then(handleWallet);
                  return;
                }
              }
              break;
          }
        };

        return (
          <TouchableOpacity
            onPress={() => {
              setSelected(data.item.index);
              setWalletWhyChangeCoin();
              setValid(validateAddress(addressTxt));
              const gasArr = bindGasOption(data.item);
              options.current = gasArr;
              const defaultSellect = gasArr
                .map((item, index) => {
                  return {
                    ...item,
                    index: index,
                  };
                })
                .filter(item => item.stt === 'Medium')[0].index;
              setSelectedOption(defaultSellect);
              setAsset('0');
              setLabelAsset('0');
              setVisible(false);
              setGasInfo(
                calTransactionFee(data.item.index, defaultSellect, gasArr),
              );
            }}
            style={{
              width: SIZES.width,
              borderTopWidth: 1,
              borderColor: COLOR.gray5,
              height: 73,
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View style={{ marginLeft: SIZES.simpleMargin }}>
              <AvatarView size={SIZES.iconWidth} image={data.item.logo} />
            </View>
            <Text
              style={{
                marginLeft: SIZES.simpleSpace,
                color: COLOR.white,
                ...FONTS.t14b,
              }}>
              {data.item.name}
            </Text>
            <Text
              style={{
                marginLeft: SIZES.simpleSpace / 2,
                color: COLOR.textSecondary,
                ...FONTS.t14r,
              }}>
              {data.item.symbol}
            </Text>
          </TouchableOpacity>
        );
      };

      return (
        <View
          style={{
            marginTop: 80,
            backgroundColor: COLOR.simpleBackground,
            borderTopLeftRadius: 10,
            borderTopEndRadius: 10,
            width: '100%',
            height: SIZES.height - 80,
            borderBottomWidth: 1,
            borderColor: COLOR.gray5,
          }}>
          <Text
            style={{
              alignSelf: 'center',
              color: COLOR.white,
              marginTop: SIZES.simpleMargin,
              ...FONTS.t16b,
            }}>
            {t(STRINGS.choose_token_txt)}
          </Text>

          {searchView()}
          <FlatList
            renderItem={renderItem}
            data={searchData}
            style={{ marginTop: SIZES.simpleMargin }}
          />

          <TouchableOpacity
            style={{
              position: 'absolute',
              right: SIZES.simpleMargin,
              top: SIZES.simpleMargin,
            }}
            onPress={() => setVisible(false)}>
            <Image source={ICONS.clear2} />
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <Modal animationType="side" transparent={true} visible={visible}>
        {main()}
      </Modal>
    );
  };

  const netWorkSymbol = () => {
    if (listToken[selected].type === 'Coin') {
      return listToken[selected].symbol;
    } else {
      switch (listToken[selected].type) {
        case 'ERC20':
          return 'ETH';
        case 'BEP20':
          return 'BSC';
        case 'SPL':
          return 'SOL';
      }
    }
  };

  const customGas = () => {
    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: SIZES.simpleMargin,
          marginBottom: 200,
        }}>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 42,
          }}>
          <Text style={{ color: COLOR.textSecondary, ...FONTS.t14r }}>
            {t(STRINGS.transactionFee)}
          </Text>
          <TouchableOpacity
            style={{
              width: SIZES.iconSize,
              height: SIZES.iconSize,
            }}>
            <TransactionFeeIcon chainName={netWorkSymbol()} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginTop: 12,
            flexDirection: 'row',
          }}>
          <Text style={{ color: COLOR.white, ...FONTS.t16r }}>
            {getGasStatusLabel(t, options.current[selectedOptions].stt)}
          </Text>

          <View style={{ flex: 1 }} />

          <View style={{ flexDirection: 'row' }}>
            <Text style={{ color: COLOR.white, ...FONTS.t16r }}>
              {parseFloat(
                toFixed(
                  (gasInfo.gas / 10 ** gasInfo.coin.decimals).toFixed(10),
                ),
              ).toString() +
                ' ' +
                gasInfo?.coin?.symbol}
            </Text>
            <Text
              style={{
                color: COLOR.textSecondary,
                ...FONTS.t14r,
              }}>
              {`(${formatNumber.format(
                (gasInfo.gas / 10 ** gasInfo.coin.decimals) * fiasPerCoin,
              )})`}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 8 }}>
          {options.current.length > 1 && (
            <Slider
              values={[selectedOptions]}
              max={options.current.length - 1}
              onValuesChange={val => {
                setSelectedOption(val[0]);
                const ans = calTransactionFee(
                  selected,
                  val[0],
                  options.current,
                );
                setGasInfo(ans);
              }}
            />
          )}
        </View>

        <View style={{ marginTop: 38, flexDirection: 'row' }}>
          <Text style={{ color: COLOR.textSecondary, ...FONTS.t16r }}>
            {t(STRINGS.total)}
          </Text>
          <View style={{ flex: 1 }} />
          {!isNaN(totalTx) && (
            <Text
              style={{
                color: txInvalid ? COLOR.systemRedLight : COLOR.white,
                ...FONTS.t20b,
              }}>
              {formatNumber.format(totalTx ?? 0)}
            </Text>
          )}
        </View>
        {txInvalid && (
          <Text
            style={{
              alignSelf: 'flex-end',
              color: COLOR.systemRedLight,
              ...FONTS.t12r,
              marginTop: SIZES.simpleSpace,
            }}>
            {t(STRINGS.balanceOrGasFeeIsInsufficient)}
          </Text>
        )}
      </View>
    );
  };

  const validAssetLabel = () => {
    if (isValidAsset) {
      return (
        <Text
          style={{
            ...FONTS.t12r,
            color: COLOR.systemRedLight,
            marginHorizontal: 16,
            marginTop: 8,
          }}>
          {stringFormat(t(STRINGS.invalid_decimal_part), [
            `${listToken[selected]?.decimals}`,
          ])}
        </Text>
      );
    }
  };

  return (
    <HideKeyboard>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{
          flex: 1,
        }}>
        {header()}
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {tokenInfo()}
          {scanBtn()}
          {addressTextField()}
          {selected >= 0 && balanceInfo()}
          {assetTextInput()}
          {validAssetLabel()}
          {selected >= 0 && customGas()}
          <View style={{ flex: 1, marginBottom: SIZES.buttonHeight * 2 }} />
        </ScrollView>
        {sendButton()}
        {BottomSheet()}
      </ImageBackground>
    </HideKeyboard>
  );
};

export default SendToken;
