import React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLOR, FONTS, ICONS, IMAGES, SIZES, STRINGS } from '../../constants';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { setNavigationBackEvent } from 'stores/reducer/navigationEventSlice';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container_notification: {
    flex: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container_button: {
    flex: 1,
    alignItems: 'center',
    paddingStart: SIZES.simpleMargin,
    paddingEnd: SIZES.simpleMargin,
  },

  button_try_again: {
    width: SIZES.width - SIZES.simpleMargin,
    borderRadius: 8,
    paddingTop: 14,
    paddingBottom: 14,
    alignItems: 'center',
  },
});

const NetworkErrorScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.backgroundConfirmPassword}
        resizeMode={'cover'}
        style={{ flex: 1 }}>
        <View style={styles.container_notification}>
          <Image source={ICONS.networkIcon} resizeMode={'cover'} />

          <Text style={[FONTS.t20b, { color: COLOR.white, marginTop: 24 }]}>
            {t(STRINGS.you_re_offline)}
          </Text>

          <Text
            style={[FONTS.t14r, { color: COLOR.textSecondary, marginTop: 8 }]}>
            {t(STRINGS.unable_to_connect_to_the_blockchain_host)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.container_button}
          onPress={() => {
            navigation.goBack();
            dispatch(setNavigationBackEvent(true));
          }}>
          <LinearGradient
            colors={COLOR.buttonViewSeedPhraseColor}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button_try_again}>
            <Text style={[FONTS.t16b, { color: COLOR.gray10 }]}>
              {t(STRINGS.try_again)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

NetworkErrorScreen.propTypes = {
  navigation: PropTypes.object,
};

export default NetworkErrorScreen;
