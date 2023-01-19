import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ImageBackground,
  Linking,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  COLOR,
  FONTS,
  IMAGES,
  PAN_CONNECT,
  SIZES,
  STRINGS,
  TRANSACTION,
} from '../../constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { compactAddress, getProvider, makeURL } from 'utils/util';
import { DAORepository } from 'databases/index';
import { useTranslation } from 'react-i18next';
import CustomButton from 'components/CustomButton/CustomButton';
import { WarningView } from 'components/CustionView/WarningView';
import PropTypes from 'prop-types';
import {
  getChainInfoByType,
  getGasOptionByNetwork,
  getTransactionFeeByType,
} from 'utils/gas.util';
import { formatCurrency } from 'utils/format.util';
import { TransactionFeeIcon } from 'components/common';
import { EditGasFeeBottomSheet } from 'components/SDK';
import { walletSend } from 'walletCore/sendToken';
import Modal from 'react-native-modal';
import LoadingPopup from 'screens/createNewWallet/ConfirmPassphrase/ConfirmPhraseLoading';
import { getCoinBalance, getTokenBalance } from 'walletCore/balance';
import { useSelector } from 'react-redux';
import { getCoinInfoOnMarket, getTokenType } from 'utils/infoToken';
import {
  pushTransferLoading,
  removeTransferLoading,
} from 'stores/reducer/transferLoadingSlice';
import { useDispatch } from 'react-redux';
import { toHex } from 'utils/blockchain';
import { signAndSendSignedTransaction } from 'walletCore/sdk';
import { insertNewTransactionHistories } from 'screens/WalletConnectSessionsScreen/helper';
import {
  connection as solConnection,
  getKeypairFromPrivateKey,
} from 'walletCore/solana';
import * as solanaWeb3 from '@solana/web3.js';
import { CONSTANTS, TOKEN_SYMBOL, TOKEN_TYPE } from 'constants';
import { tokenGasLimit } from '../../constants/walletConst';

