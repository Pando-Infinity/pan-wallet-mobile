import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { STRINGS, FONTS, COLOR } from 'constants';

const EditGasFee = ({ onPress, ...otherProps }) => {
  const { t: getLabel } = useTranslation();

  return (
    <TouchableOpacity onPress={onPress} {...otherProps}>
      <Text style={styles.editGasFee}>{getLabel(STRINGS.editGasFee)}</Text>
    </TouchableOpacity>
  );
};

EditGasFee.propTypes = {
  onPress: PropTypes.func,
};

export default EditGasFee;

const styles = StyleSheet.create({
  editGasFee: {
    ...FONTS.t12r,
    color: COLOR.termsColor,
  },
});
