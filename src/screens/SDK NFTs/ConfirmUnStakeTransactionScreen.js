import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import {
  Container,
  RejectAndConfirmButton,
  RowSpaceBetweenItem,
  TransactionFeeIcon,
  WarningAlert,
} from 'components/common';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLOR, FONTS, PAN_CONNECT, STRINGS } from 'constants';
import { compactAddress, getProvider, getWalletId, makeURL } from 'utils/util';
import { EditGasFee, EditGasFeeBottomSheet } from 'components/SDK';
import { useRoute } from '@react-navigation/native';
import {
  getCoinInfoOnMarket,
  getNetworkName,
  getTokenType,
} from 'utils/infoToken';
import {
  getChainInfoByType,
  getGasOptionByNetwork,
  getTransactionFeeByType,
} from 'utils/gas.util';
import { formatCurrency } from 'utils/format.util';
import { getCoinBalance } from 'walletCore/balance';
import { onOpenLinkToDApp } from 'utils/sdk';
import { getGasLimit, toHex } from 'utils/blockchain';
import { signAndSendSignedTransaction } from 'walletCore/sdk';
import { insertNewTransactionHistories } from 'screens/WalletConnectSessionsScreen/helper';
import { useDispatch, useSelector } from 'react-redux';
import {
  pushTransferLoading,
  removeTransferLoading,
} from 'stores/reducer/transferLoadingSlice';

const ConfirmUnStakeTransactionScreen = () => {
  const { t: getLabel } = useTranslation();
  const route = useRoute();
  const dispatch = useDispatch();

  const {
    wallet = {},
    transactionData = {},
    chain,
    schema,
    url: dappUrl,
    to,
  } = route.params;

  const {
    _id: addressID,
    name: walletName,
    address: walletAddress,
    privateKey,
  } = wallet;

  const provider = getProvider(chain);
  const sheetRef = useRef();
  const walletID = getWalletId();

  const [inSufficientBalance, setInSufficientBalance] = useState(false);
  const [isEditableGasFee, setIsEditableGasFee] = useState(false);
  const [selectedIndexGasFee, setSelectedIndexGasFee] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);
  const [coinBalance, setCoinBalance] = useState(0);
  const [priceCoin, setPriceCoin] = useState(0);

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const [networkName, networkType, gasOptions] = useMemo(
    () => [
      getNetworkName(chain),
      getTokenType(chain),
      getGasOptionByNetwork(chain),
    ],
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

  const handleGetTransactionFee = useCallback(async () => {
    const fee = await getTransactionFeeByType(
      chain,
      gasOptions[selectedIndexGasFee],
    );

    setTransactionFee(fee);
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

  const handleConfirmRequest = async () => {
    const transactionObj = { ...transactionData };
    const loadingObj = {
      bundle: route.params.bundle,
      accessToken: route.params.accessToken,
      requestType: route.params.requestType,
      isLoading: true,
    };
    dispatch(pushTransferLoading(loadingObj));
    try {
      const gasLimit = await getGasLimit(provider);
      transactionObj.gasLimit = toHex(gasLimit);

      const response = await signAndSendSignedTransaction(
        provider,
        transactionObj,
        privateKey,
      );
      const transactionHash = response?.transactionHash;

      provider.eth
        .getTransaction(transactionHash)
        .then(data => {
          const params = {
            walletID,
            addressID,
            chainType: networkType,
            id: data.hash,
            asset: Number(data.value),
            gas: parseFloat(
              (transactionFee / 10 ** chainInfo.decimals).toFixed(5),
            ),
            from: data.from,
            to: data.to,
            tokenSymbol: null,
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
          handleOpenLinkToDApp({
            ...PAN_CONNECT.pan_response.unstake_nft_wrong,
            error,
          });
        });
    } catch (error) {
      handleOpenLinkToDApp({
        ...PAN_CONNECT.pan_response.unstake_nft_wrong,
        error,
      });
    }
    dispatch(removeTransferLoading(loadingObj));
  };

  const handleRejectRequest = () => {
    handleOpenLinkToDApp(PAN_CONNECT.pan_response.user_reject_un_stake_nft);
  };

  const handleOpenLinkToDApp = options => {
    const url = makeURL(schema, PAN_CONNECT.response.unStakeNFT, options);
    onOpenLinkToDApp(url);
  };

  // Effect
  useEffect(() => {
    handleGetTransactionFee();
  }, [handleGetTransactionFee]);

  useEffect(() => {
    setInSufficientBalance(transactionFee > coinBalance);
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
        <ScrollView style={{ flex: 1, width: '100%' }}>
          <Text style={styles.title}>
            {getLabel(STRINGS.confirmTransaction)}
          </Text>

          <RowSpaceBetweenItem
            label={getLabel(STRINGS.asset)}
            value={`${networkName} (${coinSymbol})`}
            style={{ marginTop: 42 }}
          />
          <RowSpaceBetweenItem
            label={getLabel(STRINGS.from)}
            value={`${walletName} (${compactAddress(walletAddress)})`}
            style={{ marginTop: 12 }}
          />

          <RowSpaceBetweenItem
            label={getLabel(STRINGS.to)}
            value={compactAddress(to)}
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
            value={`${transactionFeeValueInNumber} ${coinSymbol} (${transactionFeeInUsd})`}
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
      />
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    color: COLOR.white,
    ...FONTS.t16b,
    textAlign: 'center',
  },
  errorMsg: {
    alignSelf: 'flex-end',
    color: COLOR.systemRedLight,
    ...FONTS.t12r,
    marginTop: 4,
  },
});

export default ConfirmUnStakeTransactionScreen;
