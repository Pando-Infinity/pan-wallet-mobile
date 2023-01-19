import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  FlatList,
  View,
  Text,
  ImageBackground,
  useWindowDimensions,
  Animated,
} from 'react-native';
import {
  IMAGES,
  APP_THEMES,
  ICONS,
  SCREEN_NAME,
  STRINGS,
  NATIVE_ASYNC_STORAGE,
  DATA_TYPE,
} from '../../constants';
import { slidesFunction } from '../../models/LocalizedData';
import Paginator from '../../components/PageControl/Paginator';
import CustomButton from '../../components/CustomButton/CustomButton';
import { useTranslation } from 'react-i18next';
import Constants from '../../constants/constants';
import {
  DAORepository,
  KeychainRepository,
  NativeAsyncStorage,
  storage,
} from '../../databases';
const { SIZES, COLOR } = APP_THEMES;
const width = SIZES.width;

const OnboardingScreen = ({ navigation, item }) => {
  const { t } = useTranslation();
  const slides = slidesFunction(t);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const ref = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;

  const updateCurrentSlideIndex = e => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const gotoSplashScreen = () => {
    if (storage.getBoolean(Constants.didOpenHomeScreenKey) === true) {
      navigation.navigate(SCREEN_NAME.splashScreen);
    }
  };

  const OnboardItem = ({ item }) => {
    const width = useWindowDimensions();

    useEffect(() => {
      gotoSplashScreen();
    });

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          top: SIZES.height * 0.15,
        }}>
        <View style={[styles.onBoardingItemContainer, width]}>
          <Image source={item.image} style={[styles.image]} />
          <View
            style={{
              flex: 5,
              paddingStart: 16,
              paddingEnd: 48,
              marginTop: 24,
            }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={[styles.description, { marginTop: 12 }]}>
              {item.subtitle}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.onBoardingBackground}
        style={{
          flex: 1,
        }}
        resizeMode="cover">
        <View
          style={{
            flex: 9,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <FlatList
            style={{
              flex: 7,
            }}
            ref={ref}
            data={slides}
            renderItem={({ item }) => <OnboardItem item={item} />}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            bounces={false}
            keyExtractor={item => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              {
                useNativeDriver: false,
              },
            )}
            onMomentumScrollEnd={updateCurrentSlideIndex}
          />
          <Paginator data={slides} scrollX={scrollX} style={{ flex: 3 }} />
        </View>

        <View
          style={{
            flex: 2,
            justifyContent: 'center',
            marginHorizontal: 16,
          }}>
          <CustomButton
            height={SIZES.buttonHeight}
            label={t(STRINGS.getStarted)}
            icon={ICONS.arrowRight}
            isDisable={false}
            onPress={() => {
              NativeAsyncStorage.getData(
                NATIVE_ASYNC_STORAGE.installedApp,
                DATA_TYPE.string,
                data => {
                  if (data === 'true') {
                    DAORepository.deleteAllObject();
                  }
                },
              );
              storage.clearAll();
              navigation.navigate(SCREEN_NAME.createPassWordScreen);
            }}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  onBoardingItemContainer: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    width: SIZES.width * 0.6,
    height: SIZES.width * 0.6,
  },

  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    height: 50,
  },
  title: {
    color: COLOR.white,
    fontSize: 30,
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 38,
    letterSpacing: -0.03,
  },

  description: {
    color: COLOR.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButton: {
    fontWeight: '700',
    fontStyle: 'normal',
    fontSize: 16,
    lineHeight: 20,
    color: COLOR.white,
    textAlign: 'center',
  },

  textButtonBack: {
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: COLOR.white,
  },

  buttonOne: {
    marginStart: 18,
    marginEnd: 16,
    borderRadius: 6,
    paddingTop: 14,
    paddingBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
});

export default OnboardingScreen;
