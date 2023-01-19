import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLOR, FONTS, ICONS, SCREEN_NAME, SIZES, STRINGS } from 'constants';
import { useTranslation } from 'react-i18next';
import BottomSheet from 'reanimated-bottom-sheet';

const AddWallet = (navigation, bs, fall) => {
  const { t } = useTranslation();

  const data = [
    {
      id: '0',
      title: t(STRINGS.create_new_wallet),
      supTile: t(STRINGS.generated_wallet_multi_chain),
    },
    {
      id: '1',
      title: t(STRINGS.import_your_existing),
      supTile: t(STRINGS.import_your_existing),
    },
  ];

  const renderHeader = () => (
    <View style={style.bottom_sheet_header}>
      <Text style={[FONTS.t16b, style.text_header]}>
        {t(STRINGS.addWallet)}
      </Text>

      <TouchableOpacity
        style={style.button_close_bottom_sheet}
        onPress={() => bs.current.snapTo(1)}>
        <Image source={ICONS.clear2} />
      </TouchableOpacity>
    </View>
  );

  const didTapItem = item => {
    switch (item.id) {
      case '0': {
        navigation.navigate(SCREEN_NAME.secureYourWalletScreen);
        break;
      }
      case '1': {
        navigation.navigate(SCREEN_NAME.importWalletScreen);
        break;
      }
    }
  };

  const renderItem = item => (
    <View style={{ flex: 1 }}>
      <View style={{ height: 1, backgroundColor: COLOR.gray5 }} />

      <TouchableOpacity
        style={style.token}
        onPress={() => {
          didTapItem(item);
          bs.current.snapTo(1);
        }}>
        <View
          style={{
            alignItems: 'flex-start',
            justifyContent: 'space-evenly',
          }}>
          <Text style={{ ...FONTS.t16r, color: COLOR.white }}>
            {item.title}
          </Text>
          <Text style={{ ...FONTS.t12r, color: COLOR.textSecondary }}>
            {item.supTile}
          </Text>
        </View>
        <Image
          source={ICONS.rightButton}
          style={{ height: 15, width: 7.5 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );

  const renderInner = () => (
    <View style={{ backgroundColor: COLOR.simpleBackground, height: '100%' }}>
      <FlatList data={data} renderItem={({ item }) => renderItem(item)} />
    </View>
  );

  return (
    <BottomSheet
      ref={bs}
      snapPoints={[220, 0]}
      initialSnap={1}
      callbackNode={fall}
      enabledHeaderGestureInteraction={true}
      enabledGestureInteraction={true}
      enabledContentGestureInteraction={true}
      renderHeader={renderHeader}
      renderContent={renderInner}
    />
  );
};
export default AddWallet;

const style = StyleSheet.create({
  bottom_sheet_header: {
    backgroundColor: COLOR.simpleBackground,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    position: 'relative',
  },

  text_header: {
    textAlign: 'center',
    color: COLOR.white,
    marginTop: SIZES.simpleMargin,
    marginBottom: 15,
  },

  button_close_bottom_sheet: {
    position: 'absolute',
    end: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginEnd: 20,
  },

  token: {
    marginTop: SIZES.simpleMargin,
    marginBottom: SIZES.simpleMargin,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 16,
  },

  token_name: {
    color: COLOR.white,
    marginStart: 12,
  },
});
