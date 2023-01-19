import React, { useEffect } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import {
  COLOR,
  FONTS,
  ICONS,
  IMAGES,
  SIZES,
  STRINGS,
  SCREEN_NAME,
  TIME_OUT,
  NATIVE_ASYNC_STORAGE,
  DATA_TYPE,
  URLConst,
} from '../constants';
import { useTranslation } from 'react-i18next';
import CustomButton from '../components/CustomButton/CustomButton';
import { DAORepository, NativeAsyncStorage, storage } from '../databases';
import Constants from '../constants/constants';
import {
  tokenListMultiChainDefault,
  tokenListBTCChainDefault,
  tokenListETHChainDefault,
  tokenListBSCChainDefault,
  tokenListSOLChainDefault,
} from 'models/TokenData';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useRoute } from '@react-navigation/native';

const WalletReadyScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const route = useRoute();

  const descriptionLabel = useMemo(() => {
    if (route.params?.previousScreen === SCREEN_NAME.guidanceScreen) {
      return STRINGS.create_new_wallet_success_description_from_extension;
    } else {
      return STRINGS.create_new_wallet_success_description_from_wallet;
    }
  }, [route.params?.previousScreen]);

  const openURL = () => {
    const url = URLConst.submit_your_request;
    Linking.openURL(url).catch();
  };

  const didOpenHomeScreen = () => {
    storage.set(Constants.didOpenHomeScreenKey, true);
  };

  useEffect(() => {
    didOpenHomeScreen();
    getAllWallet();
  });

  useEffect(() => {
    NativeAsyncStorage.getData(
      NATIVE_ASYNC_STORAGE.firstSetTimeOut,
      DATA_TYPE.string,
      data => {
        if (data !== 'true') {
          NativeAsyncStorage.saveData(
            NATIVE_ASYNC_STORAGE.firstSetTimeOut,
            'true',
          );

          storage.set(TIME_OUT.timeOut, TIME_OUT.after_15_sec);
        }
      },
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.backgroundConfirmPassword}
        style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Text style={[FONTS.h4, styles.title]}>
            {t(STRINGS.your_wallet_is_ready)}
          </Text>

          <Text style={[FONTS.t14r, styles.text_description]}>
            {t(descriptionLabel)}
          </Text>

          <View style={styles.container_stars}>
            <Image
              source={ICONS.stars}
              style={{ height: SIZES.height * 0.31, resizeMode: 'contain' }}
            />
          </View>

          <View style={{ flex: 1 }} />

          <Text
            style={[
              FONTS.t14r,
              { color: COLOR.textTermsCondition, paddingBottom: 4 },
            ]}>
            {t(STRINGS.more_request)}
            <TouchableOpacity onPress={() => openURL()}>
              <Text
                style={[
                  FONTS.t14r,
                  { color: COLOR.shade3, transform: [{ translateY: 4 }] },
                ]}>
                {t(STRINGS.here)}
              </Text>
            </TouchableOpacity>
          </Text>
        </ScrollView>
        <View style={styles.container_button}>
          <CustomButton
            label={t(STRINGS.explore_pan_wallet)}
            width={SIZES.width - SIZES.simpleMargin * 2}
            height={SIZES.buttonHeight}
            icon={ICONS.arrowRight}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: SCREEN_NAME.navigationBottomTab }],
              })
            }
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const getAllWallet = () => {
  setTimeout(() => {
    DAORepository.getAllWallet().then(wallet => {
      storage.set(Constants.firstChainTypeKey, wallet[0].chain);
      storage.set(Constants.firstWalletNameKey, wallet[0].name);

      //save listToken Default
      storage.set(
        Constants.tokenListMultiChainDefault,
        JSON.stringify(tokenListMultiChainDefault),
      );
      storage.set(
        Constants.tokenListBTCChainDefault,
        JSON.stringify(tokenListBTCChainDefault),
      );
      storage.set(
        Constants.tokenListETHChainDefault,
        JSON.stringify(tokenListETHChainDefault),
      );
      storage.set(
        Constants.tokenListBSCChainDefault,
        JSON.stringify(tokenListBSCChainDefault),
      );
      storage.set(
        Constants.tokenListSOLChainDefault,
        JSON.stringify(tokenListSOLChainDefault),
      );
    });
  }, 100);
};

WalletReadyScreen.propTypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingStart: SIZES.simpleMargin,
    paddingEnd: SIZES.simpleMargin,
  },

  container_button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    marginBottom: 45,
  },

  title: {
    marginTop: 84,
    letterSpacing: 0.0025,
    color: COLOR.white,
  },

  text_description: {
    marginTop: 12,
    color: COLOR.textSecondary,
  },

  container_stars: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 76,
    marginBottom: 64,
  },
});

export default WalletReadyScreen;
