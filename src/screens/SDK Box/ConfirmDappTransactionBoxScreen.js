import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import {
  COLOR,
  FONTS,
  STRINGS,
  PAN_CONNECT,
  TRANSACTION,
} from '../../constants';
import {
  Container,
  TransactionFeeIcon,
  WarningAlert,
  RejectAndConfirmButton,
  HeaderLabel,
  RowSpaceBetweenItem,
} from 'components/common';
import { useTranslation } from 'react-i18next';
import { compactAddress, getProvider, getWalletId, makeURL } from 'utils/util';
import { EditGasFee, EditGasFeeBottomSheet } from 'components/SDK';
import { useState } from 'react';
import { useRef } from 'react';
import { useMemo } from 'react';
import { getCoinInfoOnMarket, getTokenType } from 'utils/infoToken';
import {
  getChainInfoByType,
  getGasOptionByNetwork,
  getTransactionFeeByType,
} from 'utils/gas.util';
import { useCallback } from 'react';
import { formatCurrency } from 'utils/format.util';
import { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { getCoinBalance } from 'walletCore/balance';
import { onOpenLinkToDApp } from 'utils/sdk';
import { signAndSendSignedTransaction } from 'walletCore/sdk';
import { insertNewTransactionHistories } from 'screens/WalletConnectSessionsScreen/helper';
import { useDispatch, useSelector } from 'react-redux';
import { toHex } from 'utils/blockchain';
import {
  pushTransferLoading,
  removeTransferLoading,
} from 'stores/reducer/transferLoadingSlice';
import { CONSTANTS, TOKEN_SYMBOL, TOKEN_TYPE } from 'constants';
import Web3 from 'web3';
import { rpc } from '../../constants/walletConst';
import * as solanaWeb3 from '@solana/web3.js';

const ConfirmDappTransactionBoxScreen = () => {
  const { t: getLabel } = useTranslation();
  const route = useRoute();
  const dispatch = useDispatch();

  const {
    contractAddress,
    wallet = {},
    transactionData = {},
    chain,
    schema,
    requestType,
    url: dappUrl,
    name,
    to,
  } = route.params;

  const transactionObj = { ...transactionData };

  const {
    _id: addressID,
    name: walletName,
    address: walletAddress,
    privateKey,
  } = wallet;

  const provider = getProvider(chain);
  const sheetRef = useRef();
  const walletID = getWalletId();

  const [inSufficientBalance, setInSufficientBalance] = useState(true);
  const [isEditableGasFee, setIsEditableGasFee] = useState(false);
  const [selectedIndexGasFee, setSelectedIndexGasFee] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);
  const [coinBalance, setCoinBalance] = useState(0);
  const [priceCoin, setPriceCoin] = useState(0);
  const [estimateGas, setEstimateGas] = useState(0);
  const [defaultGasPrice, setDefaultPrice] = useState(0);
  const [gasPriceTip, setGasPriceTip] = useState(0);

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  // Memo
  const [titleLabel, urlPathResponse, rejectResponseUrl, wrongResponseUrl] =
    useMemo(() => {
      let label = '',
        url = '',
        urlReject = '',
        urlWrong = '';

      switch (requestType) {
        case PAN_CONNECT.path.openBox:
          label = STRINGS.open_with_name;
          url = PAN_CONNECT.response.openBox;
          urlReject = PAN_CONNECT.pan_response.user_reject_open_box;
          urlWrong = PAN_CONNECT.pan_response.open_box_wrong;
          break;
        case PAN_CONNECT.path.unlockBox:
          label = STRINGS.unlock_with_name;
          url = PAN_CONNECT.response.unlockBox;
          urlReject = PAN_CONNECT.pan_response.user_reject_unlock_box;
          urlWrong = PAN_CONNECT.pan_response.unlock_box_wrong;
          break;
        case PAN_CONNECT.path.sendBox:
          label = STRINGS.send_with_name;
          url = PAN_CONNECT.response.sendBox;
          urlReject = PAN_CONNECT.pan_response.user_reject_send_box;
          urlWrong = PAN_CONNECT.pan_response.send_box_wrong;
          break;
        case PAN_CONNECT.path.buyBox:
          label = STRINGS.buy_with_name;
          url = PAN_CONNECT.response.buyBox;
          urlReject = PAN_CONNECT.pan_response.user_reject_buy_box;
          urlWrong = PAN_CONNECT.pan_response.buy_box_wrong;
          break;
        case PAN_CONNECT.path.cancelTransactionNonSuccess:
          label = STRINGS.cancelTransaction;
          url = PAN_CONNECT.response.cancelTransactionNonSuccess;
          urlReject = PAN_CONNECT.pan_response.user_reject_cancel_transaction;
          urlWrong = PAN_CONNECT.pan_response.cancel_transaction_wrong;
          break;
      }
      return [label, url, urlReject, urlWrong];
    }, [requestType]);

  const [networkType, gasOptions] = useMemo(
    () => [getTokenType(chain), getGasOptionByNetwork(chain)],
    [chain],
  );

  const chainInfo = useMemo(
    () => getChainInfoByType(networkType),
    [networkType],
  );

  const coinSymbol = useMemo(() => chainInfo.symbol, [chainInfo.symbol]);

  const transactionFeeValueInNumber = useMemo(() => {
    return transactionFee / 10 ** chainInfo.decimals;
  }, [transactionFee, chainInfo.decimals]);

  const transactionFeeInUsd = useMemo(
    () =>
      formatCurrency(transactionFeeValueInNumber * priceCoin, fiatCurrency, 5),
    [transactionFeeValueInNumber, priceCoin, fiatCurrency],
  );

  const isDisplayContractAddress = useMemo(() => {
    return [
      PAN_CONNECT.path.openBox,
      PAN_CONNECT.path.unlockBox,
      PAN_CONNECT.path.cancelTransactionNonSuccess,
    ].includes(requestType);
  }, [requestType]);

  // Function
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
      handleOpenLinkToDApp({ ...wrongResponseUrl, error });
    }
  };

  const getTransactionFee = async () => {
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
  };

  const handleGetTransactionFee = useCallback(() => {
    getTransactionFee().done();
  }, [gasOptions, selectedIndexGasFee, chain]);

  const handleOpenEditGasFee = () => {
    sheetRef.current.snapTo(0);
    setIsEditableGasFee(true);
  };

  const handleCloseSheet = () => {
    setIsEditableGasFee(false);
    sheetRef.current.snapTo(1);
  };

  const handleSaveEditGasFee = newValue => {
    setSelectedIndexGasFee(newValue);
    handleCloseSheet();
  };

  const getWalletBalance = useCallback(async () => {
    const balance = await getCoinBalance(walletAddress, networkType);

    setCoinBalance(balance);
  }, [walletAddress, networkType]);

  const getAction = () => {
    switch (requestType) {
      case PAN_CONNECT.path.buyBox: {
        return TRANSACTION.buyBox;
      }
      case PAN_CONNECT.path.unlockBox: {
        return TRANSACTION.unlockBox;
      }
      case PAN_CONNECT.path.openBox: {
        return TRANSACTION.openBox;
      }
      case PAN_CONNECT.path.sendBox: {
        return TRANSACTION.sendBox;
      }
      case PAN_CONNECT.path.cancelTransactionNonSuccess: {
        return TRANSACTION.cancelTransaction;
      }
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

  const handleConfirmRequest = async () => {
    const loadingObj = {
      bundle: route.params.bundle,
      accessToken: route.params.accessToken,
      requestType: route.params.requestType,
      isLoading: true,
    };
    dispatch(pushTransferLoading(loadingObj));
    try {
      setTransactionObj();

      signAndSendSignedTransaction(provider, transactionObj, privateKey).then(
        ({ transactionHash }) => {
          setTimeout(() => {
            provider.eth
              .getTransaction(transactionHash)
              .then(data => {
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
                  tokenSymbol: chainInfo.symbol,
                  coinSymbol,
                  time: new Date().getTime(),
                  networkBlockChain: networkType,
                };

                insertNewTransactionHistories(dispatch, params);

                // Send txHash back to Dapp
                handleOpenLinkToDApp({
                  transactionHash,
                  ...PAN_CONNECT.pan_response.success,
                });
              })
              .catch(error => {
                handleOpenLinkToDApp({ ...wrongResponseUrl, error });
              });
          }, 200);
        },
      );
    } catch (error) {
      handleOpenLinkToDApp({ ...wrongResponseUrl, error });
    }
    dispatch(removeTransferLoading(loadingObj));
  };

  const handleRejectRequest = () => {
    handleOpenLinkToDApp(rejectResponseUrl);
  };

  const handleOpenLinkToDApp = options => {
    const url = makeURL(schema, urlPathResponse, options);
    onOpenLinkToDApp(url);
  };

  // Effect
  useEffect(() => {
    handleGetTransactionFee();
  }, [handleGetTransactionFee]);

  useEffect(() => {
    if (transactionFee > 0) {
      setInSufficientBalance(transactionFee > coinBalance);
    }
  }, [coinBalance, transactionFee]);

  useEffect(() => {
    getWalletBalance();
  }, [getWalletBalance]);

  useEffect(() => {
    getCoinInfoOnMarket(coinSymbol, fiatCurrency).then(info => {
      setPriceCoin(info?.[0]?.current_price || 0);
    });
  }, [coinSymbol, fiatCurrency]);

  return (
    <>
      <Container>
        <HeaderLabel
          label={getLabel(STRINGS.smartContractCall)}
          hiddenBackButton
        />
        <ScrollView style={{ flex: 1, width: '100%' }}>
          <Text style={styles.name}>{getLabel(titleLabel, { name })}</Text>
          <Text style={styles.subTitle}>
            {getLabel(STRINGS.approveTransaction)}
          </Text>

          <RowSpaceBetweenItem
            label={getLabel(STRINGS.from)}
            value={`${walletName} (${compactAddress(walletAddress)})`}
          />
          <RowSpaceBetweenItem
            label={getLabel(
              isDisplayContractAddress ? STRINGS.contract_address : STRINGS.to,
            )}
            value={compactAddress(
              isDisplayContractAddress ? contractAddress : to,
            )}
            style={{ marginTop: 12 }}
          />
          <RowSpaceBetweenItem
            label={getLabel(STRINGS.dApp)}
            value={dappUrl}
            style={{ marginTop: 12 }}
          />

          <EditGasFee
            style={{ marginTop: 24, alignSelf: 'flex-end' }}
            onPress={handleOpenEditGasFee}
          />
          <RowSpaceBetweenItem
            label={getLabel(STRINGS.transactionFee)}
            icon={<TransactionFeeIcon chainName={chain.toUpperCase()} />}
            style={{ marginTop: 12 }}
            value={`${parseFloat(
              transactionFeeValueInNumber.toFixed(10),
            )} ${coinSymbol} (${transactionFeeInUsd})`}
          />
          <RowSpaceBetweenItem
            label={getLabel(STRINGS.maxTotal)}
            labelStyle={FONTS.t16r}
            valueStyle={{
              color: inSufficientBalance ? COLOR.systemRedLight : COLOR.white,
            }}
            style={{ marginTop: 12 }}
            value={transactionFeeInUsd}
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
          onConfirm={handleConfirmRequest}
          onReject={handleRejectRequest}
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
    </>
  );
};

const styles = StyleSheet.create({
  name: {
    color: COLOR.white,
    ...FONTS.t30b,
    marginTop: 32,
    marginBottom: 26,
    textAlign: 'center',
  },
  subTitle: {
    color: COLOR.white,
    ...FONTS.t16r,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorMsg: {
    alignSelf: 'flex-end',
    color: COLOR.systemRedLight,
    ...FONTS.t12r,
    marginTop: 4,
  },
});

export default ConfirmDappTransactionBoxScreen;
