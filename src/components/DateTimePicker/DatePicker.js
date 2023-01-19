import React from 'react';
import {Platform} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {COLOR, STRINGS} from '../../constants';
import {DateTimePickerModal} from './datePickTimeIos/DateTimePickerModalIOS';
import {useTranslation, getI18n} from 'react-i18next';

const DatePicker = ({display, disable = () => {}, getDate = () => {}}) => {
  const {t} = useTranslation();

  return Platform.OS === 'android' ? (
    <DateTimePicker
      isVisible={display}
      mode={'date'}
      display={'default'}
      onConfirm={date => {
        disable();
        getDate(date);
      }}
      onCancel={() => {
        disable();
      }}
      pickerStyleIOS={{
        backgroundColor: COLOR.simpleBackground,
      }}
    />
  ) : (
    <DateTimePickerModal
      isVisible={display}
      pickerStyleIOS={{backgroundColor: COLOR.simpleBackground}}
      pickerContainerStyleIOS={{backgroundColor: COLOR.simpleBackground}}
      onConfirm={date => {
        disable();
        getDate(date);
      }}
      onCancel={() => {
        disable();
      }}
      display={'inline'}
      cancelTextIOS={t(STRINGS.cancelText)}
      confirmTextIOS={t(STRINGS.confirm)}
      locate={getI18n().language}
    />
  );
};

export default DatePicker;
