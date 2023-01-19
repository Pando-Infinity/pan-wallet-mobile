import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import {
  COLOR,
  FONTS,
  STRINGS,
  TOKEN_TYPE,
  PAN_CONNECT,
  TOKEN_SYMBOL,
  CONSTANTS,
} from 'constants';
import {
  Container,
  TransactionFeeIcon,
  WarningAlert,
  RejectAndConfirmButton,
} from 'components/common';
import { useTranslation } from 'react-i18next';
import NftInfo from 'screens/SendNft/components/NftInfo';
import { compactAddress, getProvider, getWalletId, makeURL } from 'utils/util';
import { formatCurrency, formatId, formatNumber } from 'utils/format.util';
import { EditGasFee, EditGasFeeBottomSheet } from 'components/SDK';
import { useRoute } from '@react-navigation/native';
import {
  getChainInfoByType,
  getGasOptionByNetwork,
  getTransactionFeeByType,
} from 'utils/gas.util';
import { insertNewTransactionHistories } from 'screens/WalletConnectSessionsScreen/helper';
import { useDispatch, useSelector } from 'react-redux';
import {
  getKeypairFromPrivateKey,
  connection as solConnection,
} from 'walletCore/solana';
import * as solanaWeb3 from '@solana/web3.js';
import { WalletCoinLoadingModal } from 'components/modals';
import {
  getCoinSymbol,
  getTokenType,
  getNetworkName,
  getCoinInfoOnMarket,
} from 'utils/infoToken';
import { getCoinBalance } from 'walletCore/balance';
import { onOpenLinkToDApp } from 'utils/sdk';
import { toHex } from 'utils/blockchain';
import {
  pushTransferLoading,
  removeTransferLoading,
} from 'stores/reducer/transferLoadingSlice';
import { TRANSACTION } from '../../constants';

