import React, { createRef } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  COLOR,
  FONTS,
  ICONS,
  IMAGES,
  SCREEN_NAME,
  SIZES,
  STRINGS,
  TOKEN_NAME,
  URLConst,
} from '../../constants';
import CustomBackButton from '../../components/CustomBackButton/CustomBackButton';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/CustomButton/CustomButton';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import { tokenListData } from 'models/TokenData';
import PropTypes from 'prop-types';

const ImportWalletScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const bs = createRef();
  const fall = new Animated.Value(1);

  const renderHeader = () => (
    <View style={styles.bottom_sheet_header}>
      <Text style={[FONTS.t16b, styles.text_header]}>
        {t(STRINGS.choose_wallet_chain)}
      </Text>

      <TouchableOpacity
        style={styles.button_close_bottom_sheet}
        onPress={() => bs.current.snapTo(1)}>
        <Image source={ICONS.clear2} />
      </TouchableOpacity>
    </View>
  );

  const navigationToImportWalletForOptions = item => {
    switch (item.name) {
      case TOKEN_NAME.multiChain: {
        navigation.navigate(
          SCREEN_NAME.importWalletMultiChainOrSignChainScreen,
          {
            tokenIcon: item.icon,
            tokenName: item.name,
            privateKeyLength: item.privateKeyLength,
            isMultiChain: true,
          },
        );
        break;
      }
      default: {
        navigation.navigate(
          SCREEN_NAME.importWalletMultiChainOrSignChainScreen,
          {
            tokenIcon: item.icon,
            tokenName: item.name,
            privateKeyLength: item.privateKeyLength,
            isMultiChain: false,
          },
        );
      }
    }
  };

  const renderItem = item => (
    <View>
      <View style={{ height: 1, backgroundColor: COLOR.gray5 }} />

      <TouchableOpacity
        style={styles.token}
        onPress={() => {
          navigationToImportWalletForOptions(item);
          bs.current.snapTo(1);
        }}>
        <Image source={item.icon} resizeMode={'contain'} />

        <Text style={[FONTS.t16r, styles.token_name]}>
          {item.name === TOKEN_NAME.multiChain
            ? t(STRINGS.multi_chain_wallet)
            : item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInner = () => (
    <View
      style={{
        height: '100%',
        backgroundColor: COLOR.simpleBackground,
      }}>
      <FlatList
        style={{ marginBottom: SIZES.navigationBarAndroidHeight }}
        showsVerticalScrollIndicator={false}
        data={tokenListData}
        renderItem={({ item }) => renderItem(item)}
      />
    </View>
  );

  return (
    <View style={{ height: SIZES.heightScreen, width: SIZES.widthScreen }}>
      <ImageBackground
        source={IMAGES.backgroundConfirmPassword}
        style={{ flex: 1 }}
        resizeMode="cover">
        <Animated.View
          style={[
            styles.container,
            { opacity: Animated.add(0.4, Animated.multiply(fall, 1.0)) },
          ]}>
          <View style={{ flex: 7 }}>
            <View style={styles.button_back}>
              <CustomBackButton onPress={() => navigation.goBack()} />
            </View>

            <Text style={[FONTS.t30b, styles.text_title]}>
              {t(STRINGS.import_your_wallet)}
            </Text>

            <Text style={[FONTS.t14r, styles.text_description]}>
              {t(STRINGS.import_your_wallet_description)}
            </Text>

            <View style={styles.image_container}>
              <Image
                source={IMAGES.importWallet}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.button}>
            <TouchableOpacity
              style={styles.button_import_from_extension}
              onPress={() => {
                navigation.push(SCREEN_NAME.guidanceScreen);
              }}>
              <Text
                style={[FONTS.t16b, styles.text_button_import_from_extension]}>
                {t(STRINGS.import_from_extension)}
              </Text>
            </TouchableOpacity>

            <View
              style={{
                marginTop: SIZES.widthScreen * 0.043,
                marginStart: SIZES.widthScreen * 0.043,
              }}>
              <CustomButton
                label={t(STRINGS.import_existing_wallet)}
                width={SIZES.width - SIZES.simpleMargin * 2}
                height={SIZES.heightScreen * 0.059}
                onPress={() => bs.current.snapTo(0)}
              />
            </View>

            <View
              style={{
                width: '100%',
                alignItems: 'center',
              }}>
              <Text style={[styles.text_button_terms_condition, FONTS.t12r]}>
                {t(STRINGS.by_proceeding_you_agree_to_these)}
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(URLConst.terms_and_conditions).catch()
                  }>
                  <Text
                    style={[
                      FONTS.t12b,
                      { color: COLOR.shade3, transform: [{ translateY: 3 }] },
                    ]}>
                    {t(STRINGS.terms_and_conditions)}
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </Animated.View>

        <BottomSheet
          ref={bs}
          snapPoints={[SIZES.heightScreen * 0.6, 0]}
          initialSnap={1}
          callbackNode={fall}
          enabledGestureInteraction={true}
          renderHeader={renderHeader}
          renderContent={renderInner}
        />
      </ImageBackground>
    </View>
  );
};

ImportWalletScreen.propTypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  button_back: {
    alignItems: 'flex-start',
    marginTop: SIZES.heightScreen * 0.069,
    marginStart: SIZES.widthScreen * 0.043,
    marginEnd: SIZES.widthScreen * 0.043,
  },

  text_title: {
    color: COLOR.white,
    letterSpacing: -0.03,
    marginTop: SIZES.heightScreen * 0.032,
    marginStart: SIZES.widthScreen * 0.043,
    marginEnd: SIZES.widthScreen * 0.043,
  },

  text_description: {
    color: COLOR.textSecondary,
    marginTop: SIZES.heightScreen * 0.015,
    marginStart: SIZES.widthScreen * 0.043,
    marginEnd: SIZES.widthScreen * 0.043,
  },

  image_container: {
    marginTop: SIZES.heightScreen * 0.054,
    alignItems: 'flex-end',
  },

  image: {
    width: SIZES.widthScreen * 0.792,
    height: SIZES.heightScreen * 0.337,
  },

  button: {
    flex: 3,
    justifyContent: 'center',
  },

  button_import_from_extension: {
    backgroundColor: COLOR.stateDefault,
    height: SIZES.heightScreen * 0.059,
    justifyContent: 'center',
    borderRadius: SIZES.simpleSpace,
    marginStart: SIZES.widthScreen * 0.043,
    marginEnd: SIZES.widthScreen * 0.043,
  },

  text_button_import_from_extension: {
    color: COLOR.gray10,
    textAlign: 'center',
    marginStart: SIZES.widthScreen * 0.043,
    marginEnd: SIZES.widthScreen * 0.043,
  },

  text_button_terms_condition: {
    color: COLOR.textTermsCondition,
    marginTop: SIZES.heightScreen * 0.037,
    marginBottom: 40,
  },

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
    marginStart: SIZES.simpleMargin,
    flexDirection: 'row',
    alignItems: 'center',
  },

  token_name: {
    color: COLOR.white,
    marginStart: 12,
  },
});

export default ImportWalletScreen;
