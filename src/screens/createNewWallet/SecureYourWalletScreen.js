import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import {
  IMAGES,
  ICONS,
  APP_THEMES,
  SCREEN_NAME,
  STRINGS,
} from '../../constants';
const { FONTS, COLOR, SIZES } = APP_THEMES;
import BackButton from '../../components/CustomBackButton/CustomBackButton';
import CustomButton from '../../components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import StyledText from 'react-native-styled-text';

const SecureYourWalletScreen = ({ navigation }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <ImageBackground
        source={IMAGES.createPassWorkBackGround}
        style={{ flex: 1 }}
        resizeMode="cover">
        <BackButton
          style={{ marginTop: 50, left: 16 }}
          onPress={() => navigation.goBack()}
        />

        <Text style={styles.title}>{t(STRINGS.secureYourWalletTitle)}</Text>

        <View style={styles.imageContainer}>
          <Image
            source={IMAGES.secureImage}
            resizeMode="contain"
            style={{ width: SIZES.width * 0.6, height: SIZES.width * 0.6 }}
          />

          <View style={styles.bodyContent}>
            <StyledText style={styles.text}>
              {t(STRINGS.secureYourWalletContent)}
            </StyledText>
          </View>
        </View>

        <View style={styles.bottom}>
          <CustomButton
            height={SIZES.buttonHeight}
            icon={ICONS.arrowRight}
            label={t(STRINGS.startLabel)}
            onPress={() =>
              navigation.navigate(SCREEN_NAME.confirmYourPasswordScreen, {
                showButton: true,
              })
            }
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    width: SIZES.width * 0.9,
    marginTop: SIZES.height * 0.05,
    ...FONTS.t30b,
    color: COLOR.white,
    left: 16,
  },
  imageContainer: {
    top: SIZES.height * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SIZES.height * 0.05,
    paddingHorizontal: 16,
  },
  text: {
    ...FONTS.t14r,
    color: COLOR.textSecondary,
  },
  bottom: {
    width: SIZES.width - SIZES.simpleMargin * 2,
    height: SIZES.buttonHeight,
    position: 'absolute',
    left: SIZES.simpleMargin,
    bottom: 58,
  },
});

export default SecureYourWalletScreen;