const ConfirmDappTransactionScreen = () => {
  const { t: getLabel } = useTranslation();
  const route = useRoute();
  const dispatch = useDispatch();

  const sheetRef = useRef(null);

  const {
    contractAddress,
    to,
    url: dappURL,
    requestType,
    transactionData: transaction = {},
    tokenSymbol,
    schema,
    chain,
    nft = {},
    wallet = {},
  } = route.params || {};

  const transactionObj = { ...transaction };

  const {
    id: nftId,
    image: nftImage,
    name: nftName = '',
    price: nftPrice = 0,
  } = nft;

  const {
    _id: addressID,
    name: walletName,
    address: from,
    privateKey,
  } = wallet;

  const walletID = getWalletId();

  const [isVisibleLoadingModal, setIsVisibleLoadingModal] = useState(false);
  const [isEditableGasFee, setIsEditableGasFee] = useState(false);
  const [inSufficientBalance, setInSufficientBalance] = useState(true);
  const [selectedIndexGasFee, setSelectedIndexGasFee] = useState(1);
  const [transactionFee, setTransactionFee] = useState(0);
  const [coinBalance, setCoinBalance] = useState(0);
  const [priceCoin, setPriceCoin] = useState(0);
  const [estimateGas, setEstimateGas] = useState(0);
  const [defaultGasPrice, setDefaultPrice] = useState(0);
  const [gasPriceTip, setGasPriceTip] = useState(0);

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const networkName = useMemo(() => getNetworkName(chain), [chain]);

  const coinSymbol = useMemo(() => getCoinSymbol(networkName), [networkName]);

  const networkType = useMemo(() => getTokenType(networkName), [networkName]);

  const provider = useMemo(() => getProvider(networkType), [networkType]);

  const chainInfo = useMemo(
    () => getChainInfoByType(networkType),
    [networkType],
  );

  const transactionFeeValueFinally = useMemo(() => {
    return transactionFee / 10 ** chainInfo.decimals;
  }, [transactionFee, chainInfo.decimals]);

  const gasOptions = useMemo(
    () => getGasOptionByNetwork(networkName),
    [networkName],
  );

  const maxTotalInUsd = useMemo(
    () =>
      formatCurrency(transactionFeeValueFinally * priceCoin, fiatCurrency, 5),
    [transactionFeeValueFinally, priceCoin, fiatCurrency],
  );

  const [
    nftPriceInfo,
    nftPriceUsd,
    transactionNameLabel,
    urlPathResponse,
    wrongUrlResponse,
    urlRejectResponse,
  ] = useMemo(() => {
    const priceUsd = formatCurrency(nftPrice * priceCoin);

    switch (requestType) {
      case PAN_CONNECT.path.buyNFT:
        return [
          `-${formatNumber(nftPrice, 6)}`,
          priceUsd,
          STRINGS.buy_with_name,
          PAN_CONNECT.response.buyNFT,
          PAN_CONNECT.pan_response.buy_nft_wrong,
          PAN_CONNECT.pan_response.user_reject_buy_nft,
        ];
      case PAN_CONNECT.path.sellNFT:
        return [
          formatNumber(nftPrice, 6),
          priceUsd,
          STRINGS.sell_with_name,
          PAN_CONNECT.response.sellNFT,
          PAN_CONNECT.pan_response.sell_nft_wrong,
          PAN_CONNECT.pan_response.user_reject_sell_nft,
        ];
      case PAN_CONNECT.path.sendNFT:
        return [
          null,
          null,
          STRINGS.send_with_name,
          PAN_CONNECT.response.sendNFT,
          PAN_CONNECT.pan_response.send_nft_wrong,
          PAN_CONNECT.pan_response.user_reject_send_nft,
        ];
      case PAN_CONNECT.path.stakeNFT:
        return [
          null,
          null,
          STRINGS.transfer_with_name,
          PAN_CONNECT.response.stakeNFT,
          PAN_CONNECT.pan_response.stake_nft_wrong,
          PAN_CONNECT.pan_response.user_reject_stake_nft,
        ];
      case PAN_CONNECT.path.unStakeNFT:
        return [
          null,
          null,
          STRINGS.confirmTransaction,
          PAN_CONNECT.response.unStakeNFT,
          PAN_CONNECT.pan_response.unstake_nft_wrong,
          PAN_CONNECT.pan_response.user_reject_un_stake_nft,
        ];
      default:
        return [];
    }
  }, [nftPrice, requestType]);

  const isSDKTransactionSend = useMemo(() => {
    return requestType === PAN_CONNECT.path.sendNFT;
  }, [requestType]);

  const isSolanaNetwork = useMemo(
    () => networkType === TOKEN_TYPE.SPL,
    [networkType],
  );

  //function

  const getAction = () => {
    switch (requestType) {
      case PAN_CONNECT.path.buyNFT: {
        return TRANSACTION.buyNFT;
      }
      case PAN_CONNECT.path.sellNFT: {
        return TRANSACTION.sellNFT;
      }
      case PAN_CONNECT.path.sendNFT: {
        return TRANSACTION.sendNFT;
      }
      case PAN_CONNECT.path.stakeNFT: {
        return TRANSACTION.stakeNFT;
      }
      case PAN_CONNECT.path.unStakeNFT: {
        return TRANSACTION.unStakeNFT;
      }
    }
  };

  const getDefaultGasFee = async () => {
    const gas = await provider.eth.estimateGas(transactionObj);
    setEstimateGas(gas);
    const gasPrice = await provider.eth.getGasPrice();
    setDefaultPrice(gasPrice);
    return {
      estimateGas: gas,
      gasPrice: gasPrice,
    };
  };

  const getTransactionFee = async () => {
    try {
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
    } catch (error) {
      handleOpenLinkToDApp({ ...wrongUrlResponse, error });
    }
  };

  const handleSaveEditGasFee = newValue => {
    setSelectedIndexGasFee(newValue);
    handleCloseSheet();
  };

  const handleOpenEditGasFee = () => {
    sheetRef.current.snapTo(0);
    setIsEditableGasFee(true);
  };

  const handleCloseSheet = () => {
    setIsEditableGasFee(false);
    sheetRef.current.snapTo(1);
  };

  const handleGetTransactionFee = useCallback(async () => {
    getTransactionFee().done();
  }, [gasOptions, selectedIndexGasFee, networkName]);

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

  const handleConfirmRequest = async () => {
    setIsVisibleLoadingModal(true);
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
        await handleConfirmBscAndEthRequest();
        break;
      default:
        return;
    }
    dispatch(removeTransferLoading(loadingObj));
  };

  const handleConfirmSolanaRequest = async () => {
    try {
      const payer = getKeypairFromPrivateKey(privateKey);

      const signature = await solanaWeb3.sendAndConfirmTransaction(
        solConnection,
        transaction,
        [payer],
        {
          skipPreflight: true,
          maxRetries: 3,
        },
      );

      handleOpenLinkToDApp({
        transactionHash: signature,
        ...PAN_CONNECT.pan_response.success,
      });
    } catch (error) {
      handleOpenLinkToDApp({ ...wrongUrlResponse, error });
    }
  };

  const handleConfirmBscAndEthRequest = async () => {
    try {
      setTransactionObj();

      provider.eth.accounts.signTransaction(
        transactionObj,
        privateKey,
        (err, signedTx) => {
          if (err) {
            handleOpenLinkToDApp({ ...wrongUrlResponse, err });
            throw err;
          }
          provider.eth.sendSignedTransaction(
            signedTx.rawTransaction,
            (error, res) => {
              if (error) {
                handleOpenLinkToDApp({ ...wrongUrlResponse, error });
                throw error;
              }

              provider.eth.getTransaction(res).then(data => {
                const params = {
                  action: getAction(),
                  walletID,
                  addressID,
                  chainType: networkType,
                  id: data.hash,
                  asset: Number(data.value),
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
                handleOpenLinkToDApp({
                  transactionHash: res,
                  ...PAN_CONNECT.pan_response.success,
                });
              });
            },
          );
        },
      );
    } catch (error) {
      handleOpenLinkToDApp({ ...wrongUrlResponse, error });
    }
  };

  const handleReject = () => {
    handleOpenLinkToDApp(urlRejectResponse);
  };

  const handleOpenLinkToDApp = options => {
    const url = makeURL(schema, urlPathResponse, options);
    onOpenLinkToDApp(url);
    setIsVisibleLoadingModal(false);
  };

  const getWalletBalance = useCallback(async () => {
    const balance = await getCoinBalance(from, networkType);

    setCoinBalance(balance);
  }, [from, networkType]);

  useEffect(() => {
    getWalletBalance();
  }, [getWalletBalance]);

  useEffect(() => {
    if (transactionFee > 0) {
      setInSufficientBalance(transactionFee > coinBalance);
    }
  }, [coinBalance, transactionFee]);

  useEffect(() => {
    handleGetTransactionFee();
  }, [handleGetTransactionFee]);

  useEffect(() => {
    getCoinInfoOnMarket(chainInfo.symbol, fiatCurrency).then(info => {
      setPriceCoin(info?.[0]?.current_price || 0);
    });
  }, [chainInfo.symbol, fiatCurrency]);

  return (
    <>
      <Container>
        <ScrollView style={{ flex: 1, width: '100%' }}>
          <Text style={styles.nftName}>
            {getLabel(transactionNameLabel, { name: nftName })}
          </Text>
          <NftInfo
            imageSrc={nftImage}
            symbol={tokenSymbol}
            nftId={isSolanaNetwork ? null : formatId(nftId)}
            price={nftPriceInfo}
            priceUsd={nftPriceUsd}
          />

          <RowItem
            label={getLabel(STRINGS.asset)}
            value={`${networkName} (${
              coinSymbol === 'BNB' ? 'BSC' : coinSymbol
            })`}
            style={{ marginTop: 36 }}
          />

          <RowItem
            label={getLabel(
              requestType === PAN_CONNECT.path.unStakeNFT
                ? STRINGS.to
                : STRINGS.from,
            )}
            value={`${walletName} (${compactAddress(from)})`}
            style={{ marginTop: 12 }}
          />
          <RowItem
            label={getLabel(
              isSDKTransactionSend ? STRINGS.to : STRINGS.contract_address,
            )}
            value={compactAddress(isSDKTransactionSend ? to : contractAddress)}
            style={{ marginTop: 12 }}
          />
          <RowItem
            label={getLabel(STRINGS.dApp)}
            value={dappURL}
            style={{ marginTop: 12 }}
          />

          <EditGasFee
            style={{ marginTop: 24, alignSelf: 'flex-end' }}
            onPress={handleOpenEditGasFee}
          />
          <RowItem
            label={getLabel(STRINGS.transactionFee)}
            icon={<TransactionFeeIcon chainName={chain.toUpperCase()} />}
            style={{ marginTop: 12 }}
            value={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: COLOR.white,
                    ...FONTS.t16r,
                  }}>
                  {`${parseFloat(
                    transactionFeeValueFinally.toFixed(10),
                  )} ${coinSymbol}`}
                </Text>
                <Text style={styles.priceUsd}>
                  {formatCurrency(
                    transactionFeeValueFinally * priceCoin,
                    fiatCurrency,
                    5,
                  )}
                </Text>
              </View>
            }
          />
          <RowItem
            label={getLabel(STRINGS.maxTotal)}
            labelStyle={FONTS.t16r}
            valueStyle={{
              color: inSufficientBalance ? COLOR.systemRedLight : COLOR.white,
            }}
            style={{ marginTop: 12 }}
            value={maxTotalInUsd}
          />
          {inSufficientBalance && (
            <Text style={styles.errorMsg}>
              {getLabel(STRINGS.your_balance_is_insufficient)}
            </Text>
          )}
        </ScrollView>

        <WarningAlert
          message={getLabel(STRINGS.accessFundRequest)}
          style={{ marginTop: 24 }}
        />

        <RejectAndConfirmButton
          style={{ marginTop: 24 }}
          onReject={handleReject}
          onConfirm={handleConfirmRequest}
          isDisableConfirmButton={inSufficientBalance}
        />
      </Container>

      <EditGasFeeBottomSheet
        onSave={handleSaveEditGasFee}
        onClose={handleCloseSheet}
        selectedIndexGasFee={selectedIndexGasFee}
        contractSymbol={networkType}
        ref={sheetRef}
        isEditableGasFee={isEditableGasFee}
        defaultGasFee={estimateGas}
        gasPrice={defaultGasPrice}
      />
      <WalletCoinLoadingModal visible={isVisibleLoadingModal} />
    </>
  );
};

const RowItem = ({
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {icon}
      </View>
      <Text style={[styles.value, valueStyle]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};

RowItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
  style: PropTypes.object,
  labelStyle: PropTypes.object,
  valueStyle: PropTypes.object,
  icon: PropTypes.node,
};

ConfirmDappTransactionScreen.propTypes = {};

ConfirmDappTransactionScreen.defaultProps = {};

const styles = StyleSheet.create({
  nftName: {
    color: COLOR.white,
    ...FONTS.t16b,
    marginBottom: 18,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: COLOR.textSecondary,
    ...FONTS.t14r,
  },
  value: {
    color: COLOR.white,
    ...FONTS.t16r,
  },
  priceUsd: {
    paddingLeft: 4,
    color: COLOR.textSecondary,
    ...FONTS.t12r,
  },
  editGasFeeLabel: {
    color: COLOR.primaryActionLink1,
    ...FONTS.t12r,
  },
  errorMsg: {
    alignSelf: 'flex-end',
    color: COLOR.systemRedLight,
    ...FONTS.t12r,
    marginTop: 4,
  },
});

export default ConfirmDappTransactionScreen;
