import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  Switch,
  Keyboard,
  Alert,
} from 'react-native';
import {
  FONTS,
  SIZES,
  STRINGS,
  SCREEN_NAME,
  COLOR,
  IMAGES,
  ICONS,
  TOKEN_NAME,
  CONSTANTS,
} from 'constants';
import { useTranslation } from 'react-i18next';
import {
  useRoute,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import { storage } from 'databases';
import { RenderSearchBar } from 'components/searchBar/SearchBar';
import { WalletConnector } from 'walletCore';
import { AvatarView } from 'components/CustionView/AvatarView';

const SelectToken = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [isFocus, setFocus] = useState(false);

  const isFocused = useIsFocused();

  const setupData = () => {
    switch (route.params.chain) {
      case TOKEN_NAME.multiChain: {
        setupDataForChain(
          CONSTANTS.multiChainDataKey,
          CONSTANTS.newDataMultiChain,
          CONSTANTS.tokenListMultiChainDefault,
          CONSTANTS.newTokenListMultiData,
        );
        break;
      }
      case TOKEN_NAME.bitcoin: {
        setupDataForChain(
          CONSTANTS.BTCChainDataKey,
          CONSTANTS.newDataBTCChain,
          CONSTANTS.tokenListBTCChainDefault,
          CONSTANTS.newTokenListBTCData,
        );
        break;
      }
      case TOKEN_NAME.ethereum: {
        setupDataForChain(
          CONSTANTS.ETHChainDataKey,
          CONSTANTS.newDataETHChain,
          CONSTANTS.tokenListETHChainDefault,
          CONSTANTS.newTokenListETHData,
        );
        break;
      }
      case TOKEN_NAME.smartChain: {
        setupDataForChain(
          CONSTANTS.BSCChainDataKey,
          CONSTANTS.newDataBSCChain,
          CONSTANTS.tokenListBSCChainDefault,
          CONSTANTS.newTokenListBSCData,
        );
        break;
      }
      case TOKEN_NAME.solana: {
        setupDataForChain(
          CONSTANTS.SOLChainDataKey,
          CONSTANTS.newDataSOLChain,
          CONSTANTS.tokenListSOLChainDefault,
          CONSTANTS.newTokenListSOLData,
        );
        break;
      }
    }
  };

  const setupDataForChain = (
    jsonHomeKey,
    newJsonHomeKey,
    jsonListTokenKey,
    newJsonListTokenKey,
  ) => {
    const jsonHomeData = storage.getString(`${jsonHomeKey}${route.params.id}`);
    const jsonNewData = storage.getString(
      `${newJsonHomeKey}${route.params.id}`,
    );
    if (jsonNewData === undefined) {
      const object = JSON.parse(jsonHomeData);
      storage.set(
        `${newJsonHomeKey}${route.params.id}`,
        JSON.stringify(object),
      );
    }
    const jonNewTokenList = storage.getString(
      `${newJsonListTokenKey}${route.params.id}`,
    );
    if (jonNewTokenList === undefined) {
      const jsonList = storage.getString(jsonListTokenKey);
      storage.set(
        `${newJsonListTokenKey}${route.params.id}`,
        JSON.stringify(JSON.parse(jsonList)),
      );
    }
  };

  const tokenListMultiChainDefault = storage.getString(
    CONSTANTS.tokenListMultiChainDefault,
  );
  const tokenListBTCChainDefault = storage.getString(
    CONSTANTS.tokenListBTCChainDefault,
  );
  const tokenListETHChainDefault = storage.getString(
    CONSTANTS.tokenListETHChainDefault,
  );
  const tokenListBSCChainDefault = storage.getString(
    CONSTANTS.tokenListBSCChainDefault,
  );
  const tokenListSOLChainDefault = storage.getString(
    CONSTANTS.tokenListSOLChainDefault,
  );

  const initData = id => {
    switch (route.params.chain) {
      case TOKEN_NAME.multiChain: {
        const json = storage.getString(
          `${CONSTANTS.newTokenListMultiData}${id}`,
        );
        if (json !== undefined) {
          const object = JSON.parse(json);
          setData(object);
        } else {
          setData(JSON.parse(tokenListMultiChainDefault));
        }
        break;
      }
      case TOKEN_NAME.bitcoin: {
        const json = storage.getString(`${CONSTANTS.newTokenListBTCData}${id}`);
        if (json !== undefined) {
          const object = JSON.parse(json);
          setData(object);
        } else {
          setData(JSON.parse(tokenListBTCChainDefault));
        }
        break;
      }
      case TOKEN_NAME.ethereum: {
        const json = storage.getString(`${CONSTANTS.newTokenListETHData}${id}`);
        if (json !== undefined) {
          const object = JSON.parse(json);
          setData(object);
        } else {
          setData(JSON.parse(tokenListETHChainDefault));
        }
        break;
      }
      case TOKEN_NAME.smartChain: {
        const json = storage.getString(`${CONSTANTS.newTokenListBSCData}${id}`);
        if (json !== undefined) {
          const object = JSON.parse(json);
          setData(object);
        } else {
          setData(JSON.parse(tokenListBSCChainDefault));
        }
        break;
      }
      case TOKEN_NAME.solana: {
        const json = storage.getString(`${CONSTANTS.newTokenListSOLData}${id}`);
        if (json !== undefined) {
          const object = JSON.parse(json);
          setData(object);
        } else {
          setData(JSON.parse(tokenListSOLChainDefault));
        }
        break;
      }
    }
  };

  const handleToggleShowTokenMethod = (assetID, name, key, status) => {
    const jsonHomeData = storage.getString(`${key}${route.params.id}`);
    const object = JSON.parse(jsonHomeData);
    const newObject = object.map(item => {
      if (
        item.asset_id.toLowerCase() === assetID.toLowerCase() &&
        item.name.toLowerCase() === name.toLowerCase()
      ) {
        return { ...item, isShow: status };
      }
      return item;
    });
    storage.set(`${key}${route.params.id}`, JSON.stringify(newObject));
  };

  const handleToggleShowToken = (assetID, name, status) => {
    let key;
    switch (route.params.chain) {
      case TOKEN_NAME.multiChain:
        key = CONSTANTS.newDataMultiChain;
        break;
      case TOKEN_NAME.bitcoin:
        key = CONSTANTS.newDataBTCChain;
        break;
      case TOKEN_NAME.ethereum:
        key = CONSTANTS.newDataETHChain;
        break;
      case TOKEN_NAME.smartChain:
        key = CONSTANTS.newDataBSCChain;
        break;
      case TOKEN_NAME.solana:
        key = CONSTANTS.newDataSOLChain;
        break;
    }
    if (key) {
      handleToggleShowTokenMethod(assetID, name, key, status);
    }
  };

  const saveSateSwitchTokenList = (id, newData) => {
    const currentData = newData ?? data;
    let key;
    switch (route.params.chain) {
      case TOKEN_NAME.multiChain:
        key = CONSTANTS.newTokenListMultiData;
        break;
      case TOKEN_NAME.bitcoin:
        key = CONSTANTS.newTokenListBTCData;
        break;
      case TOKEN_NAME.ethereum:
        key = CONSTANTS.newTokenListETHData;

        break;
      case TOKEN_NAME.smartChain:
        key = CONSTANTS.newTokenListBSCData;

        break;
      case TOKEN_NAME.solana:
        key = CONSTANTS.newTokenListSOLData;
        break;
    }
    if (key) {
      setData(currentData);
      storage.set(`${key}${id}`, JSON.stringify(currentData));
    }
  };

  const toggleSwitch = index => {
    const wallet = data[index];
    if (Boolean(wallet.isShow) === false) {
      wallet.isShow = true;
      handleToggleShowToken(wallet.asset_id, wallet.name, true);
    } else {
      wallet.isShow = false;
      handleToggleShowToken(wallet.asset_id, wallet.name, false);
    }
    const newData = data.map((item, idx) => {
      if (idx === index) {
        return wallet;
      }
      return item;
    });

    saveSateSwitchTokenList(route.params.id, newData);
  };

  const handleSearch = text => {
    if (text) {
      const newData = data.map(item => {
        const nameData = item.name ? item.name.toLowerCase() : '';
        const assetIDData = item.asset_id ? item.asset_id.toLowerCase() : '';
        const textData = text.toLowerCase();
        if (
          nameData.indexOf(textData) > -1 ||
          assetIDData.indexOf(textData) > -1
        ) {
          return { ...item, isHiddenList: false };
        }
        return { ...item, isHiddenList: true };
      });
      setData(newData);
      setQuery(text);
    } else {
      const newData = data.map(item => ({ ...item, isHiddenList: false }));
      setData(newData);
      setQuery(text);
    }
  };

  const renderSearchBar = () => {
    return (
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
      />
    );
  };

  const renderItem = (item, index) => {
    return (
      !item.isHiddenList && (
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <AvatarView image={item.image} size={SIZES.iconWidth} />
            <Text style={{ ...FONTS.t14b, color: COLOR.white, marginLeft: 8 }}>
              {item.name}
            </Text>
            <Text
              style={{
                ...FONTS.t14r,
                color: COLOR.textSecondary,
                marginLeft: 8,
              }}>
              {item.asset_id === 'BSC' ? 'BNB' : item.asset_id}
            </Text>
          </View>
          <View style={styles.itemRight}>
            <Switch
              trackColor={{
                false: COLOR.trackColorDisable,
                true: COLOR.trackColorEnable,
              }}
              thumbColor="white"
              ios_backgroundColor={COLOR.trackColorDisable}
              onChange={() => toggleSwitch(index)}
              value={Boolean(item.isShow)}
            />
          </View>
        </View>
      )
    );
  };

  const goToAddCustomToken = () => {
    if (route.params.chain === TOKEN_NAME.bitcoin) {
      return Alert.alert(t(STRINGS.error), t(STRINGS.BTC_dose_not_support), [
        {
          text: t(STRINGS.ok),
          style: 'cancel',
        },
      ]);
    } else {
      navigation.navigate(SCREEN_NAME.importCustomToken, {
        id: route.params.id,
        chain: route.params.chain,
      });
    }
  };

  const handleGoBack = () => {
    const newData = data.map(item => ({ ...item, isHiddenList: false }));
    saveSateSwitchTokenList(route.params.id, newData);
    navigation.goBack();
  };

  useEffect(() => {
    if (isFocused) {
      initData(route.params.id);
      setupData();
    }
  }, [isFocused]);

  useEffect(() => {
    if (data.length !== 0) {
      WalletConnector.updateSession(data);
    }
  }, [data]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1 }}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack}>
              <Image source={ICONS.backButton} resizeMode="cover" />
            </TouchableOpacity>
            <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
              {t(STRINGS.manage_token_list)}
            </Text>
            <TouchableOpacity onPress={() => goToAddCustomToken()}>
              <Image
                source={ICONS.plus}
                resizeMode="cover"
                style={{ height: 24, width: 24 }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.body}>
            {renderSearchBar()}
            <FlatList
              data={data}
              renderItem={({ item, index }) => renderItem(item, index)}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  body: {
    flex: 9,
    justifyContent: 'flex-start',
  },
  item: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLOR.neutralSurface2,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    marginVertical: 6,
  },
  itemLeft: {
    width: '80%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRight: {
    width: '20%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default SelectToken;
