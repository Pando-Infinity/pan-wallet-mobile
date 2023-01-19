import React, { useCallback, useEffect, useState } from 'react';
import {
  ImageBackground,
  Keyboard,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Constants from 'constants/constants';
import NftDetailCollection from './NftDetailCollection';
import { IMAGES, STRINGS, ICONS, COLOR, SIZES } from 'constants';
import { HeaderLabel } from 'components/common';
import { RenderSearchBar } from 'components/searchBar/SearchBar';
import { useTranslation } from 'react-i18next';
import storage from 'databases/AsyncStorage';
import { getDataNftHome } from 'walletCore/getDataNftHome';
import Loading from 'components/Loading/Loading';

const NftCollectionElement = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const isFocusSC = useIsFocused();

  const walletFirstChain = storage.getString(Constants.firstChainTypeKey);

  const walletID = storage.getNumber(Constants.rememberWalletIDKey) ?? 1;

  const walletChain =
    storage.getString(Constants.rememberWalletChainKey) ?? walletFirstChain;

  //hook
  const [query, setQuery] = useState('');
  const [masterData, setMasterData] = useState([]);
  const [data, setData] = useState([]);
  const [isFocus, setFocus] = useState(false);
  const [isVisibleLoadingModal, setIsVisibleLoadingModal] = useState(false);

  const { name, networkName, contractAddress } = route.params;

  const handleGetNftData = useCallback(async () => {
    const nfts = await getDataNftHome(walletID, walletChain);
    const filteredNfts = nfts.filter(item => item.contract === contractAddress);

    setData(filteredNfts);
    setMasterData(filteredNfts);
  }, [walletID, walletChain, contractAddress]);

  const handleSearch = text => {
    if (text) {
      const newData = masterData.filter(item => {
        const nameData = item.name ? item.name.toLowerCase() : '';
        const assetIDData = item.token_id ? item.token_id.toLowerCase() : '';
        const textData = text.toLowerCase();

        return (
          nameData.indexOf(textData) > -1 || assetIDData.indexOf(textData) > -1
        );
      });
      setData(newData);
      setQuery(text);
    } else {
      setData(masterData);
      setQuery(text);
    }
  };

  const renderSearchBar = () => (
    <View style={{ marginHorizontal: 16 }}>
      <RenderSearchBar
        t={t}
        onFocus={() => setFocus(true)}
        isFocus={isFocus}
        onBlur={() => setFocus(false)}
        query={query}
        onChangeText={text => handleSearch(text)}
        clearButtonOnPress={() => {
          setQuery('');
          handleSearch('');
        }}
        cancelButtonOnPress={() => {
          setFocus(false);
          handleSearch('');
          Keyboard.dismiss();
        }}
        defaultValue={t(STRINGS.searchNFT)}
        placeholder={t(STRINGS.enterNFTNameOrID)}
      />
    </View>
  );

  useEffect(() => {
    if (isFocusSC) {
      handleGetNftData();
    }
  }, [handleGetNftData, isFocusSC]);

  return (
    <ImageBackground
      source={IMAGES.homeBackGround}
      style={styles.backgroundImage}
      resizeMode="cover">
      <HeaderLabel
        onBack={() => navigation.goBack()}
        label={name}
        styleHeader={{ marginHorizontal: 16 }}
      />

      {renderSearchBar()}

      <NftDetailCollection
        data={data}
        setData={setData}
        networkName={networkName}
        contractAddress={contractAddress}
        setIsVisibleLoadingModal={setIsVisibleLoadingModal}
      />

      <Modal
        visible={isVisibleLoadingModal}
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    paddingTop: 40,
  },
});

export default NftCollectionElement;
