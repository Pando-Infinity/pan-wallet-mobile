import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  IMAGES,
  COLOR,
  FONTS,
  STRINGS,
  SCREEN_NAME,
  TOKEN_NAME,
  CONSTANTS,
} from 'constants';
import { useTranslation } from 'react-i18next';
import { CustomImage, HeaderLabel } from 'components/common';
import { formatId } from 'utils/format.util';
import { EthereumService } from 'service/EthereumService';
import Config from 'react-native-config';
import ErrorModalView from 'components/modals/errorModal';
import { getOwnerOfNft } from 'service/SolanaService';
import { storage } from 'databases/index';
import Constants from '../../constants/constants';
import { handleRemoveNFT } from 'walletCore/NftHelper/handleRemoveNFT';

const Web3 = require('web3');
const web3ETH = new Web3(Config.ETH_END_POINT);
const web3BSC = new Web3(Config.BSC_END_POINT);

const NftDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const walletID = storage.getNumber(Constants.rememberWalletIDKey) ?? 1;
  const walletFirstChain = storage.getString(CONSTANTS.firstChainTypeKey);
  const walletChain = useRef(
    storage.getString(Constants.rememberWalletChainKey) ?? walletFirstChain,
  );

  const [isVisibleModal, setVisibleModal] = useState(false);

  const {
    token_id: tokenId,
    name: tokenName,
    image: tokenImage,
    description,
    network,
    owner,
    contract,
  } = route.params;
  const handleNavigateToSendNftScreen = () => {
    navigation.navigate(SCREEN_NAME.sendNft, { item: route.params });
  };

  const checkNftOwnerShip = async () => {
    switch (network) {
      case TOKEN_NAME.ethereum: {
        const ownerOf = await EthereumService.getOwnerOfNFTWeb3(
          web3ETH,
          contract,
          tokenId,
        );
        if (ownerOf !== owner) {
          setVisibleModal(true);
        }
        break;
      }
      case TOKEN_NAME.smartChain: {
        const ownerOf = await EthereumService.getOwnerOfNFTWeb3(
          web3BSC,
          contract,
          tokenId,
        );
        if (ownerOf !== owner) {
          setVisibleModal(true);
        }
        break;
      }
      case TOKEN_NAME.solana: {
        const ownerOf = await getOwnerOfNft(contract);
        if (ownerOf !== owner) {
          setVisibleModal(true);
        }
        break;
      }
    }
  };

  const removeNftNotOwnerShip = async () => {
    await handleRemoveNFT(
      walletID,
      walletChain.current,
      network,
      contract,
      tokenId,
    );
  };

  useEffect(() => {
    checkNftOwnerShip().done();
  }, [t]);

  return (
    <ImageBackground
      source={IMAGES.homeBackGround}
      style={styles.backgroundImage}
      resizeMode="cover">
      <HeaderLabel onBack={() => navigation.goBack()} label={tokenName} />

      <ScrollView>
        <CustomImage imageUrl={tokenImage} style={styles.banner} />
        {network !== TOKEN_NAME.solana && (
          <Text style={[styles.subText]}>{formatId(tokenId)}</Text>
        )}
        <Text style={styles.name}>{tokenName}</Text>
        {Boolean(description) && (
          <Text style={[styles.subText, { marginBottom: 44 }]}>
            {description}
          </Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleNavigateToSendNftScreen}>
          <Text style={styles.buttonLabel}>{t(STRINGS.send)}</Text>
        </TouchableOpacity>
      </ScrollView>
      <ErrorModalView
        isVisible={isVisibleModal}
        title={t(STRINGS.nft_no_longer)}
        message={t(STRINGS.will_remove_nft)}
        buttonLabel={t(STRINGS.ok)}
        onClose={() => {
          setVisibleModal(false);
          removeNftNotOwnerShip().then(() => navigation.goBack());
        }}
      />
    </ImageBackground>
  );
};

NftDetail.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      item: PropTypes.shape({
        image: PropTypes.string,
        name: PropTypes.string,
        token_id: PropTypes.string,
        description: PropTypes.string,
      }),
    }),
  }),
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  banner: {
    width: '100%',
    height: 'auto',
    minHeight: 400,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 12,
  },
  subText: {
    color: COLOR.textSecondary,
    ...FONTS.t14r,
  },
  name: {
    color: COLOR.white,
    ...FONTS.t30r,
    marginTop: 4,
    marginBottom: 8,
  },
  button: {
    width: 163,
    height: 48,
    backgroundColor: COLOR.stateDefault,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  buttonLabel: {
    color: COLOR.gray10,
    ...FONTS.t16b,
  },
});

export default NftDetail;
