import React, { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import CustomTextInput from './CustomTextInput';
import { Image, TouchableOpacity } from 'react-native';
import { ICONS } from 'constants';
import RegexValue from '../../constants/constants';

const CustomPasswordInput = ({ onChangeText, ...otherProps }) => {
  const [isHiddenPassword, setIsHiddenPassword] = useState(true);

  const handleChangeText = useCallback(
    newValue => {
      if (newValue) {
        const regex = new RegExp(
          RegexValue.letterAndNumberAndSpecialCharacterRegex,
          'g',
        );
        const isValidNumber = regex.test(newValue);

        if (isValidNumber) {
          onChangeText(newValue);
        }
      } else {
        onChangeText('');
      }
    },
    [onChangeText],
  );

  const handleToggleDisplayPassword = () => {
    setIsHiddenPassword(!isHiddenPassword);
  };

  return (
    <CustomTextInput
      secureTextEntry={isHiddenPassword}
      onChangeText={handleChangeText}
      icons={
        <TouchableOpacity onPress={handleToggleDisplayPassword}>
          <Image source={isHiddenPassword ? ICONS.eyeSlash : ICONS.eye} />
        </TouchableOpacity>
      }
      {...otherProps}
    />
  );
};

CustomPasswordInput.propTypes = {
  onChangeText: PropTypes.func,
  label: PropTypes.string,
  error: PropTypes.bool,
  value: PropTypes.any,
};

CustomPasswordInput.defaultProps = {
  onChangeText: () => {},
};

export default memo(CustomPasswordInput);
