import React, { createRef, useState } from 'react';
import {
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
  CONSTANTS,
  FONTS,
  ICONS,
  IMAGES,
  SIZES,
  STRINGS,
  URLConst,
} from '../../constants';
import { useTranslation } from 'react-i18next';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import { SettingRowItem } from './components';
import DeviceInfo from 'react-native-device-info/src/index';
import { format } from 'react-string-format';
import { useNavigation } from '@react-navigation/native';
import email from 'react-native-email';
import StyledText from 'react-native-styled-text';

const AboutPanWalletScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [displayBlockContainer, setDisplayBlockContainer] = useState(false);
  const bs = createRef();
  const fall = new Animated.Value(1);
  const version = DeviceInfo.getVersion();

  const handleEmail = () => {
    const to = URLConst.contact_us;
    email(to, {
      checkCanOpen: false,
    }).catch();
  };

  const renderHeader = () => (
    <View style={styles.bottom_sheet_header}>
      <Text style={[FONTS.t16b, styles.text_header]}>
        {t(STRINGS.contact_us)}
      </Text>

      <TouchableOpacity
        style={styles.button_close_bottom_sheet}
        onPress={() => {
          bs.current.snapTo(1);
          setDisplayBlockContainer(false);
        }}>
        <Image source={ICONS.clear2} resizeMode={'cover'} />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => (
    <View style={styles.bottom_sheet_content}>
      <View style={styles.view_divide} />

      <View style={styles.view_content}>
        <Text style={[FONTS.t14b, styles.text_title]}>{t(STRINGS.email)}</Text>
        <TouchableOpacity onPress={handleEmail}>
          <Text style={[FONTS.t14r, styles.text_content]}>
            <StyledText>{CONSTANTS.email}</StyledText>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={IMAGES.homeBackGround}
      style={styles.container}
      resizeMode={'cover'}>
      {/*header*/}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.button_back}>
          <Image source={ICONS.backButton} resizeMode={'cover'} />
        </TouchableOpacity>

        <Text style={[FONTS.t16b, styles.title]}>
          {t(STRINGS.about_pan_wallet)}
        </Text>
      </View>

      {/*logo*/}
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 18,
        }}>
        <Image
          source={IMAGES.panLogo}
          style={{ width: 67, height: 67 }}
          resizeMode="contain"
        />
        <Image
          source={IMAGES.panWallet}
          style={{ width: 100, height: 15, marginTop: 20 }}
          resizeMode="contain"
        />
      </View>
      <Text style={[FONTS.t12r, styles.version]}>
        {format(`${t(STRINGS.version)}`, version)}
      </Text>

      {/*Features*/}
      {/*Privacy policy*/}
      <SettingRowItem
        label={t(STRINGS.privacy_policy)}
        style={styles.button}
        onPress={() => Linking.openURL(URLConst.privacy_policy).catch()}
      />

      {/*Term of service*/}
      <SettingRowItem
        label={t(STRINGS.term_of_service)}
        style={styles.button}
        onPress={() => Linking.openURL(URLConst.terms_and_conditions).catch()}
      />

      {/*Support*/}
      <SettingRowItem
        label={t(STRINGS.support)}
        style={[styles.button, styles.dimen_divide_type_features]}
        onPress={() => Linking.openURL(URLConst.support).catch()}
      />

      {/*Visit our Website*/}
      <SettingRowItem
        label={t(STRINGS.visit_our_website)}
        style={styles.button}
        onPress={() => Linking.openURL(URLConst.visit_our_website).catch()}
      />

      {/*Contact us*/}
      <SettingRowItem
        label={t(STRINGS.contact_us)}
        style={[styles.button, styles.dimen_divide_type_features]}
        onPress={() => {
          setDisplayBlockContainer(true);
          bs.current.snapTo(0);
        }}
      />

      <View
        style={[
          styles.block_container,
          { display: displayBlockContainer ? 'flex' : 'none' },
        ]}
      />

      <BottomSheet
        ref={bs}
        snapPoints={[SIZES.height * 0.25, 0]}
        initialSnap={1}
        callbackNode={fall}
        enabledGestureInteraction={true}
        renderHeader={renderHeader}
        renderContent={renderContent}
        overdragResistanceFactor={0}
      />
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    marginTop: SIZES.marginStatusbar,
    alignItems: 'center',
    position: 'relative',
  },

  button_back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: SIZES.simpleSpace,
    position: 'absolute',
    start: 0,
    top: -10,
  },

  title: {
    color: COLOR.white,
  },

  name: {
    color: COLOR.white,
    textAlign: 'center',
    width: '100%',
    marginTop: SIZES.simpleSpace,
  },

  version: {
    color: COLOR.textSecondary,
    textAlign: 'center',
    marginTop: 11,
    marginBottom: 37,
  },

  button: {
    marginBottom: SIZES.simpleSpace,
    marginHorizontal: 16,
  },

  dimen_divide_type_features: { marginTop: SIZES.heightScreen * 0.04 },

  block_container: {
    height: SIZES.heightScreen * 0.75,
    width: SIZES.widthScreen,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLOR.blackOpacity04,
  },

  bottom_sheet_header: {
    backgroundColor: COLOR.simpleBackground,
    borderTopLeftRadius: SIZES.heightScreen * 0.0123,
    borderTopRightRadius: SIZES.heightScreen * 0.0123,
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
    padding: SIZES.heightScreen * 0.017,
  },

  bottom_sheet_content: {
    backgroundColor: COLOR.simpleBackground,
    height: '100%',
  },

  view_divide: {
    height: 1,
    backgroundColor: COLOR.gray5,
  },

  view_content: {
    flexDirection: 'row',
    marginTop: SIZES.heightScreen * 0.033,
    marginStart: SIZES.simpleMargin,
    marginEnd: SIZES.simpleMargin,
    alignItems: 'center',
  },

  text_title: {
    color: COLOR.textSecondary,
  },

  text_content: {
    marginLeft: 8,
    color: COLOR.white,
  },

  logo: {
    width: '100%',
    textAlign: 'center',
    marginTop: SIZES.heightScreen * 0.042,
    color: COLOR.white,
  },
});

export default AboutPanWalletScreen;
