import React, { useCallback, useEffect } from 'react';
import { Image, ImageBackground, StyleSheet, Text } from 'react-native';
import {
  SIZES,
  IMAGES,
  COLOR,
  FONTS,
  STRINGS,
  TRANSACTION,
  TOKEN_NAME,
  TOKEN_TYPE,
  SCREEN_NAME,
  CONSTANTS,
} from 'constants';
import Constants from 'constants/constants';
import { useTranslation } from 'react-i18next';
import { DAORepository, storage } from 'databases';
import { waitBSCTx, waitSOLTx, waitEthTx } from 'walletCore/waitTxMined';
import { useDispatch } from 'react-redux';
import { setTransaction } from 'stores/reducer/TransactionSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatId } from 'utils/format.util';
import { getDataNftHome } from 'walletCore/getDataNftHome';
import { handleRemoveNFT } from 'walletCore/NftHelper/handleRemoveNFT';

const SendNftSuccessScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const {
    walletID,
    walletChain,
    addressID,
    networkName,
    transactionHash,
    transactionFee,
    ownerAddress,
    recipientAddress,
    tokenSymbol,
    transactionTime,
    tokenId,
    contractAddress,
    tokenName,
  } = route.params;

  const handleUpdateTransaction = useCallback(
    (element, transactionType) => {
      DAORepository.updateStateTx(element._id, transactionType).then(item =>
        dispatch(
          setTransaction({
            data: item,
            onPress: () => handleNavigateToTransactionDetail(element),
          }),
        ),
      );
    },
    [dispatch, handleNavigateToTransactionDetail],
  );

  const handleNavigateToTransactionDetail = useCallback(
    (transactionData = {}) => {
      const time = transactionData.time?.toLocaleTimeString();
      const date = transactionData.time?.toLocaleDateString();

      navigation.navigate(SCREEN_NAME.sendNftTransactionDetailScreen, {
        action: transactionData.actionTransaction,
        status: transactionData.statusTransaction,
        date: `${time} - ${date}`,
        from: transactionData.address_from,
        to: transactionData.address_to,
        network: transactionData.networkBlockChain,
        transactionFee: transactionData.transactionFee.toFixed(5),
        tokenId: formatId(tokenId),
        tokenName,
        tokenUnit: String(tokenSymbol).toUpperCase(),
      });
    },
    [navigation, tokenId, tokenName, tokenSymbol],
  );

  const handleRemoveNftFromDatabase = useCallback(async () => {
    await handleRemoveNFT(
      walletID,
      walletChain,
      networkName,
      contractAddress,
      tokenId,
    );
  }, [contractAddress, networkName, tokenId, walletChain, walletID]);

  useEffect(() => {
    handleRemoveNftFromDatabase();

    const blockchainNetwork = handleGetTokenType(networkName);

    const updateTimeout = setTimeout(() => {
      navigation.navigate(SCREEN_NAME.homeScreen);

      DAORepository.insertNewTransactionHistories(
        walletID,
        addressID,
        blockchainNetwork,
        transactionHash,
        0,
        transactionFee,
        ownerAddress,
        recipientAddress,
        TRANSACTION.send,
        TRANSACTION.pending,
        tokenSymbol,
        tokenSymbol,
        new Date(transactionTime),
        tokenId,
        tokenName,
      ).then(element => {
        let waitToMinedMethod;

        if (element.networkBlockChain === TOKEN_TYPE.ERC20) {
          waitToMinedMethod = waitEthTx;
        } else if (element.networkBlockChain === TOKEN_TYPE.SPL) {
          waitToMinedMethod = waitSOLTx;
        } else if (element.networkBlockChain === TOKEN_TYPE.BEP20) {
          waitToMinedMethod = waitBSCTx;
        }

        waitToMinedMethod(element.transactionHash)
          .then(() => {
            handleUpdateTransaction(element, TRANSACTION.confirm);
          })
          .catch(() => {
            handleUpdateTransaction(element, TRANSACTION.failed);
          });
      });
    }, 500);

    return () => clearTimeout(updateTimeout);
  }, [
    addressID,
    handleRemoveNftFromDatabase,
    handleUpdateTransaction,
    navigation,
    networkName,
    ownerAddress,
    recipientAddress,
    tokenSymbol,
    transactionFee,
    transactionHash,
    transactionTime,
    walletID,
  ]);

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

const handleGetTokenType = tokenName => {
  switch (tokenName) {
    case TOKEN_NAME.ethereum:
      return TOKEN_TYPE.ERC20;
    case TOKEN_NAME.smartChain:
      return TOKEN_TYPE.BEP20;
    case TOKEN_NAME.solana:
      return TOKEN_TYPE.SPL;
    default:
      return '';
  }
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

export default SendNftSuccessScreen;
