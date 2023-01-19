import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, Image, TextInput } from 'react-native';
import { FONTS, COLOR, SIZES, ICONS } from '../../constants';
import PropTypes from 'prop-types';

const CustomTextInput = ({
  label,
  isPassword,
  error,
  width,
  editable,
  selectTextOnFocus,
  autoFocus,
  onFocus = () => {},
  getData = text => {},
  onBlur = () => {},
  multiline,
  dataScanner,
  statusScanner,
  onChangeStatusScanner = () => {},
  resetTextData,
  onChangeStatusResetData = () => {},
  numberType,
  value,
  ...props
}) => {
  const focusInput = useRef();
  const [hidePassword, setHidePassword] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);
  const [isCenterLabel, setIsCenterLabel] = useState(true);
  const [textData, setTextData] = useState('');

  const marginRightTextInput = () => {
    if (isFocused && isPassword) {
      return 88;
    }
    if (!isFocused && !isPassword) {
      return 16;
    }
    return 48;
  };

  useEffect(() => {
    getData(textData);
  }, [textData]);

  useEffect(() => {
    if (resetTextData) {
      setTextData('');
      onChangeStatusResetData();
      setIsCenterLabel(true);
    }
  }, [resetTextData]);

  useEffect(() => {
    if (statusScanner) {
      setTextData(dataScanner);
      setIsCenterLabel(false);
      onChangeStatusScanner();
    }
  }, [statusScanner]);

  const showPasswordButton = () => {
    if (isPassword) {
      return (
        <TouchableOpacity
          onPress={() => {
            setHidePassword(!hidePassword);
          }}
          style={{
            position: 'absolute',
            top: '20%',
            right: SIZES.simpleSpace / 2,
            width: SIZES.iconWidth,
            height: SIZES.iconHeight,
          }}>
          <Image source={hidePassword ? ICONS.eyeSlash : ICONS.eye} />
        </TouchableOpacity>
      );
    } else {
      return <></>;
    }
  };

  const clearButton = () => {
    if (isFocused) {
      return (
        <TouchableOpacity
          onPress={() => {
            setTextData('');
            getData('');
          }}
          style={{
            position: 'absolute',
            top: '20%',
            right: !isPassword
              ? SIZES.simpleSpace / 2
              : SIZES.simpleSpace / 2 + SIZES.iconWidth,
            width: SIZES.iconWidth,
            height: SIZES.iconHeight,
          }}>
          <Image source={ICONS.clear} />
        </TouchableOpacity>
      );
    } else {
      return <></>;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => focusInput.current.focus()}
      style={{
        borderRadius: SIZES.radius,
        backgroundColor: COLOR.gray3,
        justifyContent: 'center',
        width: width ? width : SIZES.width - SIZES.simpleMargin * 2,
        minHeight: SIZES.simpleHeightTextField,
        borderColor: error ? COLOR.systemRedLight : COLOR.gray3,
        borderWidth: 1,
      }}>
      <Text
        style={{
          position: 'absolute',
          left: SIZES.simpleMargin,
          top: isCenterLabel ? 18 : 8,
          color: isCenterLabel ? COLOR.white : COLOR.textSecondary,
          ...FONTS.t14b,
        }}>
        {label}
      </Text>

      <TextInput
        editable={editable}
        selectTextOnFocus={selectTextOnFocus}
        ref={focusInput}
        autoCorrect={false}
        autoFocus={autoFocus}
        keyboardType={numberType ? 'decimal-pad' : 'default'}
        onFocus={() => {
          onFocus();
          setIsFocused(true);
          setIsCenterLabel(false);
        }}
        onBlur={() => {
          setIsFocused(false);
          const text = value?.trim() ?? textData.trim();
          if (text === '') {
            setIsCenterLabel(true);
            setTextData('');
          }
          onBlur();
        }}
        onChangeText={newText => {
          setTextData(newText);
        }}
        value={value ?? textData}
        secureTextEntry={hidePassword}
        multiline={!hidePassword && multiline}
        style={{
          color: COLOR.white,
          marginLeft: SIZES.simpleMargin,
          ...FONTS.t14r,
          paddingVertical: SIZES.paddingVerticalTextInput,
          marginTop: isCenterLabel ? 0 : SIZES.topSpaceTextInput,
          marginRight: marginRightTextInput(),
          marginBottom: isCenterLabel ? 0 : SIZES.simpleSpace,
          height: !multiline ? 30 : undefined,
        }}
        {...props}
      />

      {showPasswordButton()}

      {(value?.length ?? textData.length) > 0 && clearButton()}
    </TouchableOpacity>
  );
};

CustomTextInput.propTypes = {
  label: PropTypes.string,
  isPassword: PropTypes.bool,
  error: PropTypes.bool,
  width: PropTypes.number,
  editable: PropTypes.bool,
  selectTextOnFocus: PropTypes.bool,
  autoFocus: PropTypes.bool,
  onFocus: PropTypes.func,
  getData: PropTypes.func,
  onBlur: PropTypes.func,
  multiline: PropTypes.bool,
  dataScanner: PropTypes.string,
  statusScanner: PropTypes.bool,
  onChangeStatusScanner: PropTypes.func,
  resetTextData: PropTypes.bool,
  onChangeStatusResetData: PropTypes.func,
  numberType: PropTypes.bool,
  value: PropTypes.string,
};

export default CustomTextInput;
