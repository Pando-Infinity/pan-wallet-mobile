import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Backdrop,
  Container,
  HeaderLabel,
  RejectAndConfirmButton,
  WarningAlert,
  TransactionFeeIcon,
} from 'components/common';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RowInfo } from './components';
import { STRINGS, FONTS, COLOR, ICONS, CONSTANTS } from 'constants';
import { useTranslation } from 'react-i18next';
import { storage } from 'databases';
import {
  compactAddress,
  getAddress,
  getContractSymbol,
  getPrivateKey,
  getProvider,
  getWalletId,
} from 'utils/util';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WalletConnector } from 'walletCore';
import { deniedTransactionSignatureError } from 'constants/Transaction';
import {
  getChainInfoByType,
  getGasOptionByNetwork,
  getTransactionFeeByType,
} from 'utils/gas.util';
import { EditGasFee, EditGasFeeModal } from 'components/SDK';
import { useDispatch, useSelector } from 'react-redux';
import { formatCurrency } from 'utils/format.util';
import { insertNewTransactionHistories } from './helper';
import BottomSheet from 'reanimated-bottom-sheet';
import { ERC20TransferABI, getCoinInfoOnMarket } from 'utils/infoToken';
import { round } from 'lodash';

const ConfirmTransaction = () => {
  const { t: getLabel } = useTranslation();
  const walletID = getWalletId();
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const { peerMeta, payload, peerId, chainId } = route.params;
  const provider = getProvider(chainId);
  const transaction = payload?.params?.[0] || {};

  const sheetRef = useRef(null);

  const [transactionFee, setTransactionFee] = useState();
  const [selectedIndexGasFee, setSelectedIndexGasFee] = useState(1);
  const [isEditGasFeeModal, setIsEditGasFeeModal] = useState(false);
  const [tokenApproveInfo, setTokenApproveInfo] = useState({});
  const [priceCoin, setPriceCoin] = useState(0);

  const contractSymbol = useMemo(() => getContractSymbol(chainId), [chainId]);

  const isApprove = useMemo(
    () => Boolean(payload?.params?.[0]?.gas),
    [payload?.params],
  );
  const gasOptions = useMemo(
    () => getGasOptionByNetwork(contractSymbol),
    [contractSymbol],
  );
  const chainInfo = useMemo(
    () => getChainInfoByType(contractSymbol),
    [contractSymbol],
  );
  const transactionFeeValueFinally = useMemo(() => {
    return parseFloat((transactionFee / 10 ** chainInfo.decimals).toFixed(6));
  }, [transactionFee, chainInfo.decimals]);

  const transactionFeeLabel = useMemo(
    () => `${transactionFeeValueFinally} ${chainInfo.symbol}`,
    [transactionFeeValueFinally, chainInfo.symbol],
  );

  const total = useMemo(() => {
    return transaction.value / 10 ** chainInfo.decimals || 0;
  }, [transaction.value, chainInfo.decimals]);

  const headerLabel = useMemo(() => {
    const string = isApprove
      ? STRINGS.smartContractCall
      : STRINGS.confirmTransaction;
    return getLabel(string);
  }, [getLabel, isApprove]);

  const fromLabel = useMemo(() => {
    const currentWalletName = storage.getString(CONSTANTS.firstWalletNameKey);
    return `${currentWalletName} (${compactAddress(transaction.from)})`;
  }, [transaction.from]);

  const maxTotal = useMemo(
    () => transactionFeeValueFinally * priceCoin + total,
    [transactionFeeValueFinally, priceCoin, total],
  );

  const handleSaveGasFee = newValue => {
    setSelectedIndexGasFee(newValue);
    sheetRef.current.snapTo(1);
    setIsEditGasFeeModal(false);
  };

  const handleOpenEditGasFee = () => {
    setIsEditGasFeeModal(true);
    sheetRef.current.snapTo(0);
  };

  const handleRejectRequest = () => {
    try {
      WalletConnector.rejectRequest(
        peerId,
        payload?.id,
        deniedTransactionSignatureError,
      ).then(() => {
        navigation.goBack();
      });
    } catch (error) {
      navigation.goBack();
    }
  };

  const handleConfirmRequest = async () => {
    try {
      const privateKey = await getPrivateKey(walletID);
      navigation.goBack();
      if (!transaction.gas && transactionFee) {
        if (contractSymbol === 'BEP20') {
          transaction.gas = round(transactionFee / 1e10);
        } else {
          transaction.gas = round(transactionFee);
        }
      }
      provider.eth.accounts.signTransaction(
        transaction,
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
              WalletConnector.approveRequest(peerId, payload?.id, res);
              let wallet;
              getAddress(walletID, contractSymbol, newData => {
                wallet = newData;
              });
              provider.eth.getTransaction(res).then(data => {
                const params = {
                  walletID,
                  addressID: wallet._id,
                  chainType: contractSymbol,
                  id: data.hash,
                  asset: Number(data.value),
                  gas: parseFloat(
                    (transactionFee / 10 ** chainInfo.decimals).toFixed(6),
                  ),
                  from: data.from,
                  to: data.to,
                  tokenSymbol: tokenApproveInfo.symbol ?? chainInfo.symbol,
                  coinSymbol: chainInfo.symbol,
                  time: new Date().getTime(),
                };
                insertNewTransactionHistories(dispatch, params);
              });
            },
          );
        },
      );
    } catch (error) {
      navigation.goBack();
    }
  };

  const getTokenInfo = async tokenContract => {
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.methods.name().call(),
      tokenContract.methods.symbol().call(),
      tokenContract.methods.decimals().call(),
    ]);
    return { name, symbol, decimals };
  };

  useEffect(() => {
    getCoinInfoOnMarket(chainInfo.symbol, fiatCurrency, chainInfo.name).then(
      info => {
        setPriceCoin(info?.[0]?.current_price || 0);
      },
    );
  }, [chainInfo.symbol, chainInfo.name, fiatCurrency]);

  useEffect(() => {
    getTransactionFeeByType(
      contractSymbol,
      gasOptions[selectedIndexGasFee],
    ).then(data => setTransactionFee(data));
  }, [gasOptions, contractSymbol, selectedIndexGasFee]);

  useLayoutEffect(() => {
    if (!provider || !transaction.to) return;
    const tokenContract = new provider.eth.Contract(
      ERC20TransferABI,
      transaction.to,
    );

    getTokenInfo(tokenContract).then(data => {
      setTokenApproveInfo(data);
    });
  }, [transaction.to, provider, transaction.gas]);

  return (
    <>
      <Container>
        <HeaderLabel label={headerLabel} hiddenBackButton />
        <View style={{ marginTop: 42, alignItems: 'center' }}>
          {isApprove ? (
            <Text style={styles.approveToken}>
              {getLabel(STRINGS.approveToken, {
                symbol: tokenApproveInfo.symbol || '',
              })}
            </Text>
          ) : (
            <>
              <Text style={styles.total}>{`${total} ${chainInfo.symbol}`}</Text>
              <Text style={styles.totalByCurrency}>
                {formatCurrency(total, fiatCurrency, 5)}
              </Text>
            </>
          )}
          <Text style={styles.approveRequest}>
            {getLabel(STRINGS.approveTransaction)}
          </Text>
        </View>
        <View style={styles.container}>
          <RowInfo title={getLabel(STRINGS.from)} content={fromLabel} />
          {isApprove ? (
            <RowInfo
              title={getLabel(STRINGS.contract_address)}
              content={compactAddress(transaction.to)}
              style={{ marginTop: 12 }}
            />
          ) : (
            <>
              <RowInfo
                title={getLabel(STRINGS.to)}
                content={compactAddress(transaction.to)}
                style={{ marginTop: 12 }}
              />
              <RowInfo
                title={getLabel(STRINGS.dApp)}
                content={peerMeta?.url}
                style={{ marginTop: 12 }}
              />
            </>
          )}
          <RowInfo
            title={''}
            content={<EditGasFee onPress={handleOpenEditGasFee} />}
            style={{ marginTop: 16 }}
          />
          <RowInfo
            title={getLabel(STRINGS.transactionFee)}
            content={transactionFeeLabel}
            style={{ marginTop: 14 }}
            imageIcon={<TransactionFeeIcon />}
          />
          <RowInfo
            title={getLabel(STRINGS.maxTotal)}
            content={formatCurrency(maxTotal, fiatCurrency, 5)}
            style={{ marginTop: 12 }}
          />
        </View>
        <WarningAlert
          message={getLabel(STRINGS.confirmTransactionWarningMessage)}
        />
        <RejectAndConfirmButton
          onReject={handleRejectRequest}
          onConfirm={handleConfirmRequest}
          style={{ marginTop: 24 }}
        />
      </Container>
      <Backdrop open={isEditGasFeeModal} />
      <BottomSheet
        ref={sheetRef}
        snapPoints={[338, 0]}
        initialSnap={1}
        enabledContentTapInteraction={false}
        enabledGestureInteraction={false}
        renderContent={() =>
          isEditGasFeeModal && (
            <EditGasFeeModal
              contractSymbol={contractSymbol}
              selectedIndexGasFee={selectedIndexGasFee}
              onSave={handleSaveGasFee}
            />
          )
        }
        renderHeader={() => (
          <View style={styles.gasFeeHeader}>
            <Text style={{ color: COLOR.white, ...FONTS.t16b }}>
              {getLabel(STRINGS.editGasFee)}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsEditGasFeeModal(false);
                sheetRef.current.snapTo(1);
              }}>
              <Image source={ICONS.clear2} />
            </TouchableOpacity>
          </View>
        )}
      />
    </>
  );
};

ConfirmTransaction.propTypes = {};

export default ConfirmTransaction;

const styles = StyleSheet.create({
  total: {
    ...FONTS.t30b,
    color: COLOR.white,
  },
  totalByCurrency: {
    ...FONTS.t16r,
    color: COLOR.textSecondary,
    marginTop: 8,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  approveRequest: {
    ...FONTS.t16r,
    color: COLOR.white,
    marginVertical: 24,
  },
  approveToken: {
    ...FONTS.t30b,
    color: COLOR.white,
  },
  gasFeeHeader: {
    backgroundColor: COLOR.simpleBackground,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    position: 'relative',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLOR.gray5,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginRight: 20,
  },
});
