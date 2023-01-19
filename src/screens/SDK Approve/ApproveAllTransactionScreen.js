import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ApproveTransactionLayout from './ApproveTransactionLayout';
import { useTranslation } from 'react-i18next';
import { STRINGS } from 'constants';
import { compactAddress, getProvider, getWalletId, makeURL } from 'utils/util';
import { signAndSendSignedTransaction } from 'walletCore/sdk';
import { PAN_CONNECT, TOKEN_SYMBOL, TRANSACTION } from '../../constants';
import { onOpenLinkToDApp } from 'utils/sdk';
import { useDispatch, useSelector } from 'react-redux';
import { insertNewTransactionHistories } from 'screens/WalletConnectSessionsScreen/helper';
import {
  getCoinInfoOnMarket,
  getCoinSymbol,
  getNetworkName,
  getTokenType,
} from 'utils/infoToken';
import { getEstimateGas } from 'walletCore/approve';
import { convertWeiToNumber } from 'utils/blockchain';
import { WalletCoinLoadingModal } from 'components/modals';
import {
  pushTransferLoading,
  removeTransferLoading,
} from 'stores/reducer/transferLoadingSlice';
import {
  getChainInfoByType,
  getGasOptionByNetwork,
  getTransactionFeeByType,
} from 'utils/gas.util';
import { formatCurrency } from 'utils/format.util';
import { getCoinBalance } from 'walletCore/balance';

