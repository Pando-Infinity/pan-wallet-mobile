import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigation, useRoute } from '@react-navigation/native';
import NftInfo from '../components/NftInfo';
import { ScrollView, StyleSheet, Text, View, Modal } from 'react-native';
import { Container, HeaderLabel } from 'components/common';
import CustomButton from 'components/CustomButton/CustomButton';
import Loading from 'components/Loading/Loading';
import ErrorModal from 'screens/SendNft/components/ErrorModal';
import {
  STRINGS,
  COLOR,
  SIZES,
  FONTS,
  ICONS,
  SCREEN_NAME,
  TOKEN_NAME,
} from 'constants';
import Constants from 'constants/constants';
import { useTranslation } from 'react-i18next';
import { formatId } from 'utils/format.util';
import { compactAddress } from 'utils/util';
import { getWallet } from 'utils/wallet.util';
import { sendNftBSC, sendNftETH } from 'walletCore/sendNft';
import { sendNftSolana } from 'walletCore/solana';
import storage from 'databases/AsyncStorage';
import stringFormat from 'components/StringFormat/StringFormat';

const ConfirmSendNftScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const {
    tokenId,
    networkName,
    tokenImage,
    tokenName,
    tokenSymbol,
    networkSymbol,
    contractAddress,
    recipientAddress,
    ownerAddress,
    transactionFee,
    transactionFeeInUSD,
    gasFee,
    isSolanaNetwork,
  } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [isVisibleErrModal, setIsVisibleErrModal] = useState(false);
  const [wallet, setWallet] = useState({});

  const walletID = useMemo(() => {
    const walletId = storage.getNumber(Constants.rememberWalletIDKey);
    return walletId !== undefined ? walletId : 1;
  }, []);

  const walletChain = useMemo(() => {
    const walletFirstChain = storage.getString(Constants.firstChainTypeKey);
    return (
      storage.getString(Constants.rememberWalletChainKey) ?? walletFirstChain
    );
  }, []);

  const handleGetWalletInfo = useCallback(async () => {
    const walletInfo = await getWallet(walletID, ownerAddress, networkSymbol);
    setWallet(walletInfo);
  }, [ownerAddress, walletID, networkSymbol]);

  const handleSendNft = () => {
    setIsLoading(true);
    let handlePromise;

    try {
      switch (networkName) {
        case TOKEN_NAME.ethereum:
          handlePromise = sendNftETH(
            contractAddress,
            ownerAddress,
            wallet.privateKey,
            recipientAddress,
            tokenId,
            gasFee,
          );
          break;
        case TOKEN_NAME.smartChain:
          handlePromise = sendNftBSC(
            contractAddress,
            ownerAddress,
            wallet.privateKey,
            recipientAddress,
            tokenId,
            gasFee,
          );
          break;
        case TOKEN_NAME.solana:
          handlePromise = sendNftSolana(
            ownerAddress,
            recipientAddress,
            contractAddress,
            wallet.privateKey,
          );
          break;
        default:
          return;
      }

      handlePromise
        .then(txHash => {
          setIsLoading(false);

          navigation.navigate(SCREEN_NAME.sendNftSuccess, {
            transactionHash: txHash,
            transactionTime: new Date().getTime(),
            walletID,
            walletChain,
            addressID: wallet._id,
            transactionFee,
            ownerAddress,
            recipientAddress,
            tokenSymbol,
            tokenId,
            tokenName,
            networkName,
            contractAddress,
          });
        })
        .catch(error => {
          setIsLoading(false);
          setIsVisibleErrModal(true);
        });
    } catch (error) {
      setIsLoading(false);
      setIsVisibleErrModal(true);
    }
  };

  useEffect(() => {
    handleGetWalletInfo();
  }, [handleGetWalletInfo]);

  return (
    <Container>
      <HeaderLabel
        label={stringFormat(t(STRINGS.send_symbol), [`${tokenName}` || ``])}
      />

      <ScrollView style={{ flex: 1, width: '100%', marginTop: 12 }}>
        <NftInfo
          imageSrc={tokenImage}
          symbol={tokenSymbol}
          nftId={isSolanaNetwork ? null : formatId(tokenId)}
        />

        <SendInfoItem
          label={t(STRINGS.from)}
          value={`${wallet.name} (${compactAddress(ownerAddress)})`}
          style={{ marginTop: 48 }}
        />
        <SendInfoItem
          label={t(STRINGS.to)}
          value={compactAddress(recipientAddress)}
          style={{ marginTop: 12 }}
        />
        <SendInfoItem
          label={t(STRINGS.transactionFee)}
          style={{ marginTop: SIZES.simpleSpace * 3 }}
          value={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  color: COLOR.white,
                  ...FONTS.t16r,
                  textTransform: 'uppercase',
                }}>
                {`${parseFloat(transactionFee.toFixed(10))} ${tokenSymbol}`}
              </Text>
              <Text style={styles.priceUsd}>{`(${transactionFeeInUSD})`}</Text>
            </View>
          }
        />
        <SendInfoItem
          label={t(STRINGS.maxTotal)}
          value={transactionFeeInUSD}
          style={{ marginTop: SIZES.simpleMargin }}
          labelStyle={FONTS.t16r}
        />
      </ScrollView>

      <CustomButton
        width="100%"
        height={48}
        label={t(STRINGS.confirm)}
        styles={{ marginTop: 24 }}
        onPress={handleSendNft}
      />

      <ErrorModal
        isVisible={isVisibleErrModal}
        onClose={() => {
          setIsVisibleErrModal(false);
        }}
      />

      <Modal
        visible={isLoading}
        statusBarTranslucent
        backdropOpacity={0.6}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropColor={COLOR.black}
        deviceHeight={SIZES.heightScreen}
        transparent>
        <Loading
          imageSource={ICONS.walletCoin}
          title={t(STRINGS.processing_transaction)}
          supTitle={t(STRINGS.this_shouldn_take_long)}
          style={{ backgroundColor: COLOR.blackOpacity07 }}
        />
      </Modal>
    </Container>
  );
};

const SendInfoItem = ({
  label,
  value,
  style,
  labelStyle,
  valueStyle,
  ...otherProps
}) => {
  return (
    <View style={[styles.item, style]} {...otherProps}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
};

SendInfoItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
  style: PropTypes.object,
  labelStyle: PropTypes.object,
  valueStyle: PropTypes.object,
};

ConfirmSendNftScreen.propTypes = {};

ConfirmSendNftScreen.defaultProps = {};

const styles = StyleSheet.create({
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
});

export default ConfirmSendNftScreen;
