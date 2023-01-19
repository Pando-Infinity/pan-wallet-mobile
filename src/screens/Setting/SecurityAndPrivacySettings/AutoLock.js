import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { STRINGS, COLOR, TIME_OUT } from 'constants';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { autoLockTimeFunction } from 'models/LocalizedData';
import { storage } from 'databases';
import { setAutoLockValue } from 'stores/reducer/autoLockValueSlice';
import { Container, HeaderLabel } from 'components/common';
import { useNavigation } from '@react-navigation/native';
import { SettingCheckRowItem } from '../components';

const AutoLock = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const autoLockTimeData = autoLockTimeFunction(t);

  const { autoLockValue } = useSelector(state => state.autoLockValue);

  const [content, setContent] = useState(autoLockValue);

  const handleSave = () => {
    dispatch(setAutoLockValue(content));
    navigation.goBack();
  };

  const renderItem = item => (
    <SettingCheckRowItem
      label={item.content}
      isChecked={item.content === content}
      style={{
        marginVertical: 4,
        marginHorizontal: 0,
        marginStart: 0,
        width: '100%',
      }}
      onPress={() => {
        setTimeOutWhenChanged(item.id);
        setContent(item.content);
      }}
    />
  );

  return (
    <Container>
      <View style={{ width: '100%', marginBottom: 20 }}>
        <HeaderLabel
          label={t(STRINGS.auto_lock_setting)}
          rightButton={
            <TouchableOpacity
              onPress={handleSave}
              style={{ position: 'absolute', right: 0 }}>
              <Text style={{ color: COLOR.white }}>{t(STRINGS.save)}</Text>
            </TouchableOpacity>
          }
        />
      </View>
      <FlatList
        data={autoLockTimeData}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={item => item.id}
        style={{ width: '100%', margin: 0 }}
      />
    </Container>
  );
};

AutoLock.propTypes = {};

const setTimeOutWhenChanged = id => {
  switch (id) {
    case '0':
      storage.set(TIME_OUT.timeOut, TIME_OUT.always);
      break;
    case '1':
      storage.set(TIME_OUT.timeOut, TIME_OUT.after_5_sec);
      break;
    case '2':
      storage.set(TIME_OUT.timeOut, TIME_OUT.after_15_sec);
      break;
    case '3':
      storage.set(TIME_OUT.timeOut, TIME_OUT.after_30_sec);
      break;
    case '4':
      storage.set(TIME_OUT.timeOut, TIME_OUT.after_60_sec);
      break;
    case '5':
      storage.set(TIME_OUT.timeOut, TIME_OUT.after_5_min);
      break;
    case '6':
      storage.set(TIME_OUT.timeOut, TIME_OUT.after_10_min);
      break;
  }
};

export default AutoLock;