const ApproveAllTransactionScreen = ({ route }) => {
  const { t: getLabel } = useTranslation();

  const {
    wallet = {},
    transactionData = {},
    contractAddress,
    schema,
    chain,
    type,
  } = route.params;

  const {
    _id: addressID,
    name: walletName,
    privateKey,
    address: from,
  } = wallet;

  const dispatch = useDispatch();
  const provider = getProvider(chain);
  const walletID = getWalletId();

  const [isVisibleLoadingModal, setIsVisibleLoadingModal] = useState(false);
  const [transactionFee, setTransactionFee] = useState(0);
  const [priceCoin, setPriceCoin] = useState(0);
  const [inSufficientBalance, setInSufficientBalance] = useState(true);
  const [coinBalance, setCoinBalance] = useState(0);

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const [networkType, networkName] = useMemo(
    () => [getTokenType(chain), getNetworkName(chain)],
    [chain],
  );

  const coinSymbol = useMemo(() => getCoinSymbol(networkName), [networkName]);

  const chainInfo = useMemo(
    () => getChainInfoByType(networkType),
    [networkType],
  );

  const maxTotalInUsd = useMemo(
    () => formatCurrency(transactionFee * priceCoin, fiatCurrency, 5),
    [transactionFee, priceCoin, fiatCurrency],
  );

  const handleGetTransactionFee = useCallback(async () => {
    const gasLimit =
      (await getEstimateGas(provider, contractAddress, from)) * 1.5;
    const gasPriceInWei = await provider.eth.getGasPrice();
    const gasPriceInNumber = convertWeiToNumber(provider, gasPriceInWei);
    const gasInNumber = (gasPriceInNumber * gasLimit).toFixed(10);
    setTransactionFee(gasInNumber);
  }, [networkName]);

  const handleConfirmApprove = async () => {
    setIsVisibleLoadingModal(true);
    const transactionObj = { ...transactionData };
    const loadingObj = {
      bundle: route.params.bundle,
      accessToken: route.params.accessToken,
      requestType: route.params.requestType,
      type: route.params.type,
      isLoading: true,
    };
    dispatch(pushTransferLoading(loadingObj));
    try {
      const gasLimit =
        (await getEstimateGas(provider, contractAddress, from)) * 1.5;
      const gasPriceInWei = await provider.eth.getGasPrice();
      transactionObj.gasLimit = parseInt(gasLimit, 10);
      transactionObj.gasPrice = gasPriceInWei;

      const gasPriceInNumber = convertWeiToNumber(provider, gasPriceInWei);
      const gasInNumber = (gasPriceInNumber * gasLimit).toFixed(10);

      signAndSendSignedTransaction(provider, transactionObj, privateKey)
        .then(({ transactionHash }) => {
          setTimeout(() => {
            provider.eth
              .getTransaction(transactionHash)
              .then(data => {
                const params = {
                  action: TRANSACTION.approve,
                  walletID,
                  addressID,
                  chainType: networkType,
                  id: data.hash,
                  asset: Number(data.value),
                  gas: gasInNumber,
                  from: data.from,
                  to: data.to,
                  tokenSymbol: null,
                  coinSymbol,
                  time: new Date().getTime(),
                  networkBlockChain: networkType,
                };

                insertNewTransactionHistories(dispatch, params);
                setIsVisibleLoadingModal(false);
                // Send txHash back to Dapp
                handleOpenLinkToDApp({
                  transactionHash,
                  ...PAN_CONNECT.pan_response.success,
                });
              })
              .catch(error => {
                setIsVisibleLoadingModal(false);
                handleOpenLinkToDApp({
                  ...PAN_CONNECT.pan_response.approve_wrong,
                  error,
                });
              });
          }, 200);
        })
        .catch(error => {
          setIsVisibleLoadingModal(false);
          handleOpenLinkToDApp({
            ...PAN_CONNECT.pan_response.approve_wrong,
            error,
          });
        });
    } catch (error) {
      setIsVisibleLoadingModal(false);
      handleOpenLinkToDApp({
        ...PAN_CONNECT.pan_response.approve_wrong,
        error,
      });
    }
    dispatch(removeTransferLoading(loadingObj));
  };

  const handleRejectApprove = () => {
    handleOpenLinkToDApp(PAN_CONNECT.pan_response.user_reject_approve);
  };

  const handleOpenLinkToDApp = (options = {}) => {
    const url = makeURL(schema, PAN_CONNECT.response.approve, {
      ...options,
      type,
    });
    onOpenLinkToDApp(url);
  };

  const getWalletBalance = useCallback(async () => {
    const balance = await getCoinBalance(from, networkType);

    setCoinBalance(balance);
  }, [from, networkType]);

  useEffect(() => {
    getWalletBalance();
  }, [getWalletBalance]);

  useEffect(() => {
    handleGetTransactionFee();
  }, [handleGetTransactionFee]);

  useEffect(() => {
    getCoinInfoOnMarket(chainInfo.symbol, fiatCurrency).then(info => {
      setPriceCoin(info?.[0]?.current_price || 0);
    });
  }, [chainInfo.symbol, fiatCurrency]);

  useEffect(() => {
    setInSufficientBalance(transactionFee > coinBalance);
  }, [coinBalance, transactionFee]);

  return (
    <>
      <ApproveTransactionLayout
        title={getLabel(STRINGS.approveAll)}
        from={`${walletName} (${compactAddress(from)})`}
        contractAddress={compactAddress(contractAddress)}
        chain={chain}
        transactionFeeValueFinally={transactionFee}
        coinSymbol={coinSymbol}
        priceCoin={priceCoin}
        fiatCurrency={fiatCurrency}
        inSufficientBalance={inSufficientBalance}
        maxTotalInUsd={maxTotalInUsd}
        onConfirm={handleConfirmApprove}
        onReject={handleRejectApprove}
      />
      <WalletCoinLoadingModal visible={isVisibleLoadingModal} />
    </>
  );
};

ApproveAllTransactionScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      wallet: PropTypes.object,
      transactionData: PropTypes.object,
      contractAddress: PropTypes.string,
      schema: PropTypes.string,
      type: PropTypes.string,
      chain: PropTypes.oneOf(Object.values(TOKEN_SYMBOL)),
    }),
  }),
};

export default ApproveAllTransactionScreen;
