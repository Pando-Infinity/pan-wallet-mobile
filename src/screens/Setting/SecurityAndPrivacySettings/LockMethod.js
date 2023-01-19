import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { STRINGS, COLOR, NATIVE_ASYNC_STORAGE, CONSTANTS } from 'constants';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setLockMethodValue } from 'stores/reducer/lockMethodValueSlice';
import { NativeAsyncStorage, storage } from 'databases/index';
import { setHiddenUnlockSignIn } from 'stores/reducer/hiddenUnlockSignInSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Container, HeaderLabel } from 'components/common';
import { SettingCheckRowItem } from '../components';

const LockMethod = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { hiddenUnlockSignIn } = useSelector(state => state.hiddenUnlockSignIn);

  const [indexItemHidden, setIndexItemHidden] = useState(
    route.params.chooseOnlyPassword || hiddenUnlockSignIn === true ? 1 : 0,
  );

  const handleSave = () => {
    const isOnlyPassword = indexItemHidden === 1;
    const lockMethodValue = isOnlyPassword
      ? t(STRINGS.only_password)
      : route.params.data;
    storage.set(CONSTANTS.hiddenSignIn, isOnlyPassword);
    dispatch(setHiddenUnlockSignIn(isOnlyPassword));
    dispatch(setLockMethodValue(lockMethodValue));
    NativeAsyncStorage.saveData(
      NATIVE_ASYNC_STORAGE.lockMethodOnlyPassword,
      isOnlyPassword ? 'true' : 'false',
    );
    navigation.goBack();
  };

  return (
    <Container
      childrenProps={{
        style: {
          width: '100%',
        },
      }}>
      <HeaderLabel
        label={t(STRINGS.lock_method_settings)}
        rightButton={
          <TouchableOpacity
            onPress={handleSave}
            style={{ position: 'absolute', right: 0 }}>
            <Text style={{ color: COLOR.white }}>{t(STRINGS.save)}</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.body}>
        {[route.params.data, t(STRINGS.only_password)].map((item, index) => (
          <SettingCheckRowItem
            key={index}
            style={{ marginVertical: 4 }}
            isChecked={indexItemHidden === index}
            label={item}
            onPress={() => setIndexItemHidden(index)}
          />
        ))}
      </View>
    </Container>
  );
};
export default LockMethod;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 24,
    width: '100%',
  },
});