const ConfirmDappTransaction = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const ref = useRef(null);
  const [isEditableGasFee, setIsEditableGasFee] = useState(false);
  const [selectedIndexGasFee, setSelectedIndexGasFee] = useState(1);
  const [transactionFee, setTransactionFee] = useState(0);
  const [balance, setBalance] = useState(0);
  const [isDisable, setIsDisable] = useState(true);
  const [isLoading, setIsLoad] = useState(false);
  const [priceCoin, setPriceCoin] = useState(0);
  const [priceToken, setPriceToken] = useState(0);
  const [estimateGas, setEstimateGas] = useState(0);
  const [defaultGasPrice, setDefaultPrice] = useState(0);
  const [gasPriceTip, setGasPriceTip] = useState(0);

  const dispatch = useDispatch();
  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const params = route.params;
  const walletID = params.wallet._id;

  const renderNetwork = () => {
    switch (params.token.chainType ?? params.token.type) {
      case 'ERC20':
        return 'ETH';
      case 'BEP20':
        return 'BSC';
      case 'SPL':
        return 'SOL';
    }
  };

  const data = {
    network: renderNetwork(),
    walletName: params.wallet.name,
    fromAddress: params.wallet.address,
    contractAddress: params.contractAddress,
    toAddress: params.addressReceive,
    amount: parseFloat(params.amount),
    tokenSymbol: params.token.symbol === 'BSC' ? 'BNB' : params.token.symbol,
    type: params.token.type,
    chainType: params.token.chainType ?? params.token.type,
    DAppURL: params.url,
    schema: params.schema,
    requestType: params.requestType,
    transactionData: params.transactionData ?? {},
  };

  const privateKey = params.wallet.privateKey;

  const {
    network,
    walletName,
    fromAddress,
    contractAddress,
    toAddress,
    amount,
    tokenSymbol,
    type,
    chainType,
    DAppURL,
    schema,
    requestType,
    transactionData,
  } = data;

  const transactionObj = { ...transactionData };

  const chainUpCase = renderNetwork();
  const chain = chainUpCase.toLowerCase();
  const networkType = getTokenType(chain);
  const provider = getProvider(chain);

  const chainInfo = useMemo(() => getChainInfoByType(chainType), [chainType]);

  const transactionFeeValueFinally = useMemo(() => {
    return transactionFee / 10 ** chainInfo.decimals;
  }, [transactionFee, chainInfo.decimals]);

  const gasOptions = useMemo(
    () => getGasOptionByNetwork(chainType),
    [chainType],
  );

  const maxTotal = useMemo(
    () => amount * priceToken + transactionFeeValueFinally * priceCoin,
    [amount, transactionFeeValueFinally, priceToken, priceCoin],
  );

  const maxTotalInUsd = useMemo(
    () => formatCurrency(maxTotal, fiatCurrency, 5),
    [maxTotal, priceCoin],
  );

  const priceUsd = formatCurrency(amount * priceToken, fiatCurrency, 5);

  const saveEditGasFee = newValue => {
    setSelectedIndexGasFee(newValue);
    closeSheet();
  };

  const openEditGasFee = () => {
    ref.current.snapTo(0);
    setIsEditableGasFee(true);
  };

  const closeSheet = () => {
    setIsEditableGasFee(false);
    ref.current.snapTo(1);
  };

  const getResponsePath = () => {
    switch (requestType) {
      case PAN_CONNECT.path.transfer:
        return PAN_CONNECT.response.transfer;
      case PAN_CONNECT.path.depositToken:
        return PAN_CONNECT.response.depositToken;
      case PAN_CONNECT.path.withdrawToken:
        return PAN_CONNECT.response.withdrawToken;
    }
  };

  const getDefaultGasFee = async () => {
    try {
      const gas = await provider.eth.estimateGas(transactionObj);
      setEstimateGas(gas);
      const gasPrice = await provider.eth.getGasPrice();
      setDefaultPrice(gasPrice);
      return {
        estimateGas: gas,
        gasPrice: gasPrice,
      };
    } catch (error) {
      handleOpenLinkToDApp(getResponsePath(), {
        ...PAN_CONNECT.pan_response.transfer_token_wrong,
        error,
      });
    }
  };

  const getTransactionFee = useCallback(async () => {
    try {
      if (transactionObj && Object.keys(transactionObj).length > 0) {
        const gasFee = await getDefaultGasFee();
        const fee = await getTransactionFeeByType(
          chain,
          gasOptions[selectedIndexGasFee],
          gasFee.estimateGas,
          gasFee.gasPrice,
        );
        if (fee.gasPrice) {
          setGasPriceTip(fee.gasPrice);
        }
        setTransactionFee(fee.transactionFee);
      } else {
        await setEstimateGas(tokenGasLimit);
        const price = await provider.eth.getGasPrice();
        await setDefaultPrice(price);
        const fee = await getTransactionFeeByType(
          chainType,
          gasOptions[selectedIndexGasFee],
          tokenGasLimit,
          price,
        );
        if (fee.gasPrice) {
          setGasPriceTip(fee.gasPrice);
        }
        setTransactionFee(fee.transactionFee);
      }
    } catch (error) {
      handleOpenLinkToDApp(getResponsePath(), {
        ...PAN_CONNECT.pan_response.transfer_token_wrong,
        error,
      });
    }
  }, [gasOptions, selectedIndexGasFee]);

  const getBalance = async contractAddress => {
    if (String(contractAddress) === 'null') {
      const balanceMinUnit = await getCoinBalance(fromAddress, chainType);
      const balanceMaxUnit = balanceMinUnit / Math.pow(10, chainInfo.decimals);
      setBalance(balanceMaxUnit);
    } else {
      const balanceMinUnit = await getTokenBalance(
        fromAddress,
        contractAddress,
        chainType,
      );
      const balanceMaxUnit = balanceMinUnit / 10 ** chainInfo.decimals;
      setBalance(balanceMaxUnit);
    }
  };

  const checkConfirmValidate = async () => {
    if (String(contractAddress) === 'null') {
      const maxAmount = amount + transactionFeeValueFinally;
      if (balance !== 0) {
        if (balance < maxAmount) {
          setIsDisable(true);
        } else {
          setIsDisable(false);
        }
      }
    } else {
      if (requestType === PAN_CONNECT.path.withdrawToken) {
        const balanceCoinUnit = await getCoinBalance(fromAddress, chainType);
        const balanceCoin = balanceCoinUnit / Math.pow(10, chainInfo.decimals);
        if (balanceCoin !== 0 && transactionFeeValueFinally !== 0) {
          if (balanceCoin >= transactionFeeValueFinally) {
            setIsDisable(false);
          } else {
            setIsDisable(true);
          }
        }
      } else {
        const balanceCoinUnit = await getCoinBalance(fromAddress, chainType);
        const balanceCoin = balanceCoinUnit / Math.pow(10, chainInfo.decimals);
        if (
          balance !== 0 &&
          balanceCoin !== 0 &&
          transactionFeeValueFinally !== 0
        ) {
          if (balance >= amount && balanceCoin >= transactionFeeValueFinally) {
            setIsDisable(false);
          } else {
            setIsDisable(true);
          }
        }
      }
    }
  };

  const handleOpenLinkToDApp = (path, option) => {
    const url = makeURL(schema, path, option);
    if (Platform.OS === 'android') {
      NativeModules.ConnectWalletModule.openLinkToDApp(url);
      navigation.pop();
    } else {
      Linking.openURL(url)
        .catch(error => console.error(error))
        .finally(() => navigation.pop());
    }
  };

  const getAction = () => {
    switch (requestType) {
      case PAN_CONNECT.path.transfer: {
        return TRANSACTION.transferToken;
      }
      case PAN_CONNECT.path.depositToken: {
        return TRANSACTION.depositToken;
      }
      case PAN_CONNECT.path.withdrawToken: {
        return TRANSACTION.withdrawToken;
      }
    }
  };

  const renderBottomButtons = () => {
    const getWalletInfo = async networkName => {
      switch (networkName) {
        case 'ETH': {
          return await DAORepository.getEthereumById(walletID);
        }
        case 'BSC': {
          return await DAORepository.getEthereumById(walletID);
        }
        case 'SOL': {
          return await DAORepository.getSolanaById(walletID);
        }
        case 'BTC': {
          return await DAORepository.getBitcoinById(walletID);
        }
      }
    };

    const didTapReject = () => {
      let path = '';
      let option = {};
      switch (requestType) {
        case PAN_CONNECT.path.transfer: {
          path = PAN_CONNECT.response.transfer;
          option = { ...PAN_CONNECT.pan_response.user_reject_transfer };
          break;
        }
        case PAN_CONNECT.path.depositToken: {
          path = PAN_CONNECT.response.depositToken;
          option = { ...PAN_CONNECT.pan_response.user_reject_deposit };
          break;
        }
        case PAN_CONNECT.path.withdrawToken: {
          path = PAN_CONNECT.response.withdrawToken;
          option = { ...PAN_CONNECT.pan_response.user_reject_withdraw };
          break;
        }
      }
      handleOpenLinkToDApp(path, option);
    };

    const confirmTransfer = async () => {
      const walletInfo = await getWalletInfo(network);
      const chainInfo = await getChainInfoByType(chainType);
      const assets = amount * Math.pow(10, chainInfo.decimals);
      const coin = {
        type: type,
        chainType: chainType,
        symbol: tokenSymbol,
        contract: contractAddress,
      };
      const wallet = {
        address: walletInfo.address,
        privateKey: walletInfo.privateKey,
        id: walletInfo._id,
      };
      const loadingObj = {
        bundle: route.params.bundle,
        accessToken: route.params.accessToken,
        requestType: route.params.requestType,
        isLoading: true,
      };
      try {
        setIsLoad(true);
        dispatch(pushTransferLoading(loadingObj));
        walletSend(wallet, toAddress, assets, transactionFee, coin, gasPriceTip)
          .then(txHash => {
            if (coin.type === 'SPL' || coin.chainType === 'SPL') {
              //
            } else {
              provider.eth
                .getTransaction(txHash)
                .then(data => {
                  const params = {
                    action: getAction(),
                    walletID,
                    addressID: wallet.id,
                    chainType: networkType,
                    id: data.hash,
                    asset: Number(amount),
                    gas: transactionFee / 10 ** chainInfo.decimals,
                    from: data.from,
                    to: data.to,
                    tokenSymbol: tokenSymbol || chainInfo.symbol,
                    coinSymbol: chainInfo.symbol,
                    time: new Date().getTime(),
                    networkBlockChain: networkType,
                  };

                  insertNewTransactionHistories(dispatch, params);

                  handleOpenLinkToDApp(getResponsePath(), {
                    transactionHash: txHash,
                    ...PAN_CONNECT.pan_response.success,
                  });
                })
                .catch(error => {
                  handleOpenLinkToDApp(getResponsePath(), {
                    ...PAN_CONNECT.pan_response.transfer_token_wrong,
                    error,
                  });
                });
            }
          })
          .catch(error => {
            setIsLoad(false);
            handleOpenLinkToDApp(getResponsePath(), {
              ...PAN_CONNECT.pan_response.transfer_token_wrong,
              error,
            });
          })
          .finally(() => {
            setIsLoad(false);
          });
      } catch (error) {
        setIsLoad(false);
        dispatch(removeTransferLoading(loadingObj));
        handleOpenLinkToDApp(getResponsePath(), {
          ...PAN_CONNECT.pan_response.transfer_token_wrong,
          error,
        });
      }
    };

    const handleConfirmSolanaRequest = async () => {
      try {
        const payer = getKeypairFromPrivateKey(privateKey);

        const signature = await solanaWeb3.sendAndConfirmTransaction(
          solConnection,
          transactionData,
          [payer],
          {
            skipPreflight: true,
            maxRetries: 3,
          },
        );

        handleOpenLinkToDApp(PAN_CONNECT.response.depositToken, {
          transactionHash: signature,
          ...PAN_CONNECT.pan_response.success,
        });
      } catch (error) {
        handleOpenLinkToDApp(PAN_CONNECT.response.depositToken, {
          ...PAN_CONNECT.pan_response.deposit_token_wrong,
          error,
        });
      }
    };

    const setTransactionObj = () => {
      switch (chain) {
        case TOKEN_SYMBOL.eth:
        case TOKEN_TYPE.ERC20:
        case CONSTANTS.chainIdList.eth: {
          transactionObj.gasLimit = toHex(estimateGas);
          break;
        }

        case TOKEN_SYMBOL.bsc:
        case TOKEN_TYPE.BEP20:
        case CONSTANTS.chainIdList.bsc: {
          transactionObj.gasLimit = toHex(estimateGas);
          transactionObj.gasPrice = toHex(gasPriceTip);
          break;
        }

        case TOKEN_SYMBOL.sol:
        case TOKEN_TYPE.SPL: {
          break;
        }
      }
    };

    const handleConfirmWeb3 = async () => {
      const chainInfo = await getChainInfoByType(chainType);

      const wallet = {
        address: params.wallet.address,
        privateKey: params.wallet.privateKey,
        id: params.wallet._id,
      };

      try {
        setTransactionObj();

        provider.eth.accounts.signTransaction(
          transactionObj,
          privateKey,
          (err, signedTx) => {
            if (err) {
              throw err;
            }
            provider.eth.sendSignedTransaction(
              signedTx.rawTransaction,
              (error, res) => {
                if (error) {
                  throw error;
                }

                provider.eth.getTransaction(res).then(data => {
                  const params = {
                    action: getAction(),
                    walletID,
                    addressID: wallet.id,
                    chainType: networkType,
                    id: data.hash,
                    asset: Number(amount),
                    gas: transactionFee / 10 ** chainInfo.decimals,
                    from: data.from,
                    to: data.to,
                    tokenSymbol: tokenSymbol || chainInfo.symbol,
                    coinSymbol: chainInfo.symbol,
                    time: new Date().getTime(),
                    networkBlockChain: networkType,
                  };

                  insertNewTransactionHistories(dispatch, params);

                  // Send txHash back to Dapp
                  handleOpenLinkToDApp(PAN_CONNECT.response.depositToken, {
                    transactionHash: res,
                    ...PAN_CONNECT.pan_response.success,
                  });
                });
              },
            );
          },
        );
      } catch (error) {
        handleOpenLinkToDApp(PAN_CONNECT.response.depositToken, {
          ...PAN_CONNECT.pan_response.deposit_token_wrong,
          error,
        });
      }
    };

    const confirmDeposit = async () => {
      setIsLoad(true);
      const loadingObj = {
        bundle: route.params.bundle,
        accessToken: route.params.accessToken,
        requestType: route.params.requestType,
        isLoading: true,
      };
      dispatch(pushTransferLoading(loadingObj));
      switch (networkType) {
        case TOKEN_TYPE.SPL:
          await handleConfirmSolanaRequest();
          break;
        case TOKEN_TYPE.BEP20:
        case TOKEN_TYPE.ERC20:
          await handleConfirmWeb3();
          break;
        default:
          return;
      }
      setTimeout(() => {
        setIsLoad(false);
        dispatch(removeTransferLoading(loadingObj));
      }, 1000);
    };

    const didTapConfirm = async () => {
      switch (requestType) {
        case PAN_CONNECT.path.transfer:
          return await confirmTransfer();
        case PAN_CONNECT.path.depositToken:
        case PAN_CONNECT.path.withdrawToken:
          return await confirmDeposit();
      }
    };

    const widthBtn = (SIZES.width - SIZES.simpleMargin * 3) / 2;

    return (
      <View
        style={{
          height: 58,
          marginBottom: SIZES.height * 0.05,
          flexDirection: 'row',
          marginTop: 30,
        }}>
        <TouchableOpacity
          style={{
            width: widthBtn,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={didTapReject}>
          <Text style={{ color: COLOR.textPrimary, ...FONTS.t16b }}>
            {t(STRINGS.reject_btn)}
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <View style={{ width: widthBtn, height: 58 }}>
          <CustomButton
            label={t(STRINGS.confirm_btn)}
            isDisable={isDisable}
            width={widthBtn}
            height={48}
            onPress={didTapConfirm}
          />
        </View>
      </View>
    );
  };

  useEffect(() => {
    getBalance(contractAddress).done();
  }, []);

  useEffect(() => {
    checkConfirmValidate();
  }, [transactionFeeValueFinally, balance]);

  useEffect(() => {
    getTransactionFee();
  }, [getTransactionFee]);

  useEffect(() => {
    getBalance(contractAddress).done();
  }, []);

  useEffect(() => {
    getCoinInfoOnMarket(tokenSymbol, fiatCurrency).then(info => {
      setPriceToken(info?.[0]?.current_price || 0);
    });
  }, [tokenSymbol, fiatCurrency]);

  useEffect(() => {
    getCoinInfoOnMarket(chainInfo.symbol, fiatCurrency).then(info => {
      setPriceCoin(info?.[0]?.current_price || 0);
    });
  }, [chainInfo.symbol, fiatCurrency]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1 }}
        resizeMode="cover">
        <View style={styles.header}>
          <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
            {t(STRINGS.confirmTransaction)}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                ...FONTS.t30b,
                color: COLOR.white,
              }}>
              {requestType === PAN_CONNECT.path.withdrawToken
                ? `+${amount} ${tokenSymbol}`
                : `-${amount} ${tokenSymbol}`}
            </Text>

            <Text
              style={{
                ...FONTS.t16r,
                color: COLOR.textSecondary,
                marginTop: 8,
              }}>
              ~ {priceUsd}
            </Text>

            <Text style={{ ...FONTS.t16r, color: COLOR.white, marginTop: 26 }}>
              {t(STRINGS.approveTransaction)}
            </Text>
          </View>

          <LeftRightItem
            style={{ marginTop: 12 }}
            label={
              requestType === PAN_CONNECT.path.withdrawToken
                ? t(STRINGS.to)
                : t(STRINGS.from)
            }
            value={`${walletName} (${compactAddress(fromAddress)})`}
          />

          {requestType === PAN_CONNECT.path.transfer ? (
            <>
              <LeftRightItem
                label={t(STRINGS.to)}
                value={compactAddress(toAddress)}
              />

              {String(contractAddress) !== 'null' ? (
                <LeftRightItem
                  label={t(STRINGS.contract_address)}
                  value={compactAddress(contractAddress)}
                />
              ) : (
                <></>
              )}
            </>
          ) : (
            <LeftRightItem
              label={t(STRINGS.contract_address)}
              value={compactAddress(contractAddress)}
            />
          )}

          <LeftRightItem label={t(STRINGS.dApp)} value={DAppURL} />

          <TouchableOpacity
            style={{ alignItems: 'flex-end' }}
            onPress={openEditGasFee}>
            <Text
              style={{
                ...FONTS.t12r,
                color: COLOR.actionLink1,
                marginTop: 24,
              }}>
              {t(STRINGS.editGasFee)}
            </Text>
          </TouchableOpacity>

          <LeftRightItem
            label={t(STRINGS.transactionFee)}
            icon={<TransactionFeeIcon chainName={network} />}
            style={{ marginTop: 12 }}
            value={
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}>
                <Text
                  style={{
                    color: COLOR.white,
                    ...FONTS.t16r,
                  }}>
                  {`${parseFloat(transactionFeeValueFinally.toFixed(10))} ${
                    network === 'BSC' ? 'BNB' : network
                  }`}
                </Text>

                <Text
                  style={{
                    paddingLeft: 4,
                    color: COLOR.textSecondary,
                    ...FONTS.t12r,
                  }}>
                  (
                  {formatCurrency(
                    transactionFeeValueFinally * priceCoin,
                    fiatCurrency,
                    5,
                  )}
                  )
                </Text>
              </View>
            }
          />

          <LeftRightItem
            label={t(STRINGS.maxTotal)}
            value={maxTotalInUsd}
            valueStyle={{
              color: isDisable ? COLOR.systemRedLight : COLOR.white,
            }}
          />

          <View style={{ alignItems: 'flex-end' }}>
            {isDisable ? (
              <Text style={{ color: COLOR.systemRedLight, marginTop: 4 }}>
                {t(STRINGS.balance_insufficient)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <WarningView text={t(STRINGS.accessFundRequest)} boldText="" />
          {renderBottomButtons()}
        </View>

        <Modal
          statusBarTranslucent={true}
          isVisible={isLoading}
          backdropOpacity={0.6}
          animationIn="zoomIn"
          animationOut="zoomOut"
          backdropColor={COLOR.black}
          deviceHeight={SIZES.height}>
          {LoadingPopup(IMAGES.clockLoading, '', '')}
        </Modal>
      </ImageBackground>

      <EditGasFeeBottomSheet
        onSave={saveEditGasFee}
        onClose={closeSheet}
        selectedIndexGasFee={selectedIndexGasFee}
        contractSymbol={chainType}
        ref={ref}
        isEditableGasFee={isEditableGasFee}
        defaultGasFee={estimateGas !== 0 ? estimateGas : null}
        gasPrice={defaultGasPrice}
      />
    </View>
  );
};

const LeftRightItem = ({
  label,
  value,
  style,
  labelStyle,
  valueStyle,
  icon,
  ...otherProps
}) => {
  return (
    <View style={[styles.item, style]} {...otherProps}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {icon}
      </View>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
};

LeftRightItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
  style: PropTypes.object,
  labelStyle: PropTypes.object,
  valueStyle: PropTypes.object,
  icon: PropTypes.node,
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  body: {
    flex: 7,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  footer: {
    flex: 2,
    marginHorizontal: SIZES.simpleMargin,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  label: {
    color: COLOR.textSecondary,
    ...FONTS.t14r,
  },
  value: {
    color: COLOR.white,
    ...FONTS.t16r,
  },
});
export default ConfirmDappTransaction;
