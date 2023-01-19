import React, { useEffect } from 'react';
import {
  ImageBackground,
  Text,
  Image,
  Platform,
  NativeModules,
  Linking,
  StyleSheet,
} from 'react-native';

import {
  COLOR,
  FONTS,
  IMAGES,
  PAN_CONNECT,
  SCREEN_NAME,
  SIZES,
  STRINGS,
  TRANSACTION,
} from '../../constants';
import { DAORepository } from '../../databases';

import { useNavigation, useRoute } from '@react-navigation/native';
import { waitBSCTx, waitSOLTx, waitEthTx } from 'walletCore/waitTxMined';
import { useDispatch } from 'react-redux';
import { setTransaction } from 'stores/reducer/TransactionSlice';
import { makeURL } from 'utils/util';
import { useTranslation } from 'react-i18next';

const SendSuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleNavigateToTransactionDetail = (transactionData = {}) => {
    const time = transactionData.time?.toLocaleTimeString();
    const date = transactionData.time?.toLocaleDateString();

    navigation.navigate(SCREEN_NAME.transactionDetailScreen, {
      action: transactionData.actionTransaction,
      status: transactionData.statusTransaction,
      date: `${time} - ${date}`,
      from: transactionData.address_from,
      to: transactionData.address_to,
      amount: transactionData.amount,
      network: transactionData.networkBlockChain,
      transactionFee: transactionData.transactionFee,
      coinUnit: route.params.tx.gas.token.symbol ?? '',
      tokenUnit: route.params.tx.amount.token.symbol ?? '',
    });
  };

  const handleOpenLinkToDApp = url => {
    if (Platform.OS === 'android') {
      NativeModules.ConnectWalletModule.openLinkToDApp(url);
      navigation.pop();
    } else {
      Linking.openURL(url)
        .catch(error => console.error(error))
        .finally(() => navigation.pop());
    }
  };

  const updateStateTransaction = element => {
    switch (element.networkBlockChain) {
      case 'ERC20': {
        waitEthTx(element.transactionHash)
          .then(() => {
            DAORepository.updateStateTx(element._id, TRANSACTION.confirm).then(
              item => {
                dispatch(
                  setTransaction({
                    data: item,
                    onPress: () => handleNavigateToTransactionDetail(element),
                  }),
                );
              },
            );
          })
          .catch(() => {
            DAORepository.updateStateTx(element._id, TRANSACTION.failed).then(
              item => {
                dispatch(
                  setTransaction({
                    data: item,
                    onPress: () => handleNavigateToTransactionDetail(element),
                  }),
                );
              },
            );
          });
        break;
      }

      case 'SPL': {
        waitSOLTx(element.transactionHash)
          .then(() => {
            DAORepository.updateStateTx(element._id, TRANSACTION.confirm).then(
              item => {
                dispatch(
                  setTransaction({
                    data: item,
                    onPress: () => handleNavigateToTransactionDetail(element),
                  }),
                );
              },
            );
          })
          .catch(() => {
            DAORepository.updateStateTx(element._id, TRANSACTION.failed).then(
              item => {
                dispatch(
                  setTransaction({
                    data: item,
                    onPress: () => handleNavigateToTransactionDetail(element),
                  }),
                );
              },
            );
          });
        break;
      }

      case 'BEP20': {
        waitBSCTx(element.transactionHash)
          .then(() => {
            DAORepository.updateStateTx(element._id, TRANSACTION.confirm).then(
              item => {
                dispatch(
                  setTransaction({
                    data: item,
                    onPress: () => handleNavigateToTransactionDetail(element),
                  }),
                );
              },
            );
          })
          .catch(() => {
            DAORepository.updateStateTx(element._id, TRANSACTION.failed).then(
              item => {
                dispatch(
                  setTransaction({
                    data: item,
                    onPress: () => handleNavigateToTransactionDetail(element),
                  }),
                );
              },
            );
          });
        break;
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (route.params.requestType === PAN_CONNECT.path.transfer) {
        const url = makeURL(
          route.params.schema,
          PAN_CONNECT.response.transfer,
          {
            code: PAN_CONNECT.pan_response.success.code,
            message: PAN_CONNECT.pan_response.success.message,
            transactionHash: route.params.tx.id,
          },
        );
        handleOpenLinkToDApp(url);
      } else if (route.params.requestType === PAN_CONNECT.path.depositToken) {
        const url = makeURL(
          route.params.schema,
          PAN_CONNECT.response.depositToken,
          {
            code: PAN_CONNECT.pan_response.success.code,
            message: PAN_CONNECT.pan_response.success.message,
            transactionHash: route.params.tx.id,
          },
        );
        handleOpenLinkToDApp(url);
      } else {
        navigation.goBack();
        navigation.goBack();
        navigation.goBack();
      }

      DAORepository.insertNewTransactionHistories(
        route.params.walletID,
        route.params.addressID,
        route.params.tx.gas.token.chainType,
        route.params.tx.id,
        route.params.tx.amount.asset,
        route.params.tx.gas.gas,
        route.params.tx.from,
        route.params.tx.to,
        TRANSACTION.send,
        TRANSACTION.pending,
        route.params.tx.amount.token.symbol,
        route.params.tx.gas.token.symbol,
        new Date(route.params.tx.time),
      ).then(element => {
        updateStateTransaction(element);
      });
    }, 500);
  }, []);

  return (
    <ImageBackground
      source={IMAGES.homeBackGround}
      style={styles.backgroundImage}
      resizeMode="cover">
      <Image source={IMAGES.deleteSuccess} style={styles.image} />
      <Text style={styles.message}>{t(STRINGS.requestHasBeenSentSuccess)}</Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 180,
    height: 180,
  },
  message: {
    textAlign: 'center',
    marginTop: SIZES.simpleMargin,
    color: COLOR.white,
    ...FONTS.t20b,
    maxWidth: 238,
  },
});

export default SendSuccess;
