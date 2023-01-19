import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import CustomTextInput from './CustomTextInput';

const CustomNumericInput = ({ onChangeText, ...otherProps }) => {
  const handleChangeText = useCallback(
    newValue => {
      if (newValue === undefined || newValue === null || newValue === '') {
        onChangeText('');
      } else {
        const lastCharacter = newValue.slice(newValue.length - 1);

        // Case 1: Prevent typing hyphen or tab character
        if (lastCharacter === '-' || lastCharacter === ' ') return;

        let convertedValue = newValue;

        // Case 2: If typing comma character, convert into dot character
        if (newValue.includes(',')) {
          convertedValue = convertedValue.replace(/,/g, '.');
        }

        // Case 3: First character is dot
        if (newValue?.length === 1 && newValue === '.') {
          onChangeText('');
          return;
        }

        const regex = new RegExp('(^[0-9]+\\.[0-9]+$)|(^[0-9]+\\.?$)', 'g');
        const isValidNumber = regex.test(convertedValue);

        // Case 4: Typing valid number
        if (isValidNumber) {
          onChangeText(convertedValue);
        }
      }
    },
    [onChangeText],
  );

  return (
    <CustomTextInput
      onChangeText={handleChangeText}
      keyboardType="decimal-pad"
      {...otherProps}
    />
  );
};

CustomNumericInput.propTypes = {
  onChangeText: PropTypes.func,
};

CustomNumericInput.defaultProps = {
  onChangeText: () => {},
};

export default memo(CustomNumericInput);
