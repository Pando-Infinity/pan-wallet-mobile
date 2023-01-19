import { useIsFocused, useNavigation } from '@react-navigation/native';
import { SIZES, ICONS, COLOR, FONTS, SCREEN_NAME, STRINGS } from 'constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import EmptyNft from './EmptyNft';
import NftContractItem from './NftContractItem';
import { getDataNftHome } from 'walletCore/getDataNftHome';
import Constants from 'constants/constants';
import storage from 'databases/AsyncStorage';
import { useTranslation } from 'react-i18next';

const NftCollection = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const walletFirstChain = storage.getString(Constants.firstChainTypeKey);

  const walletID = useRef(
    storage.getNumber(Constants.rememberWalletIDKey) !== undefined
      ? storage.getNumber(Constants.rememberWalletIDKey)
      : 1,
  );
  const walletChain = useRef(
    storage.getString(Constants.rememberWalletChainKey) !== undefined
      ? storage.getString(Constants.rememberWalletChainKey)
      : walletFirstChain,
  );

  const [nftData, setNftData] = useState([]);

  const handleNavigateToDetail = item => {
    navigation.navigate(SCREEN_NAME.nftCollectionElement, {
      name: item.token_tracker,
      networkName: item.network,
      contractAddress: item.contract,
    });
  };

  const handleGetNftData = useCallback(async () => {
    const nfts = await getDataNftHome(walletID.current, walletChain.current);
    const listContracts = JSON.parse(
      storage.getString(`${Constants.listContractAdded}${walletID.current}`),
    );
    const data = [];

    (listContracts || []).forEach(contract => {
      const firstNfts = nfts.filter(item => item.contract === contract);
      data.push({ ...firstNfts[0], quantity: firstNfts.length });
    });

    setNftData(data);
  }, []);

  useEffect(() => {
    if (isFocused) {
      handleGetNftData();
    }
  }, [handleGetNftData, isFocused]);

  return nftData.length ? (
    <ScrollView
      scrollEnabled={false}
      contentContainerStyle={styles.container}
      style={styles.wrapper}>
      <>
        <ImportNftButton style={styles.item} />
        {nftData.map((item, index) => (
          <NftContractItem
            key={index}
            name={item.token_tracker}
            image={item.image}
            networkName={item.network}
            quantity={item.quantity}
            style={styles.item}
            onPress={() => handleNavigateToDetail(item)}
          />
        ))}
      </>
    </ScrollView>
  ) : (
    <EmptyNft style={{ marginBottom: SIZES.height * 0.1, flex: 1 }} />
  );
};

const ImportNftButton = ({ style, ...otherProps }) => {
  const navigation = useNavigation();
  const { t: getLabel } = useTranslation();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.buttonWrapper, style]}
      onPress={() => navigation.navigate(SCREEN_NAME.importNFTs)}
      {...otherProps}>
      <Image source={ICONS.plus} style={styles.buttonImage} />
      <Text style={styles.buttonLabel}>{getLabel(STRINGS.importNFTs)}</Text>
    </TouchableOpacity>
  );
};

ImportNftButton.propTypes = {
  style: PropTypes.object,
};

NftCollection.propTypes = {};

const SPACING_HORIZONTAL = 16;
const ITEM_WIDTH = (SIZES.width - SPACING_HORIZONTAL * 3) / 2;

const styles = StyleSheet.create({
  item: {
    width: ITEM_WIDTH,
    margin: 8,
  },
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingVertical: 12,
  },
  wrapper: {
    marginBottom: SIZES.height * 0.1,
    paddingHorizontal: 8,
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLOR.gray5,
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  buttonImage: {
    height: 64,
    width: 64,
  },
  buttonLabel: {
    color: COLOR.gray10,
    ...FONTS.t14b,
    fontWeight: '700',
    marginTop: 8,
  },
});

export default NftCollection;
