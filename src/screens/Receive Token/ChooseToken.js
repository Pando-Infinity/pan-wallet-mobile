import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Keyboard,
  FlatList,
} from 'react-native';
import {
  FONTS,
  SIZES,
  STRINGS,
  SCREEN_NAME,
  COLOR,
  IMAGES,
  ICONS,
} from '../../constants';
import { useTranslation } from 'react-i18next';
import { RenderSearchBar } from '../../components/searchBar/SearchBar';
import { AvatarView } from 'components/CustionView/AvatarView';
import { useNavigation, useRoute } from '@react-navigation/native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

const ChooseToken = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const dataParams = route.params.data;

  const [query, setQuery] = useState('');
  const [masterData, setMasterData] = useState([]);
  const [data, setData] = useState([]);
  const [isFocus, setFocus] = useState(false);

  const setupData = useCallback(() => {
    setData(dataParams);
    setMasterData(dataParams);
  }, [dataParams]);

  useEffect(() => {
    setupData();
  }, [setupData]);

  const renderItem = item => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigation.navigate(SCREEN_NAME.receiveTokenDetail, {
            name: item.name,
            symbol: item.asset_id,
            image: item.image,
            address: item.address,
          })
        }>
        <View style={styles.itemLeft}>
          <AvatarView size={SIZES.iconWidth} image={item.image} />
          <View style={{ justifyContent: 'space-evenly' }}>
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
        </View>
        <View style={styles.itemRight}>
          <Text style={{ ...FONTS.t14b, color: COLOR.white }}>
            {item.balance} {item.asset_id === 'BSC' ? 'BNB' : item.asset_id}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleSearchBar = text => {
    if (text) {
      const newData = masterData.filter(item => {
        const nameData = item.name ? item.name.toLowerCase() : ''.toLowerCase();
        const assetIDData = item.asset_id
          ? item.asset_id.toLowerCase()
          : ''.toLowerCase();
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

  const createSearchBar = () => (
    <RenderSearchBar
      t={t}
      onFocus={() => setFocus(true)}
      isFocus={isFocus}
      onBlur={() => setFocus(false)}
      query={query}
      onChangeText={text => handleSearchBar(text)}
      clearButtonOnPress={() => {
        setQuery('');
        handleSearchBar('');
      }}
      cancelButtonOnPress={() => {
        setFocus(false);
        handleSearchBar('');
        Keyboard.dismiss();
      }}
    />
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1, paddingHorizontal: 16 }}
        resizeMode="cover">
        <View style={styles.header}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={ICONS.backButton} resizeMode="cover" />
            </TouchableOpacity>
            <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
              {t(STRINGS.choose_token_to_receive)}
            </Text>
            <Text />
          </View>
        </View>
        <View style={styles.body}>
          {createSearchBar()}
          <FlatList
            data={data}
            renderItem={({ item, index }) => renderItem(item, index)}
          />
        </View>
      </ImageBackground>
    </View>
  );
};
export default ChooseToken;
