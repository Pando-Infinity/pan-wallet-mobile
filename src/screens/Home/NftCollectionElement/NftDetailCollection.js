import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FlatList, StyleSheet } from 'react-native';
import NftItem from './NftItem';
import { FONTS, TOKEN_NAME, SCREEN_NAME } from 'constants';
import Constants from 'constants/constants';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { formatId } from 'utils/format.util';
import storage from 'databases/AsyncStorage';
import { useTranslation } from 'react-i18next';
import { getAllNFTsFromOwner } from 'api/GetNFTsFromImport';
import { getDataNftHome } from 'walletCore/getDataNftHome';

const NftDetailCollection = ({
  data,
  setData,
  networkName,
  contractAddress,
  setIsVisibleLoadingModal,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isFocus = useIsFocused();

  const walletFirstChain = storage.getString(Constants.firstChainTypeKey);

  const walletID = storage.getNumber(Constants.rememberWalletIDKey) ?? 1;
  const walletChain =
    storage.getString(Constants.rememberWalletChainKey) ?? walletFirstChain;

  const cursor = storage.getString(
    `${Constants.cursor}${walletID}${contractAddress}`,
  );

  const handlePressItem = item => {
    navigation.navigate(SCREEN_NAME.nftDetail, item);
  };

  const setNFTFromHome = async () => {
    const newData = await getDataNftHome(walletID, walletChain);
    setData(newData);
  };

  const handleGetAdditionalNfts = async () => {
    if (cursor) {
      setIsVisibleLoadingModal(true);

      const ETHAddress = storage.getString(Constants.addressOfETHKey);
      const BSCAddress = storage.getString(Constants.addressOfBSCKey);
      const SOLAddress = storage.getString(Constants.addressOfSOLKey);

      let ownerAddress = '';

      switch (networkName) {
        case TOKEN_NAME.ethereum:
          ownerAddress = ETHAddress;
          break;
        case TOKEN_NAME.smartChain:
          ownerAddress = BSCAddress;
          break;
        case TOKEN_NAME.solana:
          ownerAddress = SOLAddress;
          break;
      }

      await getAllNFTsFromOwner(
        ownerAddress,
        contractAddress,
        null,
        walletChain,
        walletID,
        networkName,
        t,
      );

      await setNFTFromHome();
      setIsVisibleLoadingModal(false);
    }
  };

  useEffect(() => {
    if (isFocus) {
      setNFTFromHome().done();
    }
  }, [isFocus]);

  return (
    <FlatList
      numColumns={2}
      data={data}
      renderItem={({ item }) => (
        <NftItem
          name={item.name}
          image={item.image}
          description={item.description}
          value={
            data.network === TOKEN_NAME.solana ? null : formatId(item.token_id)
          }
          style={styles.item}
          valueProps={{ style: styles.value }}
          onPress={() => handlePressItem(item)}
        />
      )}
      keyExtractor={(_, index) => index}
      contentContainerStyle={styles.container}
      onEndReached={handleGetAdditionalNfts}
    />
  );
};

NftDetailCollection.propTypes = {
  data: PropTypes.array,
  setData: PropTypes.func,
  networkName: PropTypes.string,
  setIsVisibleLoadingModal: PropTypes.func,
  contractAddress: PropTypes.string,
};

NftDetailCollection.defaultProps = {
  data: [],
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  item: {
    flex: 0.5,
    margin: 8,
  },
  value: {
    ...FONTS.t11r,
  },
});

export default NftDetailCollection;
