import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HeaderLabel } from 'components/common';
import { ImageBackground, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import NftInfo from '../components/NftInfo';
import TransactionFee from './TransactionFee';
import TotalPrice from './TotalPrice';
import RecipientAddress from './RecipientAddress';
import CustomButton from 'components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import {
  STRINGS,
  SCREEN_NAME,
  IMAGES,
  SIZES,
  TOKEN_SYMBOL,
  TOKEN_NAME,
  TOKEN_TYPE,
} from 'constants';
import { getCoinBalance } from 'walletCore/balance';
import {
  getTransactionFeeByType,
  getGasOptionByNetwork,
  getGasStatusLabel,
} from 'utils/gas.util';
import { formatCurrency, formatId } from 'utils/format.util';
import { chain } from 'models/Coins';
import { isValidWalletAddressByNetwork } from 'utils/wallet.util';
import { getCoinInfoOnMarket } from 'utils/infoToken';
import { useSelector } from 'react-redux';
import stringFormat from 'components/StringFormat/StringFormat';

const SendNftScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const {
    token_id: tokenId,
    name: tokenName,
    image: tokenImage,
    owner: ownerAddress,
    network: networkName,
    contract: contractAddress,
  } = route.params.item;

  const [recipientAddress, setRecipientAddress] = useState('');
  const [coinBalance, setCoinBalance] = useState(0);
  const [selectedGasFeeIndex, setSelectedGasFeeIndex] = useState(0);
  const [gasFee, setGasFee] = useState(0);
  const [isInvalidAddress, setIsInvalidAddress] = useState(false);
  const [inSufficientBalance, setInSufficientBalance] = useState(false);
  const [priceCoin, setPriceCoin] = useState(0);

  const fiatCurrency = useSelector(state => state.fiatCurrency.fiat);

  const gasOptions = useMemo(
    () => getGasOptionByNetwork(networkName),
    [networkName],
  );

  const tokenSymbol = useMemo(
    () => handleGetTokenSymbol(networkName),
    [networkName],
  );

  const networkSymbol = useMemo(
    () => handleGetNetworkSymbol(networkName),
    [networkName],
  );

  const tokenDecimals = useMemo(() => {
    return handleGetTokenDecimal(networkName, chain);
  }, [networkName]);

  const transactionFee = useMemo(
    () => gasFee.transactionFee / 10 ** tokenDecimals,
    [gasFee.transactionFee, tokenDecimals],
  );

  const transactionFeeInUSD = useMemo(
    () => formatCurrency(transactionFee * priceCoin, fiatCurrency, 5),
    [transactionFee, tokenDecimals, priceCoin, fiatCurrency],
  );

  const gasFeeStatusLabel = useMemo(() => {
    return getGasStatusLabel(t, gasOptions[selectedGasFeeIndex].stt);
  }, [gasOptions, selectedGasFeeIndex, t]);

  const isDisableSendButton = useMemo(() => {
    return (
      recipientAddress.length <= 0 || isInvalidAddress || inSufficientBalance
    );
  }, [recipientAddress, isInvalidAddress, inSufficientBalance]);

  const isSolanaNetwork = useMemo(
    () => networkName === TOKEN_NAME.solana,
    [networkName],
  );

  const handleNavigateToConfirmSendNft = () => {
    navigation.navigate(SCREEN_NAME.confirmSendNft, {
      tokenId,
      tokenImage,
      tokenName,
      tokenSymbol,
      contractAddress,
      recipientAddress,
      ownerAddress,
      transactionFee,
      transactionFeeInUSD,
      gasFee,
      networkName,
      isSolanaNetwork,
      networkSymbol,
    });
  };

  const handleChangeGasFee = newValue => {
    setSelectedGasFeeIndex(newValue[0]);
  };

  const getWalletBalance = useCallback(async () => {
    const balance = await getCoinBalance(ownerAddress, networkSymbol);

    setCoinBalance(balance);
  }, [ownerAddress, networkSymbol]);

  const handleGetGasFee = useCallback(async () => {
    const fee = await getTransactionFeeByType(
      networkName,
      gasOptions[selectedGasFeeIndex],
    );
    setGasFee(fee ?? 0);
  }, [gasOptions, networkName, selectedGasFeeIndex]);

  const handleSetMediumGas = useCallback(() => {
    const index = gasOptions.findIndex(item => item.stt === 'Medium');

    setSelectedGasFeeIndex(index ?? 0);
  }, [gasOptions]);

  useEffect(() => {
    getCoinInfoOnMarket(tokenSymbol, fiatCurrency, tokenName).then(info => {
      setPriceCoin(info?.[0]?.current_price || 0);
    });
  }, [tokenName, tokenSymbol, fiatCurrency]);

  useEffect(() => {
    getWalletBalance();
  }, [getWalletBalance]);

  useEffect(() => {
    handleSetMediumGas();
  }, [handleSetMediumGas]);

  useEffect(() => {
    handleGetGasFee();
  }, [handleGetGasFee]);

  useEffect(() => {
    if (recipientAddress.length === 0) {
      setIsInvalidAddress(false);
    } else {
      const isValid = isValidWalletAddressByNetwork(
        recipientAddress,
        networkName,
      );
      setIsInvalidAddress(!isValid);
    }
  }, [recipientAddress, networkName]);

  useEffect(() => {
    setInSufficientBalance(gasFee.transactionFee > coinBalance);
  }, [coinBalance, gasFee]);

  return (
    <ImageBackground
      source={IMAGES.homeBackGround}
      style={{
        marginBottom: Platform.OS === 'ios' ? 50 : 25,
        paddingTop: 50,
        flex: 1,
        alignItems: 'center',
      }}
      resizeMode="cover">
      <HeaderLabel
        onBack={() => navigation.goBack()}
        label={stringFormat(t(STRINGS.send_symbol), [`${tokenName}` || ``])}
        styleHeader={{ marginHorizontal: 16 }}
      />

      <ScrollView
        style={{ marginTop: 12, width: '100%', flex: 1 }}
        keyboardShouldPersistTaps="handled">
        <NftInfo
          imageSrc={tokenImage}
          nftId={isSolanaNetwork ? null : formatId(tokenId)}
          symbol={tokenSymbol}
        />
        <RecipientAddress
          isInvalid={isInvalidAddress}
          recipientAddress={recipientAddress}
          setRecipientAddress={setRecipientAddress}
          style={{ paddingHorizontal: 16, marginTop: 40 }}
        />
        <TransactionFee
          style={{ marginVertical: 24 }}
          values={[selectedGasFeeIndex]}
          isHiddenSlider={networkName === TOKEN_NAME.solana}
          max={gasOptions.length - 1}
          gasStatusLabel={gasFeeStatusLabel}
          onValuesChange={handleChangeGasFee}
          gasFee={`${parseFloat(
            transactionFee.toFixed(10),
          )} ${tokenSymbol.toUpperCase()}`}
          gasFeeUsd={transactionFeeInUSD}
          networkSymbol={String(networkSymbol).toUpperCase()}
        />
        <TotalPrice
          style={{ paddingHorizontal: 16 }}
          price={transactionFeeInUSD}
          isInvalid={inSufficientBalance}
        />
      </ScrollView>

      <CustomButton
        isDisable={isDisableSendButton}
        width={SIZES.width - 32}
        height={48}
        label={t(STRINGS.send)}
        styles={{ marginTop: 24 }}
        onPress={handleNavigateToConfirmSendNft}
      />
    </ImageBackground>
  );
};

