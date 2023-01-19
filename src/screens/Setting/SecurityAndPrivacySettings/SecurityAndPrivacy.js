import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  FONTS,
  SIZES,
  STRINGS,
  COLOR,
  IMAGES,
  ICONS,
  SCREEN_NAME,
  TIME_OUT,
  DATA_TYPE,
} from 'constants';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { NativeAsyncStorage, storage } from 'databases';
import { setAutoLockValue } from 'stores/reducer/autoLockValueSlice';
import { setLockMethodValue } from 'stores/reducer/lockMethodValueSlice';
import TouchID from 'react-native-touch-id';
import {
  autoLockTimeFunction,
  optionalConfigObjectFunction,
} from 'models/LocalizedData';
import { biometryTypeValue } from 'constants/BiometricType';
import NativeAsyncStorageKey from 'constants/NativeAsyncStorageKey';
import { SettingRowItem } from '../components';
import { useNavigation } from '@react-navigation/native';

const SecurityAndPrivacy = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const optionalConfigObject = optionalConfigObjectFunction(t);
  const autoLockTimeData = autoLockTimeFunction(t);

  const [chooseOnlyPassword, setChooseOnlyPassword] = useState(false);

  const { autoLockValue } = useSelector(state => state.autoLockValue);
  const { lockMethodValue } = useSelector(state => state.lockMethodValue);

  const checkBiometrySupported = async () => {
    try {
      const type = await TouchID.isSupported(optionalConfigObject);
      if (type === true) {
        return t(STRINGS.passwordOrBiometrics);
      } else {
        switch (type) {
          case biometryTypeValue.FaceID: {
            return t(STRINGS.passwordOrFaceID);
          }
          case biometryTypeValue.TouchID: {
            return t(STRINGS.passwordOrTouchID);
          }
          default: {
            return t(STRINGS.passwordAndRememberMe);
          }
        }
      }
    } catch (e) {
      return t(STRINGS.passwordAndRememberMe);
    }
  };

  const handleLockMethod = () => {
    checkBiometrySupported().then(data => {
      navigation.navigate(SCREEN_NAME.lockMethodScreen, {
        data,
        chooseOnlyPassword: chooseOnlyPassword,
      });
    });
  };

  useEffect(() => {
    const autoLockTime = storage.getString(TIME_OUT.timeOut);
    let lockContentIndex = '';

    switch (autoLockTime) {
      case TIME_OUT.always: {
        lockContentIndex = 0;
        break;
      }
      case TIME_OUT.after_5_sec: {
        lockContentIndex = 1;
        break;
      }
      case TIME_OUT.after_15_sec: {
        lockContentIndex = 2;
        break;
      }
      case TIME_OUT.after_30_sec: {
        lockContentIndex = 3;
        break;
      }
      case TIME_OUT.after_60_sec: {
        lockContentIndex = 4;
        break;
      }
      case TIME_OUT.after_5_min: {
        lockContentIndex = 5;
        break;
      }
      case TIME_OUT.after_10_min: {
        lockContentIndex = 6;
        break;
      }
    }
    dispatch(setAutoLockValue(autoLockTimeData?.[lockContentIndex]?.content));
  }, []);

  useEffect(() => {
    NativeAsyncStorage.getData(
      NativeAsyncStorageKey.lockMethodOnlyPassword,
      DATA_TYPE.string,
      data => {
        if (data === 'true') {
          dispatch(setLockMethodValue(t(STRINGS.only_password)));
          setChooseOnlyPassword(true);
        } else {
          checkBiometrySupported().then(lockMethod => {
            dispatch(setLockMethodValue(lockMethod));
            setChooseOnlyPassword(false);
          });
        }
      },
    );
  });

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={IMAGES.homeBackGround}
        style={{ flex: 1 }}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={ICONS.backButton} resizeMode="cover" />
            </TouchableOpacity>

            <Text style={{ ...FONTS.t16b, color: COLOR.white }}>
              {t(STRINGS.security_and_privacy_settings)}
            </Text>

            <Text />
          </View>

          <View style={styles.body}>
            <SettingRowItem
              label={t(STRINGS.auto_lock)}
              style={{ marginTop: 30, marginVertical: 4, marginHorizontal: 16 }}
              textValue={autoLockValue}
              onPress={() => navigation.navigate(SCREEN_NAME.autoLockScreen)}
            />

            <SettingRowItem
              label={t(STRINGS.lock_method)}
              style={{ marginVertical: 4, marginHorizontal: 16 }}
              textValue={lockMethodValue}
              onPress={handleLockMethod}
            />

            <SettingRowItem
              label={t(STRINGS.change_password)}
              style={{ marginTop: 32, marginHorizontal: 16 }}
              onPress={() =>
                navigation.navigate(SCREEN_NAME.confirmPasswordScreen, {
                  screenName: SCREEN_NAME.securityAndPrivacyScreen,
                })
              }
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
export default SecurityAndPrivacy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.marginStatusbar,
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  body: {
    flex: 9,
    justifyContent: 'flex-start',
  },
});
