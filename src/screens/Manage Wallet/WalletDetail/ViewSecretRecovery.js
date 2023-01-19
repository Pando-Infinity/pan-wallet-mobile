import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import { FONTS, COLOR, STRINGS, ICONS, IMAGES, IMPORT_TYPE } from 'constants';
import { useTranslation } from 'react-i18next';
import CustomButton from 'components/CustomButton/CustomButton';
import { copyTextToClipboard } from 'utils/util';

const ViewSecretRecovery = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [isDidTap, setIsDidTap] = useState(false);

  const didTapCopy = () => {
    if (route.params.type === IMPORT_TYPE.seedPhraseType) {
      copyTextToClipboard(t, route.params.seedPhrase);
    } else {
      copyTextToClipboard(t, route.params.privateKey);
    }
  };

  const renderViewReveal = () => {
    if (isDidTap === false) {
      return (
        <View style={styles.reveal}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                ...FONTS.t16b,
                color: COLOR.white,
                textAlign: 'center',
              }}>
              {route.params.type === IMPORT_TYPE.seedPhraseType
                ? t(STRINGS.reveal_secret_recovery_phrase)
                : t(STRINGS.reveal_private_key)}
            </Text>
          </View>
          <View style={{ marginTop: 30 }}>
            <CustomButton
              width={94}
              height={40}
              label={t(STRINGS.view)}
              onPress={() => setIsDidTap(true)}
            />
          </View>
        </View>
      );
    } else {
      return (
        <View style={[styles.reveal, { paddingHorizontal: 16 }]}>
          <Text style={{ ...FONTS.t16r, color: COLOR.white }}>
            {route.params.type === IMPORT_TYPE.seedPhraseType
              ? route.params.seedPhrase
              : route.params.privateKey}
          </Text>
          <TouchableOpacity
            onPress={() => didTapCopy()}
            style={styles.button_copy}>
            <Image source={ICONS.copy} />
            <Text style={[FONTS.t14b, styles.text_button_copy]}>
              {t(STRINGS.copy_to_clipboard)}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1 }}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.pop(2)}>
              <Image source={ICONS.backButton} resizeMode="cover" />
            </TouchableOpacity>
            <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
              {route.params.type === IMPORT_TYPE.seedPhraseType
                ? t(STRINGS.view_secret_recovery_phrase)
                : t(STRINGS.view_private_key)}
            </Text>
            <Text />
          </View>
          <View style={styles.body}>
            <Text style={{ ...FONTS.t14r, color: COLOR.textSecondary }}>
              {route.params.type === IMPORT_TYPE.seedPhraseType
                ? t(STRINGS.secret_recovery_phrase_sup_title)
                : t(STRINGS.private_key_sup_title)}
            </Text>
            <View style={styles.waring}>
              <View style={styles.waringContent}>
                <Image source={ICONS.waring} resizeMode="cover" />
                <Text
                  style={{
                    ...FONTS.t12r,
                    color: COLOR.systemYellowLight,
                    marginLeft: 15,
                    marginRight: 28,
                  }}>
                  {route.params.type === IMPORT_TYPE.seedPhraseType
                    ? t(STRINGS.secret_recovery_phrase_warning)
                    : t(STRINGS.private_key_warning)}
                </Text>
              </View>
            </View>
            {renderViewReveal()}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
export default ViewSecretRecovery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 30,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  body: {
    flex: 9,
    marginTop: 34,
    alignItems: 'flex-start',
  },
  waring: {
    marginTop: 25,
    width: '100%',
    backgroundColor: COLOR.systemYellowLight,
    paddingLeft: 4,
    borderRadius: 4,
  },
  waringContent: {
    flexDirection: 'row',
    backgroundColor: COLOR.systemYellow,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  reveal: {
    backgroundColor: COLOR.gray3,
    borderRadius: 16,
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 30,
  },
  button_copy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.stateDefault,
    borderRadius: 6,
    marginTop: 32,
    width: '100%',
  },
  text_button_copy: {
    color: COLOR.gray10,
    marginStart: 14,
    marginTop: 10,
    marginBottom: 10,
  },
});