const handleGetTokenSymbol = tokenName => {
  switch (tokenName) {
    case TOKEN_NAME.ethereum:
      return TOKEN_SYMBOL.eth;
    case TOKEN_NAME.smartChain:
      return TOKEN_SYMBOL.bnb;
    case TOKEN_NAME.solana:
      return TOKEN_SYMBOL.sol;
    default:
      return '';
  }
};

const handleGetNetworkSymbol = tokenName => {
  switch (tokenName) {
    case TOKEN_NAME.ethereum:
      return TOKEN_SYMBOL.eth;
    case TOKEN_NAME.smartChain:
      return TOKEN_SYMBOL.bsc;
    case TOKEN_NAME.solana:
      return TOKEN_SYMBOL.sol;
    default:
      return '';
  }
};

const handleGetTokenDecimal = (type, chainArr = []) => {
  let currentChain;

  switch (type) {
    case TOKEN_NAME.ethereum:
      currentChain = chainArr.find(item => item.chainType === TOKEN_TYPE.ERC20);
      break;
    case TOKEN_NAME.smartChain:
      currentChain = chainArr.find(item => item.chainType === TOKEN_TYPE.BEP20);
      break;
    case TOKEN_NAME.solana:
      currentChain = chainArr.find(item => item.chainType === TOKEN_TYPE.SPL);
      break;
    default:
      break;
  }

  return currentChain?.decimals;
};

export default SendNftScreen;
