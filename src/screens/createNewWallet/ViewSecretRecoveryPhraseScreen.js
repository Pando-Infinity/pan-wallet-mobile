import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {
  COLOR,
  FONTS,
  IMAGES,
  SIZES,
  STRINGS,
  ICONS,
  SCREEN_NAME,
} from '../../constants';
import CustomBackButton from '../../components/CustomBackButton/CustomBackButton';
import { useTranslation } from 'react-i18next';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import CustomButton from '../../components/CustomButton/CustomButton';
import LinearGradient from 'react-native-linear-gradient';
import { generateMnemonic } from '../../walletCore/CreateWallet';
import { RootSiblingParent } from 'react-native-root-siblings';
import { copyTextToClipboard } from '../../utils/util';

const ViewSecretRecoveryPhrase = ({ navigation }) => {
  const { t } = useTranslation();

  const [mnemonic, setMnemonic] = useState();

  const [mnemonicArr, setMnemonicArr] = useState([]);

  const [statusAgreeTerms, setStatusAgreeTerms] = useState(false);

  const [showSeedPhrase, setShowSeedPhrase] = useState(false);

  const convertToMnemonicArr = seedPhrase => {
    const seedPhraseArr = seedPhrase.split(' ');
    const arr = [];
    let i = 1;
    seedPhraseArr.map(word => {
      arr.push({ id: i, word: word });
      i++;
    });
    return arr;
  };

  const generateSeedPhrase = () => {
    const seedPhrase = generateMnemonic();
    setMnemonic(seedPhrase);
    const seedPhraseArr = convertToMnemonicArr(seedPhrase);
    setMnemonicArr(seedPhraseArr);
  };

  const style = StyleSheet.create({
    container: {
      flex: 1,
      paddingStart: 16,
      paddingEnd: 16,
      paddingBottom: 16,
    },

    button_back: {
      alignItems: 'flex-start',
      marginTop: SIZES.marginStatusbar,
    },

    title: {
      color: COLOR.white,
      letterSpacing: -0.03,
      marginTop: 26,
    },

    description: {
      marginTop: 12,
      textAlign: 'left',
      color: COLOR.textSecondary,
    },

    container_seed_phrase: {
      backgroundColor: COLOR.actionDisabled,
      borderRadius: SIZES.simpleMargin,
      borderColor: COLOR.trackColorDisable,
      borderWidth: 1,
      marginTop: SIZES.heightScreen * 0.02,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: SIZES.height * 0.45,
    },

    container_term_condition: {
      marginTop: SIZES.heightScreen * 0.02,
      paddingStart: 8,
      flexDirection: 'row',
    },

    text_term_condition: {
      color: COLOR.textSecondary,
      alignItems: 'flex-start',
      paddingEnd: 50,
    },

    container_button_continue: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginTop: SIZES.heightScreen * 0.03,
    },

    security_icon: {
      marginTop: 30,
    },

    text_tab_to_reveal: {
      color: COLOR.white,
      textAlign: 'center',
      marginTop: 16,
    },

    itemStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '50%',
      marginTop: 12,
    },

    button_copy: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLOR.stateDefault,
      borderRadius: 6,
      marginTop: 32,
      marginBottom: 24,
      width: '95%',
    },

    text_button_copy: {
      color: COLOR.gray10,
      marginStart: 14,
      marginTop: 10,
      marginBottom: 10,
    },

    icon_check_box: {
      borderRadius: SIZES.radius,
    },

    text_id_of_word: {
      color: COLOR.textSecondary,
      marginEnd: 24,
    },

    button_view: {
      marginTop: 24,
      marginBottom: 29,
    },

    button_view_linear_gradient: {
      paddingStart: 30,
      paddingEnd: 30,
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: SIZES.simpleSpace,
    },

    notification_show_seed_phrase_text_2: {
      color: COLOR.textSecondary,
      marginTop: 12,
    },

    container_notification_show_seed_phrase: {
      display: showSeedPhrase ? 'none' : 'flex',
      alignItems: 'center',
    },

    container_seed_phrase_list: {
      display: showSeedPhrase ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      flex: 1,
    },

    seed_phrase_list: {
      marginTop: 24,
      marginStart: 24,
      flexWrap: 'wrap',
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
      flex: 9,
    },

    toastContainer: {
      backgroundColor: '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,

      width: '40%',

      display: 'flex',
    },

    toastText: {
      paddingTop: 10,
      paddingBottom: 10,
      fontSize: 12,
    },
  });

  const renderItem = (item, index) => (
    <View style={style.itemStyle} key={index}>
      <Text style={[FONTS.t14r, style.text_id_of_word]}>{item.id}.</Text>
      <Text style={[FONTS.t16r, { color: COLOR.white }]}>{item.word}</Text>
    </View>
  );

  return (
    <RootSiblingParent>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={IMAGES.backgroundConfirmPassword}
          style={style.container}
          resizeMode="cover">
          <View style={style.button_back}>
            <CustomBackButton
              onPress={() => {
                navigation.pop(2);
              }}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <Text style={[style.title, FONTS.t30b]}>
              {t(STRINGS.notification_secret_recovery_phrase)}
            </Text>

            <Text style={[style.description, FONTS.t14r]}>
              {t(STRINGS.secret_recovery_phrase_description)}
            </Text>

            <View style={style.container_seed_phrase}>
              <View style={style.container_notification_show_seed_phrase}>
                <Image source={ICONS.security} style={[style.security_icon]} />

                <Text style={[style.text_tab_to_reveal, FONTS.t16b]}>
                  {t(STRINGS.tap_to_reveal_your)}
                </Text>

                <Text
                  style={[
                    FONTS.t14r,
                    style.notification_show_seed_phrase_text_2,
                  ]}>
                  {t(STRINGS.make_sure_no_one_is_watching_your_screen)}
                </Text>

                <TouchableOpacity
                  style={style.button_view}
                  onPress={() => {
                    generateSeedPhrase();
                    setShowSeedPhrase(true);
                  }}>
                  <LinearGradient
                    colors={COLOR.buttonViewSeedPhraseColor}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={style.button_view_linear_gradient}>
                    <Text style={{ color: COLOR.gray10 }}>
                      {t(STRINGS.view)}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={[style.container_seed_phrase_list]}>
                <View style={style.seed_phrase_list}>
                  {mnemonicArr.map((item, index) => renderItem(item, index))}
                </View>

                <TouchableOpacity
                  onPress={() => copyTextToClipboard(t, mnemonic)}
                  style={style.button_copy}>
                  <Image source={ICONS.copy} />
                  <Text style={[FONTS.t14b, style.text_button_copy]}>
                    {t(STRINGS.copy_to_clipboard)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: SIZES.height * 0.025 }} />

            <View style={style.container_term_condition}>
              <BouncyCheckbox
                size={24}
                fillColor={COLOR.trackColorEnable}
                iconStyle={style.icon_check_box}
                onPress={isChecked => {
                  setStatusAgreeTerms(isChecked);
                }}
              />

              <Text style={[style.text_term_condition, FONTS.t14r]}>
                {t(STRINGS.term_condition)}
              </Text>
            </View>
          </ScrollView>
          <View style={style.container_button_continue}>
            <CustomButton
              label={t(STRINGS.continue)}
              icon={ICONS.arrowRight}
              isDisable={!(statusAgreeTerms && showSeedPhrase)}
              width={SIZES.width - SIZES.simpleMargin * 2}
              height={SIZES.buttonHeight}
              onPress={() => {
                navigation.navigate(SCREEN_NAME.confirmPassPhrase, {
                  seedPhrase: mnemonic,
                });
              }}
            />
          </View>
        </ImageBackground>
      </View>
    </RootSiblingParent>
  );
};

export default ViewSecretRecoveryPhrase;
